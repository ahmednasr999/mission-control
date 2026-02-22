"use client";

/**
 * TaskList — Phase 3: A+ Animations
 * - Staggered fade-in on mount
 * - Hover lift effect
 * - Smooth background transitions
 * - Checkbox animation on click
 */

import { useState, useEffect } from "react";

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
  const [mounted, setMounted] = useState(false);
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <style>{`
        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translateX(-10px);
          }
          to { 
            opacity: 1; 
            transform: translateX(0);
          }
        }
        .task-item {
          animation: slideIn 0.3s ease forwards;
          opacity: 0;
        }
      `}</style>

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
                <span style={{ 
                  fontSize: "13px", 
                  flexShrink: 0,
                  transform: isHovered ? "scale(1.2)" : "scale(1)",
                  transition: "transform 0.2s ease",
                }}>{dot}</span>
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
        animation: "fadeIn 0.4s ease",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {message}
    </div>
  );
}
