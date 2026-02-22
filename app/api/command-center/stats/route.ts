// DATA SOURCE: SQLite DB (primary) — populated by sync engine from markdown files
// Canonical source: GOALS.md (jobs/goals), content-pipeline.md (content), active-tasks.md (tasks)
// If DB is empty after sync, stats will show zeros. Trigger a sync to refresh.
import { NextResponse } from "next/server";
import {
  getActiveJobCount,
  getAvgAtsScore,
  getContentDueCount,
  getOpenTaskCount,
} from "@/lib/command-center-db";

export async function GET() {
  const activeJobs = getActiveJobCount();
  const avgAts = getAvgAtsScore();
  const contentDue = getContentDueCount();
  const openTasks = getOpenTaskCount();

  return NextResponse.json({
    activeJobs,
    avgAts,
    contentDue,
    openTasks,
  });
}
