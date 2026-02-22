"use client";

interface Task {
  id: number;
  title: string;
  priority: string;
  dueDate?: string | null;
  status: string;
}

const PRIORITY_DOT: Record<string, string> = {
  High: "🔴",
  Medium: "🟡",
  Low: "🟢",
};

const PRIORITY_ORDER: Record<string, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

function formatDue(dateStr: string | null | undefined): string | null {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-GB", {
      timeZone: "Africa/Cairo",
      day: "numeric",
      month: "short",
    });
  } catch {
    return dateStr;
  }
}

function isOverdue(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false;
  try {
    const d = new Date(dateStr);
    return d < new Date();
  } catch {
    return false;
  }
}

interface TaskListProps {
  tasks: Task[];
  loading?: boolean;
}

export default function TaskList({ tasks, loading }: TaskListProps) {
  const sorted = [...(tasks || [])]
    .sort(
      (a, b) =>
        (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1)
    )
    .slice(0, 6);

  return (
    <div
      style={{
        background: "#0D1220",
        border: "1px solid #1E2D45",
        borderRadius: "10px",
        padding: "0",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 16px 10px",
          borderBottom: "1px solid #1E2D45",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "13px",
            fontWeight: 700,
            color: "#F0F0F5",
            letterSpacing: "-0.01em",
          }}
        >
          My Tasks
        </span>
        {!loading && sorted.length > 0 && (
          <span
            style={{
              fontSize: "11px",
              color: "#A0A0B0",
              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            }}
          >
            {sorted.length} open
          </span>
        )}
      </div>

      {/* Task list */}
      <div style={{ flex: 1 }}>
        {loading ? (
          <EmptyState message="Loading…" />
        ) : sorted.length === 0 ? (
          <EmptyState message="No open tasks — clear skies ✨" />
        ) : (
          sorted.map((task, i) => {
            const due = formatDue(task.dueDate);
            const overdue = isOverdue(task.dueDate);
            const dot = PRIORITY_DOT[task.priority] ?? "⚪";
            return (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 16px",
                  borderBottom: i < sorted.length - 1 ? "1px solid #1E2D45" : "none",
                  transition: "background 0.12s",
                }}
              >
                <span style={{ fontSize: "13px", flexShrink: 0 }}>{dot}</span>
                <span
                  style={{
                    flex: 1,
                    fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                    fontSize: "13px",
                    color: "#F0F0F5",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: "1.4",
                  }}
                  title={task.title}
                >
                  {task.title}
                </span>
                {due && (
                  <span
                    style={{
                      fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                      fontSize: "10px",
                      color: overdue ? "#EF4444" : "#A0A0B0",
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {overdue ? "⚠ " : ""}{due}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: "32px 20px",
        textAlign: "center",
        color: "#A0A0B0",
        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
        fontSize: "13px",
      }}
    >
      {message}
    </div>
  );
}
