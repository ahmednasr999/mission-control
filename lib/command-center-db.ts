/**
 * lib/command-center-db.ts
 * Read-only helpers for Command Center API routes.
 * Reads from the sync-managed tables (job_pipeline, content_pipeline, goals)
 * that share the same mission-control.db as lib/db.ts.
 */

import Database from "better-sqlite3";

// Absolute path to ensure we always use the same DB file
const DB_PATH = "/root/.openclaw/workspace/mission-control/mission-control.db";

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: false });
    _db.pragma("journal_mode = WAL");
    // Ensure sync tables exist (idempotent)
    _db.exec(`
      CREATE TABLE IF NOT EXISTS job_pipeline (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT, role TEXT, location TEXT, link TEXT,
        jd_status TEXT, cv_status TEXT, status TEXT,
        ats_score INTEGER, updatedAt TEXT
      );
      CREATE TABLE IF NOT EXISTS content_pipeline (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stage TEXT, title TEXT, pillar TEXT, file_path TEXT,
        word_count INTEGER, scheduled_date TEXT, published_date TEXT,
        performance TEXT, updatedAt TEXT
      );
      CREATE TABLE IF NOT EXISTS goals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT, objective TEXT, status TEXT, deadline TEXT,
        progress INTEGER DEFAULT 0, updatedAt TEXT
      );
    `);
  }
  return _db;
}

// ---- Job Pipeline ----

export interface JobRow {
  id: number;
  company: string | null;
  role: string | null;
  status: string | null;
  ats_score: number | null;
  updatedAt: string | null;
}

export function getActiveJobs(limit = 4): JobRow[] {
  try {
    const db = getDb();
    return db
      .prepare(
        `SELECT id, company, role, status, ats_score, updatedAt
         FROM job_pipeline
         WHERE LOWER(status) != 'closed'
         ORDER BY updatedAt DESC
         LIMIT ?`
      )
      .all(limit) as JobRow[];
  } catch {
    return [];
  }
}

export function getActiveJobCount(): number {
  try {
    const db = getDb();
    const row = db
      .prepare(
        `SELECT COUNT(*) as cnt FROM job_pipeline WHERE LOWER(status) != 'closed'`
      )
      .get() as { cnt: number };
    return row?.cnt ?? 0;
  } catch {
    return 0;
  }
}

export function getRadarJobCount(): number {
  try {
    const db = getDb();
    const row = db
      .prepare(
        `SELECT COUNT(*) as cnt FROM job_pipeline WHERE LOWER(status) LIKE '%radar%'`
      )
      .get() as { cnt: number };
    return row?.cnt ?? 0;
  } catch {
    return 0;
  }
}

export function getAvgAtsScore(): number | null {
  try {
    const db = getDb();
    // First try job_pipeline table
    const row = db
      .prepare(
        `SELECT AVG(ats_score) as avg FROM job_pipeline
         WHERE ats_score IS NOT NULL AND LOWER(status) != 'closed'`
      )
      .get() as { avg: number | null };
    if (row?.avg != null) {
      return Math.round(row.avg);
    }
    // Fallback: try cv_history table for active jobs
    const cvRow = db
      .prepare(
        `SELECT AVG(atsScore) as avg FROM cv_history
         WHERE atsScore IS NOT NULL`
      )
      .get() as { avg: number | null };
    if (cvRow?.avg != null) {
      return Math.round(cvRow.avg);
    }
    return null;
  } catch {
    return null;
  }
}

// ---- Content Pipeline ----

export interface ContentRow {
  id: number;
  stage: string | null;
  title: string | null;
}

export function getContentDueCount(): number {
  try {
    const db = getDb();
    const row = db
      .prepare(
        `SELECT COUNT(*) as cnt FROM content_pipeline
         WHERE LOWER(stage) IN ('draft', 'review')`
      )
      .get() as { cnt: number };
    return row?.cnt ?? 0;
  } catch {
    return 0;
  }
}

export function getContentStageCounts(): {
  ideas: number;
  draft: number;
  review: number;
  scheduled: number;
  published: number;
} {
  try {
    const db = getDb();
    const rows = db
      .prepare(`SELECT stage, COUNT(*) as cnt FROM content_pipeline GROUP BY stage`)
      .all() as { stage: string; cnt: number }[];

    const result = { ideas: 0, draft: 0, review: 0, scheduled: 0, published: 0 };
    for (const r of rows) {
      const stage = (r.stage || "").toLowerCase();
      if (stage === "ideas" || stage === "idea") result.ideas += r.cnt;
      else if (stage === "draft") result.draft += r.cnt;
      else if (stage === "review") result.review += r.cnt;
      else if (stage === "scheduled") result.scheduled += r.cnt;
      else if (stage === "published") result.published += r.cnt;
    }
    return result;
  } catch {
    return { ideas: 0, draft: 0, review: 0, scheduled: 0, published: 0 };
  }
}

// ---- Goals ----

export interface GoalRow {
  id: number;
  category: string | null;
  objective: string | null;
  status: string | null;
  deadline: string | null;
  progress: number;
}

export function getAllGoals(): GoalRow[] {
  try {
    const db = getDb();
    return db
      .prepare(
        `SELECT id, category, objective, status, deadline, progress FROM goals ORDER BY id ASC`
      )
      .all() as GoalRow[];
  } catch {
    return [];
  }
}

// ---- Tasks (from main tables) ----

export function getOpenTaskCount(): number {
  try {
    const db = getDb();
    // tasks table is managed by lib/db.ts
    const row = db
      .prepare(
        `SELECT COUNT(*) as cnt FROM tasks WHERE LOWER(status) != 'done' AND LOWER(status) != 'completed'`
      )
      .get() as { cnt: number };
    return row?.cnt ?? 0;
  } catch {
    return 0;
  }
}

// ---- Memory Highlights ----

export interface MemoryHighlightRow {
  id: number;
  section: string | null;
  content: string | null;
  file_source: string | null;
  updatedAt: string | null;
}

export function getMemoryHighlights(): MemoryHighlightRow[] {
  try {
    const db = getDb();
    return db
      .prepare(
        `SELECT id, section, content, file_source, updatedAt FROM memory_highlights ORDER BY updatedAt DESC LIMIT 20`
      )
      .all() as MemoryHighlightRow[];
  } catch {
    return [];
  }
}
