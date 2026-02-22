import { NextResponse } from "next/server";
import { execSync } from "child_process";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const output = execSync("openclaw memory index", {
      timeout: 30000,
      encoding: "utf-8",
      cwd: `${process.env.HOME || "/root"}/.openclaw/workspace`,
    });
    return NextResponse.json({ success: true, output: output.trim() });
  } catch (err: any) {
    const errorMsg = err.stderr?.toString?.() || err.message || "Unknown error";
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
