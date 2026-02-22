/**
 * watcher.ts — Chokidar file watcher for memory directory
 * Watches ~/.openclaw/workspace/memory/ for changes
 * 30-second debounce per file to avoid rapid re-syncs
 */

import chokidar, { FSWatcher } from 'chokidar';
import path from 'path';
import os from 'os';

const MEMORY_DIR = path.join(os.homedir(), '.openclaw', 'workspace', 'memory');
const ROOT_DIR = path.join(os.homedir(), '.openclaw', 'workspace');

const DEBOUNCE_MS = 15_000; // 15 seconds (Phase 2: tightened from 30s)

type SyncCallback = (filePath: string) => Promise<void> | void;

// Per-file debounce timers
const debounceTimers: Map<string, ReturnType<typeof setTimeout>> = new Map();

let watcher: FSWatcher | null = null;

/**
 * Start the chokidar file watcher
 * @param onFileChange - Callback invoked with file path when change is detected (after debounce)
 */
export function startWatcher(onFileChange: SyncCallback): FSWatcher {
  const watchPaths = [
    path.join(MEMORY_DIR, '**', '*.md'),
    path.join(ROOT_DIR, 'MEMORY.md'),
    path.join(ROOT_DIR, 'GOALS.md'),
  ];

  watcher = chokidar.watch(watchPaths, {
    persistent: true,
    ignoreInitial: true,       // don't fire for existing files on startup
    usePolling: false,
    awaitWriteFinish: {
      stabilityThreshold: 2000,
      pollInterval: 500,
    },
    ignored: [
      /node_modules/,
      /\.git/,
      /\.next/,
      /\.db$/,
      /mission-control-drafts/,
    ],
  });

  const handleChange = (filePath: string, event: string) => {
    console.log(`[watcher] ${event}: ${filePath}`);

    // Clear existing debounce for this file
    const existing = debounceTimers.get(filePath);
    if (existing) clearTimeout(existing);

    // Set new debounce
    const timer = setTimeout(async () => {
      debounceTimers.delete(filePath);
      console.log(`[watcher] Triggering sync for: ${filePath}`);
      try {
        await onFileChange(filePath);
      } catch (err) {
        console.error(`[watcher] Sync error for ${filePath}:`, err);
      }
    }, DEBOUNCE_MS);

    debounceTimers.set(filePath, timer);
  };

  watcher
    .on('add', (p) => handleChange(p, 'add'))
    .on('change', (p) => handleChange(p, 'change'))
    .on('error', (err) => console.error('[watcher] Error:', err))
    .on('ready', () => console.log('[watcher] Ready — watching memory files'));

  return watcher;
}

/**
 * Stop the watcher and clear all pending debounce timers
 */
export function stopWatcher(): void {
  // Clear all pending debounce timers
  debounceTimers.forEach((timer) => clearTimeout(timer));
  debounceTimers.clear();

  if (watcher) {
    watcher.close().then(() => console.log('[watcher] Stopped'));
    watcher = null;
  }
}

/**
 * Determine which memory files to watch based on naming conventions
 */
export function getWatchedFiles(): string[] {
  return [
    path.join(ROOT_DIR, 'MEMORY.md'),
    path.join(ROOT_DIR, 'GOALS.md'),
    path.join(MEMORY_DIR, 'active-tasks.md'),
    path.join(MEMORY_DIR, 'job-pipeline.md'),
    path.join(MEMORY_DIR, 'content-pipeline.md'),
    path.join(MEMORY_DIR, 'cv-history.md'),
    // YYYY-MM-DD.md files are watched by glob pattern
  ];
}

export { MEMORY_DIR, ROOT_DIR };
