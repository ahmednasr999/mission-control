// DATA SOURCE: markdown (primary), SQLite DB (cache/enhancement)
// Canonical source: /workspace/memory/active-tasks.md
// DB is used when populated by the sync engine; markdown is the fallback.
// Phase 2: Markdown is canonical — DB supplements, never overrides empty state.
import { NextResponse } from "next/server";
import { getAllTaskColumns, parseActiveTasksMd } from "@/lib/ops-db";

export const dynamic = "force-dynamic";

export async function GET() {
  // Phase 2: Markdown is primary. Try markdown first; DB adds richer data if available.
  try {
    // Step 1: Parse markdown (canonical source)
    const mdColumns = parseActiveTasksMd();
    const totalFromMd =
      mdColumns.todo.length +
      mdColumns.inProgress.length +
      mdColumns.blocked.length +
      mdColumns.done.length;

    // Step 2: If markdown has data, use it (with optional DB enrichment)
    if (totalFromMd > 0) {
      // Try to enrich with DB data (richer fields like dueDate, category, blocker)
      try {
        const dbColumns = getAllTaskColumns();
        const totalFromDb =
          dbColumns.todo.length +
          dbColumns.inProgress.length +
          dbColumns.blocked.length +
          dbColumns.done.length;

        // Only use DB if it has MORE data than markdown (sync has occurred)
        if (totalFromDb > totalFromMd) {
          return NextResponse.json({ columns: dbColumns, source: "db" });
        }
      } catch {
        // DB unavailable — markdown-only is fine
      }
      return NextResponse.json({ columns: mdColumns, source: "markdown" });
    }

    // Step 3: Markdown is empty — try DB as supplemental source
    try {
      const dbColumns = getAllTaskColumns();
      const totalFromDb =
        dbColumns.todo.length +
        dbColumns.inProgress.length +
        dbColumns.blocked.length +
        dbColumns.done.length;
      if (totalFromDb > 0) {
        return NextResponse.json({ columns: dbColumns, source: "db-only" });
      }
    } catch {
      // DB also unavailable
    }

    // Step 4: All empty — return empty gracefully
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
