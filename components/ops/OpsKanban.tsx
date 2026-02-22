"use client";

import { useEffect, useState } from "react";
import OpsTaskCard from "./OpsTaskCard";
import type { OpsTask, OpsColumns } from "@/lib/ops-db";
import type { FilterState } from "./FilterBar";

// ---- Column definitions ----

const COLUMNS: {
  key: keyof OpsColumns;
  label: string;
  dotColor: string;
}[] = [
  { key: "todo", label: "To Do", dotColor: "#64748B" },
  { key: "inProgress", label: "In Progress", dotColor: "#3B82F6" },
  { key: "blocked", label: "Blocked", dotColor: "#F87171" },
  { key: "done", label: "Done", dotColor: "#34D399" },
];

// ---- Filter logic ----

function filterTask(task: OpsTask, filters: FilterState): boolean {
  // Assignee
  if (filters.assignee !== "All") {
    const taskAssignee = (task.assignee || "").toLowerCase();
    const filterAssignee = filters.assignee.toLowerCase();
    if (filterAssignee === "unassigned") {
      if (taskAssignee !== "unassigned" && taskAssignee !== "") return false;
    } else {
      if (!taskAssignee.includes(filterAssignee)) return false;
    }
  }

  // Priority
  if (filters.priority !== "All") {
    if (task.priority !== filters.priority) return false;
  }

  // Category
  if (filters.category !== "All") {
    const taskCat = (task.category || "").toLowerCase();
    const filterCat = filters.category.toLowerCase();
    if (!taskCat.includes(filterCat)) return false;
  }

  // Phase 2: Blockers Only filter
  if (filters.blockersOnly) {
    if (!task.blocker || task.blocker.trim() === "") return false;
  }

  return true;
}

// ---- Empty column placeholder ----

function EmptyColumn({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "24px 8px",
        textAlign: "center",
        color: "#A0A0B0",
        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
        fontSize: "12px",
      }}
    >
      No {label.toLowerCase()} tasks
    </div>
  );
}

// ---- Main kanban ----

interface OpsKanbanProps {
  filters: FilterState;
}

export default function OpsKanban({ filters }: OpsKanbanProps) {
  const [data, setData] = useState<{ columns: OpsColumns } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/ops/tasks")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  // Apply client-side filters
  const filteredColumns: OpsColumns = {
    todo: (data?.columns.todo ?? []).filter((t) => filterTask(t, filters)),
    inProgress: (data?.columns.inProgress ?? []).filter((t) => filterTask(t, filters)),
    blocked: (data?.columns.blocked ?? []).filter((t) => filterTask(t, filters)),
    done: (data?.columns.done ?? []).filter((t) => filterTask(t, filters)),
  };

  const totalVisible = COLUMNS.reduce(
    (sum, col) => sum + filteredColumns[col.key].length,
    0
  );

  return (
    <div
      style={{
        background: "#0D1220",
        border: "1px solid #1E2D45",
        borderRadius: "10px",
        overflow: "hidden",
        marginBottom: "20px",
      }}
    >
      {/* Section header */}
      <div
        style={{
          padding: "16px 20px 14px",
          borderBottom: "1px solid #1E2D45",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span
            style={{
              fontFamily: "var(--font-syne, Syne, sans-serif)",
              fontSize: "15px",
              fontWeight: 700,
              color: "#F0F0F5",
              letterSpacing: "-0.02em",
            }}
          >
            Task Board
          </span>
          <span
            style={{
              fontSize: "11px",
              color: "#A0A0B0",
              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            }}
          >
            Kanban
          </span>
        </div>
        {!loading && (
          <span
            style={{
              fontSize: "11px",
              color: "#A0A0B0",
              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            }}
          >
            {totalVisible} task{totalVisible !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Content */}
      {loading ? (
        <div
          style={{
            padding: "48px",
            textAlign: "center",
            color: "#A0A0B0",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            fontSize: "13px",
          }}
        >
          Loading tasks…
        </div>
      ) : error ? (
        <div
          style={{
            padding: "48px",
            textAlign: "center",
            color: "#F87171",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            fontSize: "13px",
          }}
        >
          Failed to load tasks
        </div>
      ) : (
        <div className="ops-kanban-grid" style={{ minHeight: "320px" }}>
          <style>{`
            .ops-kanban-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
            }
            @media (max-width: 768px) {
              .ops-kanban-grid {
                grid-template-columns: 1fr;
              }
              .ops-kanban-grid > div {
                border-right: none !important;
                border-bottom: 1px solid #1E2D45;
              }
            }
          `}</style>
          {COLUMNS.map((col, idx) => {
            const tasks = filteredColumns[col.key];
            return (
              <div
                key={col.key}
                style={{
                  borderRight: idx < COLUMNS.length - 1 ? "1px solid #1E2D45" : "none",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Column header */}
                <div
                  style={{
                    padding: "12px 14px 10px",
                    borderBottom: "1px solid #1E2D45",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    background: "#080C16",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: col.dotColor,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: "#F0F0F5",
                      flex: 1,
                    }}
                  >
                    {col.label}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                      color: col.dotColor,
                      background: `${col.dotColor}18`,
                      border: `1px solid ${col.dotColor}35`,
                      borderRadius: "20px",
                      padding: "1px 7px",
                      fontWeight: 600,
                    }}
                  >
                    {tasks.length}
                  </span>
                </div>

                {/* Column body */}
                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    padding: "10px 8px",
                    maxHeight: "520px",
                  }}
                >
                  {tasks.length === 0 ? (
                    <EmptyColumn label={col.label} />
                  ) : (
                    tasks.map((task) => (
                      <OpsTaskCard key={task.id} task={task} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
