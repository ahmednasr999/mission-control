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
const STATS_CACHE_PATH = path.join(os.homedir(), ".openclaw/workspace/memory/stats-cache.json");

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

function loadPreviousStats(): any {
  try {
    if (fs.existsSync(STATS_CACHE_PATH)) {
      return JSON.parse(fs.readFileSync(STATS_CACHE_PATH, "utf-8"));
    }
  } catch {}
  return null;
}

function saveCurrentStats(stats: any) {
  try {
    const dir = path.dirname(STATS_CACHE_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STATS_CACHE_PATH, JSON.stringify({
      ...stats,
      timestamp: Date.now(),
    }));
  } catch {}
}

export const dynamic = "force-dynamic";

export async function GET() {
  const activeJobs = getActiveJobsFromGoals();
  const avgAts = getAvgAtsScore();
  const contentDue = getContentDueCount();
  const openTasks = getOpenTaskCount();

  const currentStats = { activeJobs, avgAts, contentDue, openTasks };
  
  // Load previous stats for trend comparison
  const prev = loadPreviousStats();
  
  // Save current stats for next comparison
  saveCurrentStats(currentStats);

  return NextResponse.json({
    activeJobs,
    avgAts,
    contentDue,
    openTasks,
    radarJobs: 0,
    // Previous values for trends
    prevActiveJobs: prev?.activeJobs ?? null,
    prevAvgAts: prev?.avgAts ?? null,
    prevContentDue: prev?.contentDue ?? null,
    prevOpenTasks: prev?.openTasks ?? null,
    prevRadarJobs: null,
  });
}
