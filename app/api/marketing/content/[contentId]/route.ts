import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_PATH = "/root/.openclaw/workspace/mission-control/mission-control.db";
const MEMORY_DIR = path.join(process.env.HOME || "/root", ".openclaw/workspace/memory");

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
  updatedAt: string | null;
}

interface ActivityEntry {
  date: string;
  file: string;
  content: string;
}

function getDb(): Database.Database | null {
  try {
    if (!fs.existsSync(DB_PATH)) return null;
    const db = new Database(DB_PATH, { readonly: true });
    db.pragma("journal_mode = WAL");
    return db;
  } catch {
    return null;
  }
}

function getContentFromDb(id: number): ContentPipelineRow | null {
  try {
    const db = getDb();
    if (!db) return null;
    return db.prepare("SELECT * FROM content_pipeline WHERE id = ?").get(id) as ContentPipelineRow | null;
  } catch {
    return null;
  }
}

function scanMemoryForActivity(contentTitle: string): ActivityEntry[] {
  const activity: ActivityEntry[] = [];
  
  try {
    if (!fs.existsSync(MEMORY_DIR)) return activity;
    
    const files = fs.readdirSync(MEMORY_DIR).filter(f => f.endsWith(".md"));
    
    for (const file of files) {
      const filePath = path.join(MEMORY_DIR, file);
      const content = fs.readFileSync(filePath, "utf-8");
      
      if (content.toLowerCase().includes(contentTitle.toLowerCase())) {
        const stats = fs.statSync(filePath);
        const date = stats.mtime.toISOString().split("T")[0];
        
        const lines = content.split("\n");
        let excerpt = "";
        for (const line of lines) {
          if (line.toLowerCase().includes(contentTitle.toLowerCase())) {
            excerpt = line.trim().substring(0, 200);
            break;
          }
        }
        
        activity.push({
          date,
          file,
          content: excerpt || `Mentioned in ${file}`,
        });
      }
    }
    
    return activity.sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    return activity;
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ contentId: string }> }
) {
  const { contentId } = await params;
  const id = parseInt(contentId, 10);
  
  if (isNaN(id)) {
    return NextResponse.json({ error: "Invalid content ID" }, { status: 400 });
  }
  
  const row = getContentFromDb(id);
  
  if (!row) {
    return NextResponse.json({ error: "Content not found" }, { status: 404 });
  }
  
  const activity = scanMemoryForActivity(row.title || "");
  
  const stage = row.stage || "ideas";
  const stageLower = stage.toLowerCase();
  
  const response = {
    id: row.id,
    title: row.title || "Untitled",
    pillar: row.pillar || "",
    stage: stageLower.includes("publish") ? "published" 
      : stageLower.includes("schedul") ? "scheduled"
      : stageLower.includes("review") ? "review"
      : stageLower.includes("draft") ? "draft"
      : "ideas",
    wordCount: row.word_count ?? null,
    scheduledDate: row.scheduled_date ?? null,
    publishedDate: row.published_date ?? null,
    performance: row.performance ?? null,
    notes: row.performance ?? null,
    createdAt: row.updatedAt ?? null,
    updatedAt: row.updatedAt ?? null,
    filePath: row.file_path ?? null,
    activity,
  };
  
  return NextResponse.json(response);
}
