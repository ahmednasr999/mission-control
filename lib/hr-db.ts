/**
 * lib/hr-db.ts
 * Read-only helpers for the HR page API routes.
 * Reads from job_pipeline and cv_history tables in mission-control.db.
 */

import Database from "better-sqlite3";

// Absolute path to ensure we always use the same DB file
const DB_PATH = "/root/.openclaw/workspace/mission-control/mission-control.db";

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: false });
    _db.pragma("journal_mode = WAL");
    // Ensure tables exist (idempotent)
    _db.exec(`
      CREATE TABLE IF NOT EXISTS job_pipeline (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company TEXT, role TEXT, location TEXT, link TEXT,
        jd_status TEXT, cv_status TEXT, status TEXT,
        ats_score INTEGER, next_action TEXT, salary TEXT, company_domain TEXT,
        updatedAt TEXT
      );
      CREATE TABLE IF NOT EXISTS cv_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        jobTitle TEXT NOT NULL,
        company TEXT NOT NULL,
        jobUrl TEXT,
        atsScore INTEGER,
        matchedKeywords TEXT,
        missingKeywords TEXT,
        pdfPath TEXT,
        status TEXT NOT NULL DEFAULT 'Generated',
        notes TEXT,
        createdAt TEXT NOT NULL
      );
    `);
  }
  return _db;
}

// ---- Job Pipeline row shape ----

export interface HRJobRow {
  id: number;
  company: string | null;
  role: string | null;
  location: string | null;
  link: string | null;
  status: string | null;
  ats_score: number | null;
  next_action: string | null;
  salary: string | null;
  company_domain: string | null;
  updatedAt: string | null;
}

/** Map raw status string to a canonical kanban column key */
export function mapStatusToColumn(
  status: string | null
): "identified" | "applied" | "interview" | "offer" | "closed" {
  const s = (status || "").toLowerCase().trim();
  if (s === "offer") return "offer";
  if (s === "interview" || s === "interviewing") return "interview";
  if (s === "applied" || s === "submitted") return "applied";
  if (s === "closed" || s === "rejected" || s === "withdrawn") return "closed";
  // "identified", "new", null / anything else → identified
  return "identified";
}

/** Get all jobs from the pipeline table */
export function getAllPipelineJobs(): HRJobRow[] {
  try {
    const db = getDb();
    return db
      .prepare(
        `SELECT id, company, role, location, link, status, ats_score,
                next_action, salary, company_domain, updatedAt
         FROM job_pipeline
         ORDER BY updatedAt DESC`
      )
      .all() as HRJobRow[];
  } catch {
    return [];
  }
}

/** Get closed jobs whose updatedAt is older than 30 days */
export function getArchivedJobs(): HRJobRow[] {
  try {
    const db = getDb();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);
    const cutoffStr = cutoff.toISOString();
    return db
      .prepare(
        `SELECT id, company, role, location, link, status, ats_score,
                next_action, salary, company_domain, updatedAt
         FROM job_pipeline
         WHERE LOWER(status) IN ('closed','rejected','withdrawn')
           AND (updatedAt IS NULL OR updatedAt < ?)
         ORDER BY updatedAt DESC`
      )
      .all(cutoffStr) as HRJobRow[];
  } catch {
    return [];
  }
}

// ---- CV History ----

export interface CVHistoryRow {
  id: number;
  jobTitle: string;
  company: string;
  atsScore: number | null;
  status: string;
  createdAt: string;
}

/** Get CV history from the cv_history table */
export function getCVHistoryFromDB(limit = 100): CVHistoryRow[] {
  try {
    const db = getDb();
    return db
      .prepare(
        `SELECT id, jobTitle, company, atsScore, status, createdAt
         FROM cv_history
         ORDER BY createdAt DESC
         LIMIT ?`
      )
      .all(limit) as CVHistoryRow[];
  } catch {
    return [];
  }
}
