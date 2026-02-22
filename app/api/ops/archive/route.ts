import { NextResponse } from "next/server";
import { getArchivedTasks } from "@/lib/ops-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const archived = getArchivedTasks();
    return NextResponse.json({ archived, count: archived.length });
  } catch {
    return NextResponse.json({ archived: [], count: 0 });
  }
}
