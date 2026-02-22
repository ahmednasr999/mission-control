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
