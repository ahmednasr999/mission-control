import { NextResponse } from "next/server";
import { getAllTaskColumns, parseActiveTasksMd } from "@/lib/ops-db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const columns = getAllTaskColumns();

    // If all columns are empty, fall back to markdown parser
    const totalFromDb =
      columns.todo.length +
      columns.inProgress.length +
      columns.blocked.length +
      columns.done.length;

    if (totalFromDb === 0) {
      const fallback = parseActiveTasksMd();
      return NextResponse.json({ columns: fallback, source: "markdown" });
    }

    return NextResponse.json({ columns, source: "db" });
  } catch (err) {
    // Last-resort fallback — return markdown data
    try {
      const fallback = parseActiveTasksMd();
      return NextResponse.json({ columns: fallback, source: "markdown-fallback" });
    } catch {
      return NextResponse.json(
        {
          columns: { todo: [], inProgress: [], blocked: [], done: [] },
          source: "error",
        },
        { status: 200 } // don't 500 — graceful
      );
    }
  }
}
