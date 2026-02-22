import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  // Real sync is handled by the file watcher daemon.
  // This is a manual trigger placeholder that acknowledges the request.
  return NextResponse.json({ success: true, message: "Sync triggered", timestamp: new Date().toISOString() });
}
