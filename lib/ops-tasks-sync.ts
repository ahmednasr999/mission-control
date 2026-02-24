/**
 * lib/ops-tasks-sync.ts
 * Sync active-tasks.md to OPS tasks table
 * Maps markdown sections to task statuses
 */

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_PATH = "/root/.openclaw/workspace/mission-control/mission-control.db";
const TASKS_MD = "/root/.openclaw/workspace/memory/active-tasks.md";

// Map markdown headers to task statuses
const STATUS_MAP: Record<string, string> = {
  "📋 To Do": "ToDo",
  "🔄 In Progress": "InProgress",
  "⛔ Blocked": "Blocked",
  "✅ Done": "Done",
  // Legacy mappings (for backwards compatibility)
  "🔴 Urgent": "Urgent",
  "🟡 In Progress": "InProgress",
  "🟢 Recurring": "Recurring",
  "✅ Recently Completed": "Done",
  "📋 Backlog": "Backlog",
};

function getDb(): Database.Database | null {
  try {
    const db = new Database(DB_PATH);
    return db;
  } catch {
    return null;
  }
}

interface ParsedTask {
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  source: string;
}

function getPriority(status: string): string {
  switch (status) {
    case "Blocked":
    case "InProgress":
    case "Urgent":
      return "High";
    case "ToDo":
    case "Backlog":
      return "Medium";
    case "Done":
      return "Low";
    default:
      return "Medium";
  }
}

function parseActiveTasksMd(): ParsedTask[] {
  const tasks: ParsedTask[] = [];

  try {
    if (!fs.existsSync(TASKS_MD)) {
      console.log("[OPS Tasks Sync] File not found:", TASKS_MD);
      return [];
    }

    const content = fs.readFileSync(TASKS_MD, "utf-8");
    const lines = content.split("\n");

    let currentStatus = "Backlog"; // default
    let currentTaskTitle = "";
    let currentTaskDesc: string[] = [];
    let inTask = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Check for section header (e.g., "## 🔴 Urgent")
      const statusMatch = line.match(/^##\s+(.+)$/);
      if (statusMatch) {
        // Save previous task if any
        if (inTask && currentTaskTitle) {
          tasks.push({
            title: currentTaskTitle.trim(),
            description: currentTaskDesc.join("\n").trim(),
            status: currentStatus,
            priority: getPriority(currentStatus),
            category: "Task",
            source: "active-tasks.md",
          });
        }

        // Set new status
        const header = statusMatch[1].trim();
        currentStatus = STATUS_MAP[header] || "ToDo";
        inTask = false;
        currentTaskTitle = "";
        currentTaskDesc = [];
        continue;
      }

      // Check for task header (e.g., "### Delphi Consulting Interview Prep")
      const taskMatch = line.match(/^###\s+(.+)$/);
      if (taskMatch) {
        // Save previous task if any
        if (inTask && currentTaskTitle) {
          tasks.push({
            title: currentTaskTitle.trim(),
            description: currentTaskDesc.join("\n").trim(),
            status: currentStatus,
            priority: getPriority(currentStatus),
            category: "Task",
            source: "active-tasks.md",
          });
        }

        currentTaskTitle = taskMatch[1].trim();
        currentTaskDesc = [];
        inTask = true;
        continue;
      }

      // Collect description lines
      if (inTask && line.startsWith("- ")) {
        currentTaskDesc.push(line);
      }
    }

    // Don't forget the last task
    if (inTask && currentTaskTitle) {
      tasks.push({
        title: currentTaskTitle.trim(),
        description: currentTaskDesc.join("\n").trim(),
        status: currentStatus,
        priority: getPriority(currentStatus),
        category: "Task",
        source: "active-tasks.md",
      });
    }

    return tasks;
  } catch (err) {
    console.error("[OPS Tasks Sync] Error parsing:", err);
    return [];
  }
}

function syncTasksToDb(tasks: ParsedTask[]): number {
  const db = getDb();
  if (!db) {
    console.error("[OPS Tasks Sync] Could not connect to DB");
    return 0;
  }

  let synced = 0;

  // First, clear old tasks from active-tasks.md (those with source='active-tasks.md')
  db.prepare("DELETE FROM tasks WHERE source = 'active-tasks.md'").run();

  // Insert new tasks
  const insert = db.prepare(`
    INSERT INTO tasks (title, description, assignee, status, priority, category, source, createdAt)
    VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
  `);

  for (const task of tasks) {
    try {
      insert.run(
        task.title,
        task.description,
        "Ahmed", // default assignee
        task.status,
        task.priority,
        task.category,
        task.source
      );
      synced++;
    } catch (err) {
      console.error("[OPS Tasks Sync] Error inserting task:", task.title, err);
    }
  }

  db.close();
  return synced;
}

export function syncActiveTasksToOps(): { success: boolean; count: number; error?: string } {
  try {
    const tasks = parseActiveTasksMd();
    if (tasks.length === 0) {
      return { success: true, count: 0 };
    }
    const synced = syncTasksToDb(tasks);
    console.log(`[OPS Tasks Sync] Synced ${synced} tasks to OPS`);
    return { success: true, count: synced };
  } catch (err) {
    const error = err instanceof Error ? err.message : "Unknown error";
    console.error("[OPS Tasks Sync] Error:", error);
    return { success: false, count: 0, error };
  }
}

// Run if called directly
if (require.main === module) {
  const result = syncActiveTasksToOps();
  console.log("Result:", JSON.stringify(result));
  process.exit(result.success ? 0 : 1);
}
