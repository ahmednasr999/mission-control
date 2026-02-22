import { NextResponse } from "next/server";
import { getArchivedContent } from "@/lib/marketing-db";

export async function GET() {
  try {
    const result = getArchivedContent();
    return NextResponse.json(result);
  } catch (err) {
    console.error("[Marketing Archive API]", err);
    return NextResponse.json({ archived: [], count: 0 }, { status: 200 });
  }
}
