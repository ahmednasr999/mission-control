/**
 * lib/sync/index.ts — Main sync orchestrator
 *
 * - On startup: full sync of all known memory files
 * - File watcher: incremental sync on file change (15s debounce)
 * - Cron fallback: every 5 minutes via setInterval
 * - Exports: syncAll(), syncFile(path), getSyncStatus()
 *
 * Phase 2 additions:
 * - Sync failure logging → /workspace/memory/sync-failures.log
 * - Telegram alert stub for sync failures > 5min
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  parseActiveTasks,
  parseJobPipeline,
  parseJobApplicationTracker,
  parseContentPipeline,
  parseGoals,
  parseMemoryHighlights,
  parseDailyNote,
  parseCVHistory,
} from './parser';
import {
  writeTasks,
  writeJobPipeline,
  writeContentPipeline,
  writeGoals,
  writeMemoryHighlights,
  writeDailyNote,
  writeCVHistory,
  logSync,
  getRowCounts,
  getLastSyncPerFile,
  cairoNow,
} from './writer';
import { startWatcher, stopWatcher, MEMORY_DIR, ROOT_DIR } from './watcher';

// ---- Constants ----

const CRON_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const SYNC_FAILURE_ALERT_MS = 5 * 60 * 1000; // alert if no sync for 5 minutes

// ---- Sync Failure Logging ----

const SYNC_FAILURES_LOG = path.join(
  os.homedir(),
  '.openclaw', 'workspace', 'memory', 'sync-failures.log'
);

/**
 * Log a sync failure to the dedicated sync-failures.log file.
 * Phase 2: Provides a dedicated audit trail for sync issues.
 */
function logSyncFailure(message: string): void {
  try {
    const timestamp = new Date().toLocaleString('en-GB', {
      timeZone: 'Africa/Cairo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const logEntry = `[${timestamp} CAI] ${message}\n`;
    fs.appendFileSync(SYNC_FAILURES_LOG, logEntry, 'utf-8');
  } catch (err) {
    // Don't let log failure cascade
    console.error('[sync] Failed to write sync-failures.log:', err);
  }
}

/**
 * Telegram alert — fires when sync has been failing for > 5 minutes.
 * Sends actual Telegram message to user's chat.
 */
async function sendTelegramAlert(message: string): Promise<void> {
  try {
    // Log to file first (audit trail)
    const alertPath = path.join(
      os.homedir(),
      '.openclaw', 'workspace', 'memory', 'sync-telegram-alerts.log'
    );
    const timestamp = new Date().toLocaleString('en-GB', {
      timeZone: 'Africa/Cairo',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
    fs.appendFileSync(
      alertPath,
      `[${timestamp} CAI] TELEGRAM_SENT: ${message}\n`,
      'utf-8'
    );

    // Send actual Telegram message using OpenClaw CLI
    const { execSync } = require('child_process');
    const escapedMessage = message.replace(/"/g, '\\"');
    execSync(
      `openclaw message send --channel telegram --target 866838380 --message "${escapedMessage}"`,
      { stdio: 'ignore', timeout: 10000 }
    );
    console.warn(`[sync] Telegram alert sent: ${message}`);
  } catch (err) {
    console.error('[sync] Failed to send Telegram alert:', err);
    // Don't throw — sync should continue even if alert fails
  }
}

// Track last successful sync time for Telegram alert checks
let lastSuccessfulSyncTime: number = Date.now();

// Known static files to sync
const STATIC_FILES = [
  path.join(ROOT_DIR, 'MEMORY.md'),
  path.join(ROOT_DIR, 'GOALS.md'),
  path.join(ROOT_DIR, 'job-application-tracker.md'),
  path.join(MEMORY_DIR, 'active-tasks.md'),
  path.join(MEMORY_DIR, 'content-pipeline.md'),
  path.join(MEMORY_DIR, 'cv-history.md'),
];

// ---- State ----

let cronTimer: ReturnType<typeof setInterval> | null = null;
let isRunning = false;
let lastFullSync: string | null = null;

// ---- Core Sync Functions ----

/**
 * Read a file safely — returns null if file doesn't exist or can't be read
 */
function readFileSafe(filePath: string): string | null {
  try {
    if (!fs.existsSync(filePath)) {
      console.warn(`[sync] File not found: ${filePath}`);
      return null;
    }
    return fs.readFileSync(filePath, 'utf-8');
  } catch (err) {
    console.error(`[sync] Error reading ${filePath}:`, err);
    return null;
  }
}

/**
 * Discover all YYYY-MM-DD.md files in the memory directory
 */
function discoverDailyNotes(): string[] {
  try {
    if (!fs.existsSync(MEMORY_DIR)) return [];
    const files = fs.readdirSync(MEMORY_DIR);
    return files
      .filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
      .map(f => path.join(MEMORY_DIR, f));
  } catch (err) {
    console.error('[sync] Error discovering daily notes:', err);
    return [];
  }
}

/**
 * Sync a single file based on its name/path
 * Returns number of rows affected
 */
export async function syncFile(filePath: string): Promise<number> {
  const fileName = path.basename(filePath);
  const parentDir = path.basename(path.dirname(filePath));
  
  console.log(`[sync] Syncing: ${filePath}`);

  const content = readFileSafe(filePath);
  if (content === null) {
    logSync(fileName, 'skipped', 0, 'File not found or unreadable');
    return 0;
  }

  let rows = 0;

  try {
    // active-tasks.md → tasks
    if (fileName === 'active-tasks.md') {
      const parsed = parseActiveTasks(content);
      rows = writeTasks(parsed);
      logSync(fileName, 'ok', rows);
      return rows;
    }

    // content-pipeline.md → content_pipeline
    if (fileName === 'content-pipeline.md') {
      const parsed = parseContentPipeline(content);
      rows = writeContentPipeline(parsed);
      logSync(fileName, 'ok', rows);
      return rows;
    }

    // cv-history.md → cv_history
    if (fileName === 'cv-history.md') {
      const parsed = parseCVHistory(content);
      rows = writeCVHistory(parsed);
      logSync(fileName, 'ok', rows);
      return rows;
    }

    // job-application-tracker.md → job_pipeline (consolidated tracker)
    if (fileName === 'job-application-tracker.md') {
      const parsed = parseJobApplicationTracker(content);
      rows = writeJobPipeline(parsed);
      logSync(fileName, 'ok', rows);
      return rows;
    }

    // GOALS.md → goals + job_pipeline
    if (fileName === 'GOALS.md') {
      const parsedGoals = parseGoals(content);
      const goalsRows = writeGoals(parsedGoals);

      const parsedJobs = parseJobPipeline(content);
      const jobRows = writeJobPipeline(parsedJobs);

      rows = goalsRows + jobRows;
      logSync(fileName, 'ok', rows);
      return rows;
    }

    // MEMORY.md → memory_highlights
    if (fileName === 'MEMORY.md') {
      const parsed = parseMemoryHighlights(content, 'MEMORY.md');
      rows = writeMemoryHighlights(parsed, 'MEMORY.md');
      logSync(fileName, 'ok', rows);
      return rows;
    }

    // YYYY-MM-DD.md → daily_notes
    if (/^\d{4}-\d{2}-\d{2}\.md$/.test(fileName)) {
      const parsed = parseDailyNote(content, filePath);
      rows = writeDailyNote(parsed);
      logSync(fileName, 'ok', rows);
      return rows;
    }

    // job-pipeline.md → job_pipeline (if it exists as a standalone file)
    if (fileName === 'job-pipeline.md') {
      const parsed = parseJobPipeline(content);
      rows = writeJobPipeline(parsed);
      logSync(fileName, 'ok', rows);
      return rows;
    }

    console.warn(`[sync] Unknown file type, skipping: ${fileName}`);
    logSync(fileName, 'skipped', 0, 'Unknown file type');
    return 0;

  } catch (err: any) {
    const errMsg = err?.message || String(err);
    console.error(`[sync] Error syncing ${fileName}:`, errMsg);
    logSync(fileName, 'error', 0, errMsg);
    logSyncFailure(`syncFile error — ${fileName}: ${errMsg}`);
    return 0;
  }
}

/**
 * Sync all known memory files
 * Runs static files + all discovered daily notes
 */
export async function syncAll(): Promise<{ totalRows: number; filesProcessed: number; errors: string[] }> {
  console.log('[sync] Starting full sync...');
  
  // Update timestamp at START to prevent false alerts during sync
  lastSuccessfulSyncTime = Date.now();
  
  const errors: string[] = [];
  let totalRows = 0;
  let filesProcessed = 0;

  // Sync static files
  for (const filePath of STATIC_FILES) {
    try {
      const rows = await syncFile(filePath);
      totalRows += rows;
      filesProcessed++;
    } catch (err: any) {
      errors.push(`${path.basename(filePath)}: ${err?.message || err}`);
    }
  }

  // Sync all daily notes
  const dailyNotes = discoverDailyNotes();
  for (const filePath of dailyNotes) {
    try {
      const rows = await syncFile(filePath);
      totalRows += rows;
      filesProcessed++;
    } catch (err: any) {
      errors.push(`${path.basename(filePath)}: ${err?.message || err}`);
    }
  }

  lastFullSync = cairoNow();
  lastSuccessfulSyncTime = Date.now();
  console.log(`[sync] Full sync complete — ${filesProcessed} files, ${totalRows} rows, ${errors.length} errors`);

  if (errors.length > 0) {
    logSyncFailure(`syncAll completed with ${errors.length} error(s): ${errors.join(' | ')}`);
  }

  return { totalRows, filesProcessed, errors };
}

/**
 * Get current sync status for API endpoint
 */
export function getSyncStatus() {
  const rowCounts = getRowCounts();
  const lastSyncPerFile = getLastSyncPerFile();

  return {
    status: isRunning ? 'running' : 'idle',
    lastFullSync,
    cronIntervalMs: CRON_INTERVAL_MS,
    rowCounts,
    files: lastSyncPerFile.map(f => ({
      name: f.file,
      rows: f.rows_affected,
      status: f.status,
      syncedAt: f.syncedAt,
    })),
  };
}

// ---- Lifecycle ----

/**
 * Initialize the sync engine:
 * 1. Run full sync immediately
 * 2. Start file watcher
 * 3. Start cron fallback
 */
export async function initSync(): Promise<void> {
  if (isRunning) {
    console.warn('[sync] Already running, skipping init');
    return;
  }

  isRunning = true;
  console.log('[sync] Initializing sync engine...');

  // 1. Full sync on startup
  await syncAll();

  // 2. File watcher — incremental sync on change
  startWatcher(async (filePath: string) => {
    console.log(`[sync] File changed: ${filePath}`);
    await syncFile(filePath);
  });

  // 3. Cron fallback — every 5 minutes
  cronTimer = setInterval(async () => {
    console.log('[sync] Cron sync triggered');

    // Phase 2: Check if sync has been failing for > 5 minutes
    // Only alert if we've actually completed at least one sync since startup
    if (lastFullSync) {
      const msSinceLastSync = Date.now() - lastSuccessfulSyncTime;
      if (msSinceLastSync > SYNC_FAILURE_ALERT_MS) {
        const minutesAgo = Math.round(msSinceLastSync / 60_000);
        const alertMsg = `Sync stale — last successful sync was ${minutesAgo} minute(s) ago`;
        logSyncFailure(alertMsg);
        await sendTelegramAlert(`⚠️ Mission Control sync alert: ${alertMsg}`);
      }
    }

    await syncAll();
  }, CRON_INTERVAL_MS);

  console.log('[sync] Sync engine initialized');
}

/**
 * Shutdown the sync engine cleanly
 */
export function shutdownSync(): void {
  if (cronTimer) {
    clearInterval(cronTimer);
    cronTimer = null;
  }
  stopWatcher();
  isRunning = false;
  console.log('[sync] Sync engine shut down');
}

// Auto-initialize in server context (Next.js)
// Guard against multiple initializations via module-level singleton
if (typeof globalThis !== 'undefined') {
  const g = globalThis as any;
  if (!g.__syncEngineInitialized) {
    g.__syncEngineInitialized = true;
    // Defer to avoid blocking module load
    setImmediate(() => {
      initSync().catch(err => console.error('[sync] Init error:', err));
    });
  }
}
