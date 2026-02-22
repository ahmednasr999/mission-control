// DATA SOURCE: SQLite DB (primary), markdown fallback (GOALS.md)
// Canonical source: /workspace/GOALS.md → synced to DB by sync engine
// Fallback: Direct parse of GOALS.md when DB is empty
import { NextResponse } from "next/server";
import { getAllGoals } from "@/lib/command-center-db";
import fs from "fs";
import path from "path";

const GOALS_PATH = path.join(
  process.env.HOME || "/root",
  ".openclaw/workspace/GOALS.md"
);

interface Goal {
  category: string;
  objective: string;
  progress: number;
  status: string;
}

/**
 * Fallback: parse GOALS.md objectives section into goal items.
 * Reads the "### " subsections and extracts checklist items.
 */
function parseGoalsFromFile(): Goal[] {
  try {
    if (!fs.existsSync(GOALS_PATH)) return [];
    const content = fs.readFileSync(GOALS_PATH, "utf-8");
    const goals: Goal[] = [];

    // Match "### Category" sections
    const sectionRegex = /###\s+(.+?)\n([\s\S]*?)(?=\n###|\n##|\n---|\z)/gi;
    let sectionMatch: RegExpExecArray | null;

    while ((sectionMatch = sectionRegex.exec(content)) !== null) {
      const category = sectionMatch[1].trim();
      const body = sectionMatch[2];

      // Count checklist items
      const allItems = (body.match(/^[-*]\s+\[[ xX]\]/gm) || []).length;
      const doneItems = (body.match(/^[-*]\s+\[[xX]\]/gm) || []).length;
      const progress = allItems > 0 ? Math.round((doneItems / allItems) * 100) : 0;

      // Use the section header as the objective summary
      const firstItem =
        (body.match(/^[-*]\s+\[[ xX]\]\s+(.+)/m) || [])[1]?.trim() || category;

      goals.push({
        category,
        objective: firstItem,
        progress,
        status: progress >= 100 ? "complete" : progress > 0 ? "in-progress" : "not-started",
      });
    }

    return goals;
  } catch {
    return [];
  }
}

export async function GET() {
  // Try DB first
  const dbGoals = getAllGoals();

  if (dbGoals.length > 0) {
    const goals: Goal[] = dbGoals.map((g) => ({
      category: g.category || "General",
      objective: g.objective || "",
      progress: g.progress ?? 0,
      status: g.status || "not-started",
    }));
    return NextResponse.json({ goals });
  }

  // Fallback: parse GOALS.md
  const fallbackGoals = parseGoalsFromFile();
  return NextResponse.json({ goals: fallbackGoals });
}
