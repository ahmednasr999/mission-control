import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const filePath = searchParams.get("path");

  if (!filePath) {
    return NextResponse.json({ error: "Path required" }, { status: 400 });
  }

  // Security: Ensure path is within workspace
  const resolvedPath = path.resolve(filePath);
  const workspaceRoot = path.resolve(process.env.HOME || "/root", ".openclaw/workspace");
  
  if (!resolvedPath.startsWith(workspaceRoot)) {
    return NextResponse.json({ error: "Invalid path" }, { status: 403 });
  }

  try {
    if (!fs.existsSync(resolvedPath)) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(resolvedPath);
    const fileName = path.basename(resolvedPath);

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to read file" }, { status: 500 });
  }
}
