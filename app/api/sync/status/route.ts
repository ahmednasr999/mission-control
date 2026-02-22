// DATA SOURCE: SQLite DB — reads sync_log and table row counts
// Returns real-time sync engine status for the Settings page.
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Try to import sync module (only available in server context after init)
    const { getSyncStatus } = await import("@/lib/sync/index");
    const status = getSyncStatus();
    return NextResponse.json({
      status: status.status,
      lastSync: status.lastFullSync || new Date().toISOString(),
      rowCounts: status.rowCounts,
      files: status.files,
    });
  } catch {
    // Fallback if sync engine hasn't started yet
    return NextResponse.json({
      status: "initializing",
      lastSync: new Date().toISOString(),
      rowCounts: {},
      files: [],
    });
  }
}
