import { NextResponse } from "next/server";
import { getContentStageCounts } from "@/lib/command-center-db";

export async function GET() {
  const stages = getContentStageCounts();
  return NextResponse.json({ stages });
}
