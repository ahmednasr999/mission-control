import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "mission-control.db");

export function getDb() {
  return new Database(DB_PATH, { readonly: true });
}

// Goals
export function getGoals() {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM goals ORDER BY id DESC");
  return stmt.all();
}

// Job Pipeline
export function getJobPipeline() {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM job_pipeline ORDER BY updatedAt DESC");
  return stmt.all();
}

// Tasks
export function getTasks() {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM tasks ORDER BY createdAt DESC");
  return stmt.all();
}

// Memory Highlights
export function getMemoryHighlights() {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM memory_highlights ORDER BY updatedAt DESC");
  return stmt.all();
}

// Daily Notes
export function getDailyNotes() {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM daily_notes ORDER BY date DESC");
  return stmt.all();
}

// CV History
export function getCvHistory() {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM cv_history ORDER BY createdAt DESC");
  return stmt.all();
}

// Content Pipeline
export function getContentPipeline() {
  const db = getDb();
  const stmt = db.prepare("SELECT * FROM content_pipeline ORDER BY updatedAt DESC");
  return stmt.all();
}
