"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const sorted = [...(tasks || [])]
    .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1))
    .slice(0, 6);

  return (
    <Card className="bg-[#0D1220] border-[#1E2D45] rounded-[10px] overflow-hidden flex flex-col">
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .task-item {
          animation: slideIn 0.3s ease forwards;
        }
      `}</style>

      <CardHeader className="pb-2" style={{ padding: "12px 16px 10px", borderBottom: "1px solid #1E2D45" }}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-[#F0F0F5]" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)", letterSpacing: "-0.01em" }}>
            My Tasks
          </CardTitle>
          {!loading && sorted.length > 0 && (
            <span style={{ fontSize: "11px", color: "#A0A0B0", fontFamily: "var(--font-dm-mono, DM Mono, monospace)" }}>
              {sorted.length} open
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1" style={{ padding: 0 }}>
        {loading ? (
          <EmptyState message="Loading…" />
        ) : sorted.length === 0 ? (
          <EmptyState message="No open tasks — clear skies ✨" />
        ) : (
          sorted.map((task, i) => {
            const due = formatDue(task.dueDate);
            const overdue = isOverdue(task.dueDate);
            const dot = PRIORITY_DOT[task.priority] ?? "⚪";
            const isHovered = hoveredId === task.id;

            return (
              <div
                key={task.id}
                className="task-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 16px",
                  borderBottom: i < sorted.length - 1 ? "1px solid #1E2D45" : "none",
                  background: isHovered ? "rgba(79, 142, 247, 0.05)" : "transparent",
                  transform: isHovered ? "translateX(4px)" : "translateX(0)",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  animationDelay: `${i * 60}ms`,
                }}
                onMouseEnter={() => setHoveredId(task.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <span style={{ fontSize: "13px", flexShrink: 0, transform: isHovered ? "scale(1.2)" : "scale(1)", transition: "transform 0.2s ease" }}>
                  {dot}
                </span>
                <span
                  style={{
                    flex: 1,
                    fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                    fontSize: "13px",
                    color: isHovered ? "#F0F0F5" : "#E0E0E5",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    lineHeight: "1.4",
                    transition: "color 0.15s ease",
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
                      transform: isHovered ? "translateX(-2px)" : "translateX(0)",
                      transition: "transform 0.2s ease",
                    }}
                  >
                    {overdue ? "⚠ " : ""}{due}
                  </span>
                )}
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
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
