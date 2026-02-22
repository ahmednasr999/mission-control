/**
 * lib/marketing-db.ts
 * Read-only helpers for the Marketing page API routes.
 * Reads from content_pipeline table in mission-control.db.
 * Falls back to parsing ~/.openclaw/workspace/memory/content-pipeline.md
 */

import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

// Absolute path to ensure we always use the same DB file
const DB_PATH = "/root/.openclaw/workspace/mission-control/mission-control.db";
const PIPELINE_MD = path.join(
  process.env.HOME || "/root",
  ".openclaw/workspace/memory/content-pipeline.md"
);

// ---- ContentItem shape ----

export interface ContentItem {
  id: string | number;
  title: string;
  pillar: string;
  wordCount?: number;
  assignee?: string;
  date: string;
  file?: string;
  performance?: string;
  platform?: string;
}

// ---- Cairo timezone helpers ----

/** Get current date in Cairo timezone (UTC+2/+3 DST) */
function nowCairo(): Date {
  // Use toLocaleString to get Cairo time offset
  const cairoStr = new Date().toLocaleString("en-US", {
    timeZone: "Africa/Cairo",
  });
  return new Date(cairoStr);
}

/** Return ISO string for 30 days ago in Cairo time */
function thirtyDaysAgoCairo(): Date {
  const d = nowCairo();
  d.setDate(d.getDate() - 30);
  return d;
}

// ---- DB access ----

let _db: Database.Database | null = null;

function getDb(): Database.Database | null {
  try {
    if (_db) return _db;
    if (!fs.existsSync(DB_PATH)) return null;
    _db = new Database(DB_PATH, { readonly: true });
    _db.pragma("journal_mode = WAL");
    return _db;
  } catch {
    return null;
  }
}

// ---- DB row shape ----

interface ContentPipelineRow {
  id: number;
  stage: string | null;
  title: string | null;
  pillar: string | null;
  file_path: string | null;
  word_count: number | null;
  scheduled_date: string | null;
  published_date: string | null;
  performance: string | null;
  assignee: string | null;
  platform: string | null;
  updatedAt: string | null;
}

function rowToContentItem(row: ContentPipelineRow): ContentItem {
  return {
    id: row.id,
    title: row.title || "Untitled",
    pillar: row.pillar || "",
    wordCount: row.word_count ?? undefined,
    assignee: row.assignee ?? undefined,
    date:
      row.scheduled_date ||
      row.published_date ||
      row.updatedAt ||
      "",
    file: row.file_path ?? undefined,
    performance: row.performance ?? undefined,
    platform: row.platform ?? undefined,
  };
}

/** Map stage string to canonical column key */
export function mapStageToColumn(
  stage: string | null
): "ideas" | "draft" | "review" | "scheduled" | "published" {
  const s = (stage || "").toLowerCase().trim();
  if (s.includes("publish")) return "published";
  if (s.includes("schedul")) return "scheduled";
  if (s.includes("review")) return "review";
  if (s.includes("draft")) return "draft";
  return "ideas";
}

// ---- DB queries ----

export function getAllContentFromDB(): ContentPipelineRow[] {
  try {
    const db = getDb();
    if (!db) return [];
    return db
      .prepare(
        `SELECT id, stage, title, pillar, file_path, word_count,
                scheduled_date, published_date, performance,
                assignee, platform, updatedAt
         FROM content_pipeline
         ORDER BY id ASC`
      )
      .all() as ContentPipelineRow[];
  } catch {
    return [];
  }
}

export function getArchivedContentFromDB(): ContentPipelineRow[] {
  try {
    const db = getDb();
    if (!db) return [];
    const cutoff = thirtyDaysAgoCairo().toISOString();
    return db
      .prepare(
        `SELECT id, stage, title, pillar, file_path, word_count,
                scheduled_date, published_date, performance,
                assignee, platform, updatedAt
         FROM content_pipeline
         WHERE LOWER(stage) LIKE '%publish%'
           AND (published_date IS NOT NULL AND published_date < ?)
         ORDER BY published_date DESC`
      )
      .all(cutoff) as ContentPipelineRow[];
  } catch {
    return [];
  }
}

// ---- Markdown fallback parser ----

/**
 * Parse content-pipeline.md sections into ContentItem arrays grouped by column.
 * Sections: ## 💡 Ideas, ## ✍️ In Draft, ## 👀 In Review, ## 📅 Scheduled, ## ✅ Published
 */
export function parseContentPipelineMd(): {
  ideas: ContentItem[];
  draft: ContentItem[];
  review: ContentItem[];
  scheduled: ContentItem[];
  published: ContentItem[];
} {
  const empty = {
    ideas: [] as ContentItem[],
    draft: [] as ContentItem[],
    review: [] as ContentItem[],
    scheduled: [] as ContentItem[],
    published: [] as ContentItem[],
  };

  try {
    if (!fs.existsSync(PIPELINE_MD)) return empty;
    const content = fs.readFileSync(PIPELINE_MD, "utf-8");

    // Split into sections by ## headers
    const sectionRegex = /^## (.+)$/m;
    const chunks = content.split(/^## /m).filter(Boolean);

    let idCounter = 1;

    for (const chunk of chunks) {
      const lines = chunk.split("\n");
      const header = lines[0].trim();
      const body = lines.slice(1).join("\n");

      const colKey = headerToColumn(header);
      if (!colKey) continue;

      const rows = parseMarkdownTable(body);

      for (const row of rows) {
        const item = rowToItem(row, colKey, idCounter++);
        if (item) {
          empty[colKey].push(item);
        }
      }
    }

    return empty;
  } catch {
    return empty;
  }
}

function headerToColumn(
  header: string
): "ideas" | "draft" | "review" | "scheduled" | "published" | null {
  const h = header.toLowerCase();
  if (h.includes("idea")) return "ideas";
  if (h.includes("draft")) return "draft";
  if (h.includes("review")) return "review";
  if (h.includes("schedul")) return "scheduled";
  if (h.includes("published") || h.includes("publish")) return "published";
  return null;
}

function parseMarkdownTable(body: string): Record<string, string>[] {
  const lines = body
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("|"));

  if (lines.length < 2) return [];

  // First line is headers
  const headers = lines[0]
    .split("|")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);

  const results: Record<string, string>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    // Skip separator lines (---|---|...)
    if (/^[\|\-: ]+$/.test(line)) continue;

    const cells = line
      .split("|")
      .map((c) => c.trim())
      .filter((_, idx) => idx > 0 && idx <= headers.length + 1);

    // Skip placeholder rows
    const allEmpty = cells.every(
      (c) => c === "" || c === "—" || c === "-" || c === "N/A"
    );
    if (allEmpty) continue;

    const row: Record<string, string> = {};
    headers.forEach((h, idx) => {
      row[h] = cells[idx] || "";
    });
    results.push(row);
  }

  return results;
}

function rowToItem(
  row: Record<string, string>,
  column: "ideas" | "draft" | "review" | "scheduled" | "published",
  id: number
): ContentItem | null {
  // Extract title from common column names
  const title =
    row["title"] ||
    row["topic"] ||
    row["subject"] ||
    Object.values(row)[0] ||
    "";

  if (!title || title === "—" || title === "-") return null;

  const pillar =
    row["pillar"] || row["category"] || row["type"] || "";

  const date =
    row["added"] ||
    row["started"] ||
    row["scheduled date"] ||
    row["published date"] ||
    row["date"] ||
    "";

  const file = row["file"] || row["draft file"] || undefined;
  const platform = row["platform"] || undefined;
  const performance = row["performance"] || row["notes"] || undefined;

  return {
    id,
    title,
    pillar,
    date,
    file,
    platform,
    performance: performance && performance !== "—" ? performance : undefined,
  };
}

// ---- Main exports used by API routes ----

export interface PipelineColumns {
  ideas: ContentItem[];
  draft: ContentItem[];
  review: ContentItem[];
  scheduled: ContentItem[];
  published: ContentItem[];
}

/** Get all pipeline content, grouped by column. DB first, markdown fallback. */
export function getPipelineColumns(): PipelineColumns {
  const dbRows = getAllContentFromDB();

  if (dbRows.length > 0) {
    const columns: PipelineColumns = {
      ideas: [],
      draft: [],
      review: [],
      scheduled: [],
      published: [],
    };
    for (const row of dbRows) {
      const col = mapStageToColumn(row.stage);
      columns[col].push(rowToContentItem(row));
    }
    return columns;
  }

  // Fallback: parse markdown
  return parseContentPipelineMd();
}

/** Get archived (published >30 days) content. DB first, markdown fallback (filter by date). */
export function getArchivedContent(): { archived: ContentItem[]; count: number } {
  const dbRows = getArchivedContentFromDB();

  if (dbRows.length > 0) {
    const archived = dbRows.map(rowToContentItem);
    return { archived, count: archived.length };
  }

  // Fallback: from markdown, filter published items older than 30 days
  const { published } = parseContentPipelineMd();
  const cutoff = thirtyDaysAgoCairo();

  const archived = published.filter((item) => {
    if (!item.date) return false;
    // Try parsing date — many formats in markdown (e.g. "Feb 21", "2026-02-01")
    const parsed = new Date(item.date);
    if (isNaN(parsed.getTime())) return false;
    return parsed < cutoff;
  });

  return { archived, count: archived.length };
}
