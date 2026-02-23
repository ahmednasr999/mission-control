// DATA SOURCE: SQLite DB (primary), markdown fallback (GOALS.md)
// Canonical source: /workspace/GOALS.md "Active Job Pipeline" table
// DB populated by sync engine; markdown fallback used when DB is empty
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { getAllPipelineJobs, mapStatusToColumn, HRJobRow } from "@/lib/hr-db";

const GOALS_PATH = path.join(
  process.env.HOME || "/root",
  ".openclaw/workspace/GOALS.md"
);

const DB_PATH = "/root/.openclaw/workspace/mission-control/mission-control.db";

/** Lookup ATS score from cv_history table as fallback */
function getAtsFromCvHistory(company: string): number | null {
  try {
    const db = new Database(DB_PATH, { readonly: true });
    // Search by company column (now correctly populated after parser fix)
    const row = db
      .prepare("SELECT atsScore FROM cv_history WHERE company = ? LIMIT 1")
      .get(company) as { atsScore: number | null } | undefined;
    db.close();
    return row?.atsScore ?? null;
  } catch {
    return null;
  }
}

export interface KanbanJob {
  id: number;
  company: string;
  role: string;
  status: string;
  column: "identified" | "radar" | "applied" | "interview" | "offer" | "closed";
  atsScore: number | null;
  nextAction: string | null;
  salary: string | null;
  companyDomain: string | null;
  updatedAt: string | null;
  link?: string | null;
  appliedDate?: string | null;
}

function rowToKanbanJob(row: HRJobRow): KanbanJob {
  // Fallback to cv_history if ats_score is null in job_pipeline
  const atsScore = row.ats_score ?? getAtsFromCvHistory(row.company || "");
  return {
    id: row.id,
    company: row.company || "Unknown",
    role: row.role || "Unknown Role",
    status: row.status || "identified",
    column: mapStatusToColumn(row.status),
    atsScore,
    nextAction: row.next_action,
    salary: row.salary,
    companyDomain: row.company_domain,
    updatedAt: row.updatedAt,
    link: row.link || null,
    appliedDate: row.applied_date || null,
  };
}

/** Parse the Active Job Pipeline table from GOALS.md as fallback */
function parseJobsFromGoals(): KanbanJob[] {
  try {
    if (!fs.existsSync(GOALS_PATH)) return [];
    const content = fs.readFileSync(GOALS_PATH, "utf-8");

    const sectionMatch = content.match(
      /##\s*(?:🔴\s*)?Active Job Pipeline([\s\S]*?)(?=\n##|\n---)/i
    );
    if (!sectionMatch) return [];

    const section = sectionMatch[1];
    const jobs: KanbanJob[] = [];
    let idCounter = 1;

    const rows = section.split("\n").filter((l) => l.trim().startsWith("|"));
    for (const row of rows) {
      const cells = row
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean);
      if (cells.length < 2) continue;
      // Skip header / separator rows
      if (/^[-:]+$/.test(cells[0]) || /company/i.test(cells[0])) continue;

      const company = cells[0] || "Unknown";
      const role = cells[1] || "Unknown Role";
      const rawStatus = cells[2] || "identified";
      const nextAction = cells[3] || null;

      jobs.push({
        id: idCounter++,
        company,
        role,
        status: rawStatus,
        column: mapStatusToColumn(rawStatus),
        atsScore: null,
        nextAction,
        salary: null,
        companyDomain: null,
        updatedAt: null,
      });
    }
    return jobs;
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const rows = getAllPipelineJobs();

    const allJobs: KanbanJob[] = rows.length > 0
      ? rows.map(rowToKanbanJob)
      : parseJobsFromGoals();

    // Group into columns
    const columns: Record<string, KanbanJob[]> = {
      identified: [],
      radar: [],
      applied: [],
      interview: [],
      offer: [],
      closed: [],
    };

    for (const job of allJobs) {
      columns[job.column].push(job);
    }

    return NextResponse.json({ columns });
  } catch (err) {
    console.error("[HR Pipeline API]", err);
    return NextResponse.json(
      { columns: { identified: [], applied: [], interview: [], offer: [], closed: [] } },
      { status: 200 }
    );
  }
}
