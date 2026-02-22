import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

const WORKSPACE = path.join(os.homedir(), ".openclaw/workspace");
const MEMORY_DIR = path.join(WORKSPACE, "memory");

interface Match {
  line: number;
  text: string;
  context: string;
}

interface FileResult {
  file: string;
  matches: Match[];
}

function searchFile(filePath: string, query: string, displayName: string, maxMatches: number): FileResult | null {
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n");
    const lowerQuery = query.toLowerCase();
    const matches: Match[] = [];

    for (let i = 0; i < lines.length; i++) {
      if (matches.length >= maxMatches) break;
      if (lines[i].toLowerCase().includes(lowerQuery)) {
        const contextStart = Math.max(0, i - 2);
        const contextEnd = Math.min(lines.length - 1, i + 2);
        const contextLines = lines.slice(contextStart, contextEnd + 1);
        matches.push({
          line: i + 1,
          text: lines[i],
          context: contextLines.join("\n"),
        });
      }
    }

    if (matches.length === 0) return null;
    return { file: displayName, matches };
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = (searchParams.get("q") || "").trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [], totalMatches: 0 });
  }

  const results: FileResult[] = [];
  let totalMatches = 0;
  const MAX_PER_FILE = 10;
  const MAX_TOTAL = 50;

  // Search MEMORY.md
  const memoryResult = searchFile(
    path.join(WORKSPACE, "MEMORY.md"),
    q,
    "MEMORY.md",
    MAX_PER_FILE
  );
  if (memoryResult) {
    results.push(memoryResult);
    totalMatches += memoryResult.matches.length;
  }

  // Search GOALS.md
  if (totalMatches < MAX_TOTAL) {
    const goalsResult = searchFile(
      path.join(WORKSPACE, "GOALS.md"),
      q,
      "GOALS.md",
      MAX_PER_FILE
    );
    if (goalsResult) {
      results.push(goalsResult);
      totalMatches += goalsResult.matches.length;
    }
  }

  // Search memory/*.md files
  if (fs.existsSync(MEMORY_DIR)) {
    try {
      const memFiles = fs.readdirSync(MEMORY_DIR)
        .filter(f => f.endsWith(".md"))
        .sort()
        .reverse(); // most recent first

      for (const fname of memFiles) {
        if (totalMatches >= MAX_TOTAL) break;
        const fpath = path.join(MEMORY_DIR, fname);
        const remaining = MAX_TOTAL - totalMatches;
        const fileResult = searchFile(
          fpath,
          q,
          `memory/${fname}`,
          Math.min(MAX_PER_FILE, remaining)
        );
        if (fileResult) {
          results.push(fileResult);
          totalMatches += fileResult.matches.length;
        }
      }
    } catch {
      // ignore
    }
  }

  return NextResponse.json({ results, totalMatches });
}
