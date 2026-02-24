/**
 * lib/ops-db.ts
 * Read-only helpers for the OPS page API routes.
 * Reads from the tasks table in mission-control.db.
 */

import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Absolute path to ensure we always use the same DB file
const DB_PATH = "/root/.openclaw/workspace/mission-control/mission-control.db";

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
  /** Raw DB status string (e.g. "To Do", "In Progress", "Blocked", "Done") */
  status?: string;
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
  if (s === "in progress" || s === "inprogress" || s === "my tasks" || s === "in-progress") return "inProgress";
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
    status: row.status || "To Do",
    blocker: row.blocker || undefined,
  };
}

/** Get a single task by id */
export function getTaskById(id: string | number): OpsTask | null {
  try {
    const db = getDb();
    const row = db.prepare(
      `SELECT id, title, description, assignee, status, priority, category, dueDate, completedDate, createdAt, blocker FROM tasks WHERE id = ?`
    ).get(id) as any;
    return row ? rowToTask(row) : null;
  } catch {
    return null;
  }
}

/** Get all tasks as an array */
export function getAllTasks(): OpsTask[] {
  try {
    const db = getDb();
    const rows = db.prepare(
      `SELECT id, title, description, assignee, status, priority, category, dueDate, completedDate, createdAt, blocker FROM tasks ORDER BY createdAt DESC`
    ).all() as any[];
    return rows.map(rowToTask);
  } catch {
    return [];
  }
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

// ---- Mutation helpers ----

export interface UpdateTaskFields {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string;
  category?: string;
  assignee?: string;
}

/** Update a task by id. Returns the updated task, or null if not found. */
export function updateTask(id: string | number, fields: UpdateTaskFields): OpsTask | null {
  const db = getDb();

  // Build SET clause dynamically (only for provided fields)
  const setClauses: string[] = [];
  const values: any[] = [];

  if (fields.title !== undefined) { setClauses.push("title = ?"); values.push(fields.title.trim()); }
  if (fields.description !== undefined) { setClauses.push("description = ?"); values.push(fields.description); }
  if (fields.status !== undefined) { setClauses.push("status = ?"); values.push(fields.status);
    // Auto-set completedDate when marking done
    if (["done", "completed"].includes(fields.status.toLowerCase())) {
      setClauses.push("completedDate = ?");
      values.push(new Date().toISOString());
    } else {
      setClauses.push("completedDate = ?");
      values.push(null);
    }
  }
  if (fields.priority !== undefined) { setClauses.push("priority = ?"); values.push(fields.priority); }
  if (fields.dueDate !== undefined) { setClauses.push("dueDate = ?"); values.push(fields.dueDate || null); }
  if (fields.category !== undefined) { setClauses.push("category = ?"); values.push(fields.category); }
  if (fields.assignee !== undefined) { setClauses.push("assignee = ?"); values.push(fields.assignee); }

  if (setClauses.length === 0) {
    // Nothing to update — just return current task
    const row = db.prepare(
      `SELECT id, title, description, assignee, status, priority, category, dueDate, completedDate, createdAt, blocker FROM tasks WHERE id = ?`
    ).get(id) as any;
    return row ? rowToTask(row) : null;
  }

  values.push(id);
  db.prepare(`UPDATE tasks SET ${setClauses.join(", ")} WHERE id = ?`).run(...values);

  const updated = db.prepare(
    `SELECT id, title, description, assignee, status, priority, category, dueDate, completedDate, createdAt, blocker FROM tasks WHERE id = ?`
  ).get(id) as any;
  return updated ? rowToTask(updated) : null;
}

/** Delete a task by id. Returns true if deleted. */
export function deleteTask(id: string | number): boolean {
  const db = getDb();
  const result = db.prepare(`DELETE FROM tasks WHERE id = ?`).run(id);
  return result.changes > 0;
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
