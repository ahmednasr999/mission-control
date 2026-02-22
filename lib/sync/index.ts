/**
 * lib/sync/index.ts — Main sync orchestrator
 *
 * - On startup: full sync of all known memory files
 * - File watcher: incremental sync on file change (30s debounce)
 * - Cron fallback: every 5 minutes via setInterval
 * - Exports: syncAll(), syncFile(path), getSyncStatus()
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  parseActiveTasks,
  parseJobPipeline,
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

// Known static files to sync
const STATIC_FILES = [
  path.join(ROOT_DIR, 'MEMORY.md'),
  path.join(ROOT_DIR, 'GOALS.md'),
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
    return 0;
  }
}

/**
 * Sync all known memory files
 * Runs static files + all discovered daily notes
 */
export async function syncAll(): Promise<{ totalRows: number; filesProcessed: number; errors: string[] }> {
  console.log('[sync] Starting full sync...');
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
  console.log(`[sync] Full sync complete — ${filesProcessed} files, ${totalRows} rows, ${errors.length} errors`);

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
