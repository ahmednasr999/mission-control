import { NextResponse } from "next/server";
import { getActiveJobs } from "@/lib/command-center-db";
import fs from "fs";
import path from "path";

const GOALS_PATH = path.join(
  process.env.HOME || "/root",
  ".openclaw/workspace/GOALS.md"
);

interface Job {
  company: string;
  role: string;
  status: string;
  atsScore: number | null;
}

/**
 * Fallback: parse the job pipeline table from GOALS.md
 * Looks for the "Active Job Pipeline" table section.
 */
function parseJobsFromGoals(): Job[] {
  try {
    if (!fs.existsSync(GOALS_PATH)) return [];
    const content = fs.readFileSync(GOALS_PATH, "utf-8");

    // Find the pipeline table section
    const sectionMatch = content.match(
      /##\s*(?:🔴\s*)?Active Job Pipeline([\s\S]*?)(?=\n##|\n---|\z)/i
    );
    if (!sectionMatch) return [];

    const section = sectionMatch[1];
    const jobs: Job[] = [];

    // Parse markdown table rows (skip header and separator rows)
    const rows = section.split("\n").filter((l) => l.trim().startsWith("|"));
    for (const row of rows) {
      const cells = row
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean);
      if (cells.length < 2) continue;
      // Skip header rows
      if (
        /^-+$/.test(cells[0]) ||
        /company/i.test(cells[0]) ||
        /^-+$/.test(cells[1])
      )
        continue;

      jobs.push({
        company: cells[0] || "Unknown",
        role: cells[1] || "Unknown",
        status: cells[2] || "Applied",
        atsScore: null,
      });
    }
    return jobs.slice(0, 4);
  } catch {
    return [];
  }
}

export async function GET() {
  // Try DB first
  const dbJobs = getActiveJobs(4);

  if (dbJobs.length > 0) {
    const jobs: Job[] = dbJobs.map((j) => ({
      company: j.company || "Unknown",
      role: j.role || "Unknown",
      status: j.status || "Applied",
      atsScore: j.ats_score,
    }));
    return NextResponse.json({ jobs });
  }

  // Fallback: parse GOALS.md
  const fallbackJobs = parseJobsFromGoals();
  return NextResponse.json({ jobs: fallbackJobs });
}
