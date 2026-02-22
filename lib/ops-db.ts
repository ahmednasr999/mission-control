/**
 * lib/ops-db.ts
 * Read-only helpers for the OPS page API routes.
 * Reads from the tasks table in mission-control.db.
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "mission-control.db");

let _db: Database.Database | null = null;

function getDb(): Database.Database {
  if (!_db) {
    _db = new Database(DB_PATH, { readonly: false });
    _db.pragma("journal_mode = WAL");
    // Ensure tasks table exists (idempotent)
    _db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT,
        assignee TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'Inbox',
        priority TEXT NOT NULL DEFAULT 'Medium',
        category TEXT NOT NULL DEFAULT 'Task',
        dueDate TEXT,
        completedDate TEXT,
        relatedTo TEXT,
        createdAt TEXT NOT NULL
      );
    `);
    // Phase 2: Ensure blocker column exists (idempotent)
    try { _db.exec(`ALTER TABLE tasks ADD COLUMN blocker TEXT`); } catch { /* already exists */ }
  }
  return _db;
}

// ---- Task shape ----

export interface OpsTask {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  priority: "high" | "medium" | "low";
  category: string;
  dueDate?: string;
  completedDate?: string;
  createdAt: string;
  /** Phase 2: Optional blocker context — why this task is stuck */
  blocker?: string;
}

export interface OpsColumns {
  todo: OpsTask[];
  inProgress: OpsTask[];
  blocked: OpsTask[];
  done: OpsTask[];
}

/** Map raw DB status → kanban column key */
function mapStatus(status: string | null): keyof OpsColumns {
  const s = (status || "").toLowerCase().trim();
  if (s === "blocked") return "blocked";
  if (s === "in progress" || s === "my tasks" || s === "in-progress") return "inProgress";
  if (
    s === "completed" ||
    s === "done" ||
    s === "review"
  )
    return "done";
  // "Inbox", "To Do", "todo", or anything else → todo
  return "todo";
}

/** Normalise priority string to low/medium/high */
function mapPriority(p: string | null): "high" | "medium" | "low" {
  const v = (p || "medium").toLowerCase();
  if (v === "high" || v === "urgent" || v === "critical") return "high";
  if (v === "low") return "low";
  return "medium";
}

function rowToTask(row: any): OpsTask {
  return {
    id: String(row.id),
    title: row.title || "Untitled",
    description: row.description || undefined,
    assignee: row.assignee || "Unassigned",
    priority: mapPriority(row.priority),
    category: row.category || "Task",
    dueDate: row.dueDate || undefined,
    completedDate: row.completedDate || undefined,
    createdAt: row.createdAt || new Date().toISOString(),
    blocker: row.blocker || undefined,
  };
}

/** Get all tasks grouped by kanban column */
export function getAllTaskColumns(): OpsColumns {
  try {
    const db = getDb();
    const rows = db
      .prepare(
        `SELECT id, title, description, assignee, status, priority, category,
                dueDate, completedDate, createdAt, blocker
         FROM tasks
         ORDER BY createdAt DESC`
      )
      .all() as any[];

    const columns: OpsColumns = { todo: [], inProgress: [], blocked: [], done: [] };
    for (const row of rows) {
      const col = mapStatus(row.status);
      columns[col].push(rowToTask(row));
    }
    return columns;
  } catch {
    return { todo: [], inProgress: [], blocked: [], done: [] };
  }
}

/** Get done tasks whose completedDate is older than 7 days */
export function getArchivedTasks(): OpsTask[] {
  try {
    const db = getDb();
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 7);
    const cutoffStr = cutoff.toISOString();

    const rows = db
      .prepare(
        `SELECT id, title, description, assignee, status, priority, category,
                dueDate, completedDate, createdAt, blocker
         FROM tasks
         WHERE LOWER(status) IN ('completed', 'done', 'review')
           AND completedDate IS NOT NULL
           AND completedDate < ?
         ORDER BY completedDate DESC`
      )
      .all(cutoffStr) as any[];

    return rows.map(rowToTask);
  } catch {
    return [];
  }
}

// ---- Markdown fallback ----

const ACTIVE_TASKS_PATH = path.join(
  process.env.HOME || "/root",
  ".openclaw/workspace/memory/active-tasks.md"
);

interface ParsedSection {
  sectionKey: keyof OpsColumns;
  priority: "high" | "medium" | "low";
}

const SECTION_MAP: Record<string, ParsedSection> = {
  "🔴 urgent": { sectionKey: "todo", priority: "high" },
  "🟡 in progress": { sectionKey: "inProgress", priority: "medium" },
  "🟢 recurring": { sectionKey: "todo", priority: "low" },
  "✅ recently completed": { sectionKey: "done", priority: "medium" },
  "📋 backlog": { sectionKey: "todo", priority: "low" },
};

/** Parse active-tasks.md as fallback when DB is empty */
export function parseActiveTasksMd(): OpsColumns {
  const columns: OpsColumns = { todo: [], inProgress: [], blocked: [], done: [] };

  try {
    if (!fs.existsSync(ACTIVE_TASKS_PATH)) return columns;
    const text = fs.readFileSync(ACTIVE_TASKS_PATH, "utf-8");
    const lines = text.split("\n");

    let currentSection: ParsedSection | null = null;
    let currentTitle: string | null = null;
    let taskId = 1;

    for (const line of lines) {
      const trimmed = line.trim();

      // Section header (## emoji ...)
      if (trimmed.startsWith("## ")) {
        const heading = trimmed.replace("## ", "").toLowerCase();
        currentSection = null;
        for (const [key, val] of Object.entries(SECTION_MAP)) {
          if (heading.includes(key.replace(/[🔴🟡🟢✅📋]/g, "").trim())) {
            currentSection = val;
            break;
          }
          // match by emoji too
          if (heading.startsWith(key.split(" ")[0])) {
            currentSection = val;
            break;
          }
        }
        // Try direct match
        for (const [key, val] of Object.entries(SECTION_MAP)) {
          if (heading === key.toLowerCase()) {
            currentSection = val;
            break;
          }
        }
        currentTitle = null;
        continue;
      }

      if (!currentSection) continue;

      // Task title (### heading)
      if (trimmed.startsWith("### ")) {
        if (currentTitle) {
          // push previous
          columns[currentSection.sectionKey].push({
            id: `md-${taskId++}`,
            title: currentTitle,
            assignee: "Unassigned",
            priority: currentSection.priority,
            category: "Task",
            createdAt: new Date().toISOString(),
          });
        }
        currentTitle = trimmed.replace("### ", "");
        continue;
      }

      // Bullet point → treat as title if no ### found yet
      if (trimmed.startsWith("- ") && !currentTitle) {
        const bullet = trimmed.replace(/^- /, "").trim();
        if (bullet && !bullet.startsWith("**")) {
          columns[currentSection.sectionKey].push({
            id: `md-${taskId++}`,
            title: bullet,
            assignee: "Unassigned",
            priority: currentSection.priority,
            category: "Task",
            createdAt: new Date().toISOString(),
          });
        }
      }
    }

    // Push last title
    if (currentTitle && currentSection) {
      columns[currentSection.sectionKey].push({
        id: `md-${taskId++}`,
        title: currentTitle,
        assignee: "Unassigned",
        priority: currentSection.priority,
        category: "Task",
        createdAt: new Date().toISOString(),
      });
    }
  } catch {
    // silently return empty
  }

  return columns;
}
