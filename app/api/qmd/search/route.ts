import { NextRequest, NextResponse } from "next/server";
import { execSync } from "child_process";

interface SearchResult {
  uri: string;
  file: string;
  title: string;
  score: string;
  snippet: string;
}

function parseQmdOutput(raw: string): SearchResult[] {
  const results: SearchResult[] = [];
  const blocks = raw.trim().split(/\n(?=qmd:\/\/)/);

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (!lines[0]?.startsWith("qmd://")) continue;

    // Parse header line: "qmd://collection/path/file.md:line #hash"
    const headerMatch = lines[0].match(/^(qmd:\/\/[^\s]+)/);
    const uri = headerMatch?.[1] || lines[0];
    const file = uri.replace(/^qmd:\/\/[^/]+\//, "").replace(/:\d+.*$/, "");

    // Parse title
    const titleLine = lines.find((l) => l.startsWith("Title:"));
    const title = titleLine?.replace("Title:", "").trim() || file;

    // Parse score
    const scoreLine = lines.find((l) => l.startsWith("Score:"));
    const score = scoreLine?.replace("Score:", "").trim() || "";

    // Extract snippet (lines after @@)
    const snippetStart = lines.findIndex((l) => l.startsWith("@@"));
    const snippet =
      snippetStart !== -1
        ? lines
            .slice(snippetStart + 1)
            .join(" ")
            .trim()
        : "";

    results.push({ uri, file, title, score, snippet });
  }

  return results;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q");
  const limit = searchParams.get("limit") || "10";
  const collection = searchParams.get("collection") || "workspace";

  if (!query) {
    return NextResponse.json(
      { error: "Missing search query parameter 'q'" },
      { status: 400 }
    );
  }

  try {
    const cmd = `qmd search "${query.replace(/"/g, '\\"')}" --collection ${collection} --limit ${limit}`;
    const output = execSync(cmd, { encoding: "utf-8", maxBuffer: 1024 * 1024 });
    const results = parseQmdOutput(output);
    return NextResponse.json({ query, results, count: results.length });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("QMD search error:", errorMessage);
    return NextResponse.json(
      { error: "Search failed", details: errorMessage, query },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { query, limit = "10", collection = "workspace" } = body;

  if (!query) {
    return NextResponse.json(
      { error: "Missing 'query' in request body" },
      { status: 400 }
    );
  }

  try {
    const cmd = `qmd search "${query.replace(/"/g, '\\"')}" --collection ${collection} --limit ${limit}`;
    const output = execSync(cmd, { encoding: "utf-8", maxBuffer: 1024 * 1024 });
    const results = parseQmdOutput(output);
    return NextResponse.json({ query, results, count: results.length });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("QMD search error:", errorMessage);
    return NextResponse.json(
      { error: "Search failed", details: errorMessage, query },
      { status: 500 }
    );
  }
}
