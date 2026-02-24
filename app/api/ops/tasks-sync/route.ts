import { NextResponse } from "next/server";
import { syncActiveTasksToOps } from "@/lib/ops-tasks-sync";

export async function POST() {
  try {
    const result = syncActiveTasksToOps();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[OPS Tasks Sync API]", err);
    return NextResponse.json(
      { success: false, count: 0, error: "Sync failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const result = syncActiveTasksToOps();
  return NextResponse.json(result);
}
