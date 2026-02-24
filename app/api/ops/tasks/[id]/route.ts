import { NextRequest, NextResponse } from "next/server";
import { updateTask, deleteTask } from "@/lib/ops-db";

export const dynamic = "force-dynamic";

// ── POST /api/ops/tasks/[id]  — Update task ───────────────────────────────────
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Missing task id" }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate required fields
  if (body.title !== undefined && typeof body.title === "string" && !body.title.trim()) {
    return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
  }

  const fields: Record<string, string | undefined> = {};
  if (typeof body.title === "string") fields.title = body.title.trim();
  if (typeof body.description === "string") fields.description = body.description;
  if (typeof body.status === "string") fields.status = body.status;
  if (typeof body.priority === "string") fields.priority = body.priority;
  if (typeof body.dueDate === "string") fields.dueDate = body.dueDate || "";
  if (typeof body.category === "string") fields.category = body.category;
  if (typeof body.assignee === "string") fields.assignee = body.assignee;

  try {
    const updated = updateTask(id, fields);
    if (!updated) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ task: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// ── DELETE /api/ops/tasks/[id]  — Delete task ────────────────────────────────
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json({ error: "Missing task id" }, { status: 400 });
  }

  try {
    const deleted = deleteTask(id);
    if (!deleted) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, id });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
