import { NextResponse } from "next/server";
import { getArchivedJobs, mapStatusToColumn } from "@/lib/hr-db";
import type { KanbanJob } from "@/app/api/hr/pipeline/route";

export async function GET() {
  try {
    const rows = getArchivedJobs();

    const archived: KanbanJob[] = rows.map((row) => ({
      id: row.id,
      company: row.company || "Unknown",
      role: row.role || "Unknown Role",
      status: row.status || "closed",
      column: mapStatusToColumn(row.status),
      atsScore: row.ats_score,
      nextAction: row.next_action,
      salary: row.salary,
      companyDomain: row.company_domain,
      updatedAt: row.updatedAt,
    }));

    return NextResponse.json({ archived, count: archived.length });
  } catch (err) {
    console.error("[HR Archive API]", err);
    return NextResponse.json({ archived: [], count: 0 }, { status: 200 });
  }
}
