// DATA SOURCE: markdown (primary), SQLite DB (cache/enhancement)
// Canonical source: /workspace/memory/active-tasks.md
// DB is used when populated by the sync engine; markdown is the fallback.
// Phase 2: Markdown is canonical — DB supplements, never overrides empty state.
import { NextResponse } from "next/server";
import { getAllTaskColumns, parseActiveTasksMd } from "@/lib/ops-db";

export const dynamic = "force-dynamic";

export async function GET() {
  // Phase 3.1: DB is primary. Try DB first; markdown is fallback only when DB is empty.
  try {
    // Step 1: Read from DB (preferred source for UI)
    try {
      const dbColumns = getAllTaskColumns();
      const totalFromDb =
        dbColumns.todo.length +
        dbColumns.inProgress.length +
        dbColumns.blocked.length +
        dbColumns.done.length;

      if (totalFromDb > 0) {
        return NextResponse.json({ columns: dbColumns, source: "db" });
      }
    } catch {
      // DB unavailable — we'll fall back to markdown
    }

    // Step 2: DB empty/unavailable — fall back to markdown (canonical for humans)
    const mdColumns = parseActiveTasksMd();
    const totalFromMd =
      mdColumns.todo.length +
      mdColumns.inProgress.length +
      mdColumns.blocked.length +
      mdColumns.done.length;

    if (totalFromMd > 0) {
      return NextResponse.json({ columns: mdColumns, source: "markdown" });
    }

    // Step 3: All empty — return empty gracefully
    return NextResponse.json({
      columns: { todo: [], inProgress: [], blocked: [], done: [] },
      source: "empty",
    });
  } catch {
    return NextResponse.json(
      {
        columns: { todo: [], inProgress: [], blocked: [], done: [] },
        source: "error",
      },
      { status: 200 }
    );
  }
}
