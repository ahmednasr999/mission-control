-- Mission Control Sync Schema
-- New tables for synced data from OpenClaw memory files

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
