// DATA SOURCE: Mixed — GOALS.md for jobs, SQLite for tasks/content/ats
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import {
  getAvgAtsScore,
  getContentDueCount,
  getOpenTaskCount,
} from "@/lib/command-center-db";

const GOALS_PATH = path.join(os.homedir(), ".openclaw/workspace/GOALS.md");

function getActiveJobsFromGoals(): number {
  try {
    const content = fs.readFileSync(GOALS_PATH, "utf-8");
    const lines = content.split("\n");
    let inPipeline = false;
    let count = 0;
    for (const line of lines) {
      if (line.includes("Active Job Pipeline") || line.includes("Job Pipeline")) inPipeline = true;
      if (inPipeline && line.startsWith("##") && !line.includes("Pipeline")) inPipeline = false;
      if (inPipeline && line.startsWith("|") && !line.includes("---") && !line.includes("Company")) {
        const cols = line.split("|").map(c => c.trim()).filter(Boolean);
        if (cols.length >= 2) {
          const status = (cols[cols.length - 1] || "").toLowerCase();
          if (!status.includes("closed") && !status.includes("rejected")) count++;
        }
      }
    }
    return count;
  } catch { return 0; }
}

export const dynamic = "force-dynamic";

export async function GET() {
  const activeJobs = getActiveJobsFromGoals();
  const avgAts = getAvgAtsScore();
  const contentDue = getContentDueCount();
  const openTasks = getOpenTaskCount();

  return NextResponse.json({
    activeJobs,
    avgAts,
    contentDue,
    openTasks,
    radarJobs: 0,
  });
}
