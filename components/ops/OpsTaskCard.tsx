"use client";

import { useState } from "react";
import type { OpsTask } from "@/lib/ops-db";

// ---- Constants ----

const PRIORITY_COLORS: Record<string, string> = {
  high: "#F87171",
  medium: "#FBBF24",
  low: "#34D399",
};

const ASSIGNEE_COLORS: Record<string, { text: string; bg: string }> = {
  ahmed: { text: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  nasr: { text: "#7C3AED", bg: "rgba(124,58,237,0.15)" },
  adham: { text: "#34D399", bg: "rgba(52,211,153,0.15)" },
  heikal: { text: "#FBBF24", bg: "rgba(251,191,36,0.15)" },
  maher: { text: "#22D3EE", bg: "rgba(34,211,238,0.15)" },
  lotfi: { text: "#EC4899", bg: "rgba(236,72,153,0.15)" },
};

function getAssigneeColor(name: string): { text: string; bg: string } {
  const key = name.toLowerCase().trim();
  for (const [k, v] of Object.entries(ASSIGNEE_COLORS)) {
    if (key.includes(k)) return v;
  }
  return { text: "#64748B", bg: "rgba(100,116,139,0.15)" };
}

// Cairo timezone offset (UTC+2 standard, UTC+3 DST; approximate: use UTC+2)
function toCairoDate(isoString: string): Date {
  const d = new Date(isoString);
  return new Date(d.getTime() + 2 * 60 * 60 * 1000); // EET UTC+2
}

function formatDate(isoString?: string): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Africa/Cairo",
    });
  } catch {
    return isoString;
  }
}

function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;
  try {
    const due = new Date(dueDate);
    const now = new Date();
    return due < now;
  } catch {
    return false;
  }
}

// ---- Sub-components ----

function PriorityDot({ priority }: { priority: string }) {
  const color = PRIORITY_COLORS[priority] ?? "#8888A0";
  return (
    <div
      style={{
        width: "8px",
        height: "8px",
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
        boxShadow: `0 0 4px ${color}60`,
      }}
    />
  );
}

function AssigneeBadge({ name }: { name: string }) {
  const { text, bg } = getAssigneeColor(name);
  const initial = name.charAt(0).toUpperCase();
  const label = name.toUpperCase();

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "10px",
        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
        fontWeight: 600,
        color: text,
        background: bg,
        border: `1px solid ${text}35`,
        borderRadius: "20px",
        padding: "2px 7px 2px 4px",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      <span
        style={{
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          background: text,
          color: "#F0F0F5",
          fontSize: "8px",
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {initial}
      </span>
      {label}
    </span>
  );
}

function CategoryTag({ category }: { category: string }) {
  return (
    <span
      style={{
        fontSize: "10px",
        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
        color: "#8888A0",
        background: "rgba(136,136,160,0.1)",
        border: "1px solid rgba(136,136,160,0.2)",
        borderRadius: "20px",
        padding: "2px 7px",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {category}
    </span>
  );
}

// ---- Main card ----

interface OpsTaskCardProps {
  task: OpsTask;
  dimmed?: boolean;
}

export default function OpsTaskCard({ task, dimmed = false }: OpsTaskCardProps) {
  const [hovered, setHovered] = useState(false);
  const overdue = isOverdue(task.dueDate);
  const priorityColor = PRIORITY_COLORS[task.priority] ?? "#8888A0";
  const assigneeColor = getAssigneeColor(task.assignee).text;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#0D1220",
        border: `1px solid ${hovered ? priorityColor + "50" : "#1E2D45"}`,
        borderRadius: "10px",
        padding: "10px 12px",
        cursor: "default",
        transition: "all 0.15s ease",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 4px 16px ${priorityColor}18, 0 0 0 1px ${priorityColor}22`
          : "none",
        opacity: dimmed ? 0.6 : 1,
        marginBottom: "8px",
      }}
    >
      {/* Title row */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "8px",
          marginBottom: "8px",
        }}
      >
        <PriorityDot priority={task.priority} />
        <span
          style={{
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            fontSize: "14px",
            fontWeight: 700,
            color: "#F0F0F5",
            lineHeight: 1.3,
            flex: 1,
          }}
        >
          {task.title}
        </span>
      </div>

      {/* Badges row: assignee + category */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          flexWrap: "wrap",
          marginBottom: task.dueDate ? "8px" : "0",
        }}
      >
        <AssigneeBadge name={task.assignee} />
        <CategoryTag category={task.category} />
      </div>

      {/* Blocker row — Phase 2 */}
      {task.blocker && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "6px",
            marginTop: "6px",
            padding: "5px 8px",
            background: "rgba(251, 146, 60, 0.08)",
            border: "1px solid rgba(251, 146, 60, 0.3)",
            borderRadius: "6px",
          }}
        >
          <span style={{ fontSize: "10px", flexShrink: 0 }}>🚫</span>
          <span
            style={{
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              fontSize: "11px",
              color: "#FB923C",
              fontWeight: 600,
              lineHeight: 1.4,
            }}
          >
            {task.blocker}
          </span>
        </div>
      )}

      {/* Deadline row */}
      {task.dueDate && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginTop: "4px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
              fontSize: "11px",
              color: overdue ? "#F87171" : "#A0A0B0",
            }}
          >
            {formatDate(task.dueDate)}
          </span>
          {overdue && (
            <span
              style={{
                fontSize: "9px",
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                fontWeight: 700,
                color: "#F87171",
                background: "rgba(248,113,113,0.12)",
                border: "1px solid rgba(248,113,113,0.3)",
                borderRadius: "20px",
                padding: "1px 6px",
                letterSpacing: "0.03em",
              }}
            >
              OVERDUE
            </span>
          )}
        </div>
      )}
    </div>
  );
}
