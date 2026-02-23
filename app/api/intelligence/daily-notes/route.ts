// DATA SOURCE: SQLite DB (primary), markdown fallback (memory/YYYY-MM-DD.md)
// Phase 3.1: DB is primary source. UI reads from DB; markdown is only for sync input.
import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = "/root/.openclaw/workspace/mission-control/mission-control.db";

interface DailyNote {
  id: number;
  date: string;
  content: string;
  summary: string;
  updatedAt: string;
}

function getDb(): Database.Database {
  const db = new Database(DB_PATH, { readonly: true });
  db.pragma("journal_mode = WAL");
  return db;
}

function getAllNotesFromDb(): DailyNote[] {
  try {
    const db = getDb();
    const rows = db
      .prepare("SELECT id, date, content, summary, updatedAt FROM daily_notes ORDER BY date DESC LIMIT 30")
      .all() as DailyNote[];
    return rows;
  } catch {
    return [];
  }
}

function getNoteByDateFromDb(date: string): DailyNote | null {
  try {
    const db = getDb();
    const row = db
      .prepare("SELECT id, date, content, summary, updatedAt FROM daily_notes WHERE date = ?")
      .get(date) as DailyNote | undefined;
    return row || null;
  } catch {
    return null;
  }
}

// Fallback: read from markdown file if DB is empty
const MEMORY_PATH = "/root/.openclaw/workspace/memory";

function getNoteFromMarkdown(date: string): DailyNote | null {
  try {
    const filePath = path.join(MEMORY_PATH, `${date}.md`);
    if (!fs.existsSync(filePath)) return null;
    
    const content = fs.readFileSync(filePath, "utf-8");
    // Extract first 200 chars as summary
    const summary = content.slice(0, 200).replace(/[#*_\n]/g, " ").trim() + "...";
    
    return {
      id: 0,
      date,
      content,
      summary,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");

  // Phase 3.1: Try DB first
  try {
    // Single date query
    if (date) {
      const dbNote = getNoteByDateFromDb(date);
      if (dbNote) {
        return NextResponse.json({ note: dbNote, source: "db" });
      }
      // Fallback to markdown
      const mdNote = getNoteFromMarkdown(date);
      if (mdNote) {
        return NextResponse.json({ note: mdNote, source: "markdown" });
      }
      return NextResponse.json({ note: null, source: "empty" }, { status: 404 });
    }

    // All notes query
    const dbNotes = getAllNotesFromDb();
    if (dbNotes.length > 0) {
      return NextResponse.json({ notes: dbNotes, source: "db" });
    }
  } catch {
    // DB error - continue to fallback
  }

  // Fallback: scan markdown files if DB empty
  try {
    if (!fs.existsSync(MEMORY_PATH)) {
      return NextResponse.json({ notes: [], source: "empty" });
    }
    
    const files = fs.readdirSync(MEMORY_PATH)
      .filter(f => f.match(/^\d{4}-\d{2}-\d{2}\.md$/))
      .sort()
      .reverse()
      .slice(0, 30);
    
    const notes: DailyNote[] = [];
    for (const file of files) {
      const noteDate = file.replace(".md", "");
      const mdNote = getNoteFromMarkdown(noteDate);
      if (mdNote) notes.push(mdNote);
    }
    
    if (notes.length > 0) {
      return NextResponse.json({ notes, source: "markdown" });
    }
  } catch {
    // Fallback failed
  }

  return NextResponse.json({ notes: [], source: "empty" });
}
