/**
 * writer.ts — SQLite writer for sync engine
 * Uses better-sqlite3 (synchronous API).
 * Upsert pattern: never deletes existing data, only adds/updates.
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import {
  ParsedTask,
  ParsedJobPipeline,
  ParsedContentPipeline,
  ParsedGoal,
  ParsedMemoryHighlight,
  ParsedDailyNote,
  ParsedCVHistory,
} from './parser';

// ---- DB Setup ----

// Absolute path to ensure we always use the same DB file
const DB_PATH = '/root/.openclaw/workspace/mission-control/mission-control.db';

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH);
    _db.pragma('journal_mode = WAL');
    _db.pragma('foreign_keys = ON');
    initSchema(_db);
  }
  return _db;
}

function initSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS job_pipeline (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company TEXT,
      role TEXT,
      location TEXT,
      link TEXT,
      jd_status TEXT,
      cv_status TEXT,
      status TEXT,
      ats_score INTEGER,
      applied_date TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS content_pipeline (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stage TEXT,
      title TEXT,
      pillar TEXT,
      file_path TEXT,
      word_count INTEGER,
      scheduled_date TEXT,
      published_date TEXT,
      performance TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT,
      objective TEXT,
      status TEXT,
      deadline TEXT,
      progress INTEGER DEFAULT 0,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS memory_highlights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section TEXT,
      content TEXT,
      file_source TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS daily_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT UNIQUE,
      content TEXT,
      summary TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS sync_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      file TEXT,
      status TEXT,
      rows_affected INTEGER,
      error TEXT,
      syncedAt TEXT DEFAULT (datetime('now'))
    );
  `);
}

// ---- Cairo Timestamp ----

export function cairoNow(): string {
  return new Date().toLocaleString('en-CA', {
    timeZone: 'Africa/Cairo',
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).replace(', ', 'T');
}

// ---- Sync Log ----

export function logSync(file: string, status: string, rowsAffected: number, error: string | null = null): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO sync_log (file, status, rows_affected, error, syncedAt)
    VALUES (?, ?, ?, ?, ?)
  `).run(file, status, rowsAffected, error, cairoNow());
}

// ---- Writers ----

/**
 * Write tasks from active-tasks.md
 * Strategy: Clear all rows from this source, then re-insert.
 * We track by (title, source) — if title already exists, update it.
 */
export function writeTasks(tasks: ParsedTask[]): number {
  const db = getDb();
  const now = cairoNow();
  let count = 0;

  // Ensure source column exists on tasks table
  try {
    db.exec(`ALTER TABLE tasks ADD COLUMN source TEXT`);
  } catch {
    // Column already exists
  }

  // Upsert by title + source
  const upsert = db.prepare(`
    INSERT INTO tasks (title, description, assignee, status, priority, category, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT DO NOTHING
  `);

  const updateStmt = db.prepare(`
    UPDATE tasks SET status = ?, priority = ?, description = ?
    WHERE title = ?
  `);

  const existing = db.prepare(`SELECT id, title FROM tasks WHERE title = ?`);

  for (const task of tasks) {
    const found = existing.get(task.title) as any;
    if (found) {
      updateStmt.run(task.status, task.priority, task.description, task.title);
    } else {
      upsert.run(task.title, task.description, 'NASR', task.status, task.priority, task.category, now);
      count++;
    }
  }

  return count;
}

/**
 * Write job pipeline entries from GOALS.md
 * Strategy: Upsert by (company, role) composite key
 */
export function writeJobPipeline(jobs: ParsedJobPipeline[]): number {
  const db = getDb();
  const now = cairoNow();
  let count = 0;

  const existing = db.prepare(`SELECT id FROM job_pipeline WHERE company = ? AND role = ?`);
  const insert = db.prepare(`
    INSERT INTO job_pipeline (company, role, location, link, jd_status, cv_status, status, ats_score, applied_date, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const update = db.prepare(`
    UPDATE job_pipeline
    SET location = ?, link = ?, jd_status = ?, cv_status = ?, status = ?, ats_score = ?, applied_date = ?, updatedAt = ?
    WHERE company = ? AND role = ?
  `);

  for (const job of jobs) {
    const found = existing.get(job.company, job.role) as any;
    if (found) {
      update.run(job.location, job.link, job.jd_status, job.cv_status, job.status, job.ats_score, job.applied_date || null, now, job.company, job.role);
    } else {
      insert.run(job.company, job.role, job.location, job.link, job.jd_status, job.cv_status, job.status, job.ats_score, job.applied_date || null, now);
      count++;
    }
  }

  return count;
}

/**
 * Write content pipeline from content-pipeline.md
 * Strategy: Upsert by (stage, title)
 */
export function writeContentPipeline(items: ParsedContentPipeline[]): number {
  const db = getDb();
  const now = cairoNow();
  let count = 0;

  const existing = db.prepare(`SELECT id FROM content_pipeline WHERE stage = ? AND title = ?`);
  const insert = db.prepare(`
    INSERT INTO content_pipeline (stage, title, pillar, file_path, word_count, scheduled_date, published_date, performance, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const update = db.prepare(`
    UPDATE content_pipeline
    SET pillar = ?, file_path = ?, word_count = ?, scheduled_date = ?, published_date = ?, performance = ?, updatedAt = ?
    WHERE stage = ? AND title = ?
  `);

  for (const item of items) {
    const found = existing.get(item.stage, item.title) as any;
    if (found) {
      update.run(item.pillar, item.file_path, item.word_count, item.scheduled_date, item.published_date, item.performance, now, item.stage, item.title);
    } else {
      insert.run(item.stage, item.title, item.pillar, item.file_path, item.word_count, item.scheduled_date, item.published_date, item.performance, now);
      count++;
    }
  }

  return count;
}

/**
 * Write goals from GOALS.md
 * Strategy: Upsert by (category, objective)
 */
export function writeGoals(goals: ParsedGoal[]): number {
  const db = getDb();
  const now = cairoNow();
  let count = 0;

  const existing = db.prepare(`SELECT id FROM goals WHERE category = ? AND objective = ?`);
  const insert = db.prepare(`
    INSERT INTO goals (category, objective, status, deadline, progress, updatedAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const update = db.prepare(`
    UPDATE goals SET status = ?, deadline = ?, progress = ?, updatedAt = ?
    WHERE category = ? AND objective = ?
  `);

  for (const goal of goals) {
    const found = existing.get(goal.category, goal.objective) as any;
    if (found) {
      update.run(goal.status, goal.deadline, goal.progress, now, goal.category, goal.objective);
    } else {
      insert.run(goal.category, goal.objective, goal.status, goal.deadline, goal.progress, now);
      count++;
    }
  }

  return count;
}

/**
 * Write memory highlights from MEMORY.md
 * Strategy: Clear highlights for this file_source, then re-insert
 * (since content can change significantly between syncs)
 */
export function writeMemoryHighlights(highlights: ParsedMemoryHighlight[], fileSource: string): number {
  const db = getDb();
  const now = cairoNow();

  // Delete old entries for this file source
  db.prepare(`DELETE FROM memory_highlights WHERE file_source = ?`).run(fileSource);

  const insert = db.prepare(`
    INSERT INTO memory_highlights (section, content, file_source, updatedAt)
    VALUES (?, ?, ?, ?)
  `);

  for (const h of highlights) {
    insert.run(h.section, h.content, h.file_source, now);
  }

  return highlights.length;
}

/**
 * Write daily note — upsert by date (UNIQUE constraint)
 */
export function writeDailyNote(note: ParsedDailyNote): number {
  if (!note.date) return 0;

  const db = getDb();
  const now = cairoNow();

  db.prepare(`
    INSERT INTO daily_notes (date, content, summary, updatedAt)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET
      content = excluded.content,
      summary = excluded.summary,
      updatedAt = excluded.updatedAt
  `).run(note.date, note.content, note.summary, now);

  return 1;
}

/**
 * Write CV history entries — supplement existing cv_history table
 * Upsert by (jobTitle, company)
 */
export function writeCVHistory(entries: ParsedCVHistory[]): number {
  const db = getDb();
  const now = cairoNow();
  let count = 0;

  const existing = db.prepare(`SELECT id FROM cv_history WHERE jobTitle = ? AND company = ?`);
  const insert = db.prepare(`
    INSERT INTO cv_history (jobTitle, company, atsScore, status, notes, createdAt)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const update = db.prepare(`
    UPDATE cv_history SET atsScore = ?, status = ?, notes = ?
    WHERE jobTitle = ? AND company = ?
  `);

  for (const entry of entries) {
    if (!entry.jobTitle || !entry.company) continue;
    const found = existing.get(entry.jobTitle, entry.company) as any;
    if (found) {
      update.run(entry.atsScore, entry.status, entry.notes, entry.jobTitle, entry.company);
    } else {
      insert.run(entry.jobTitle, entry.company, entry.atsScore, entry.status || 'Generated', entry.notes, now);
      count++;
    }
  }

  return count;
}

// ---- Row Count Helpers ----

export function getRowCounts(): Record<string, number> {
  const db = getDb();
  const tables = ['job_pipeline', 'content_pipeline', 'goals', 'memory_highlights', 'daily_notes', 'tasks', 'cv_history', 'sync_log'];
  const counts: Record<string, number> = {};

  for (const table of tables) {
    try {
      const result = db.prepare(`SELECT COUNT(*) as cnt FROM ${table}`).get() as any;
      counts[table] = result?.cnt ?? 0;
    } catch {
      counts[table] = -1;
    }
  }

  return counts;
}

export function getLastSyncPerFile(): Array<{ file: string; status: string; rows_affected: number; syncedAt: string }> {
  const db = getDb();
  return db.prepare(`
    SELECT file, status, rows_affected, syncedAt
    FROM sync_log
    WHERE id IN (
      SELECT MAX(id) FROM sync_log GROUP BY file
    )
    ORDER BY syncedAt DESC
  `).all() as any[];
}
