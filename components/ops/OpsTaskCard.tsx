"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { OpsTask } from "@/lib/ops-db";

const PRIORITY_COLORS: Record<string, string> = {
  high: "#F87171",
  medium: "#FBBF24",
  low: "#34D399",
};

const ASSIGNEE_COLORS: Record<string, { text: string; bg: string }> = {
  Ahmed: { text: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  NASR: { text: "#7C3AED", bg: "rgba(124,58,237,0.15)" },
  "CV Optimizer": { text: "#34D399", bg: "rgba(52,211,153,0.15)" },
  "Job Hunter": { text: "#FBBF24", bg: "rgba(251,191,36,0.15)" },
  "Researcher": { text: "#22D3EE", bg: "rgba(34,211,238,0.15)" },
  "Content Creator": { text: "#EC4899", bg: "rgba(236,72,153,0.15)" },
};

// Map agent names to role display names
const ASSIGNEE_DISPLAY: Record<string, string> = {
  ahmed: "Ahmed",
  nasr: "NASR",
  adham: "CV Optimizer",
  heikal: "Job Hunter",
  maher: "Researcher",
  lotfi: "Content Creator",
};

function getAssigneeDisplayName(name: string): string {
  const key = name.toLowerCase().trim();
  return ASSIGNEE_DISPLAY[key] || name;
}

function getAssigneeColor(name: string): { text: string; bg: string } {
  const key = name.toLowerCase().trim();
  for (const [k, v] of Object.entries(ASSIGNEE_COLORS)) {
    if (key.includes(k)) return v;
  }
  return { text: "#64748B", bg: "rgba(100,116,139,0.15)" };
}

function formatDate(isoString?: string, withTime = false): string {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    const dateStr = d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Africa/Cairo",
    });
    if (!withTime) return dateStr;
    const timeStr = d.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Africa/Cairo",
    });
    return `${dateStr} ${timeStr}`;
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
  const displayName = getAssigneeDisplayName(name);
  const initial = displayName.charAt(0).toUpperCase();
  const label = displayName.toUpperCase();

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

interface OpsTaskCardProps {
  task: OpsTask;
  dimmed?: boolean;
  onClick?: (task: OpsTask) => void;
}

export default function OpsTaskCard({ task, dimmed = false, onClick }: OpsTaskCardProps) {
  const [hovered, setHovered] = useState(false);
  const overdue = isOverdue(task.dueDate);
  const priorityColor = PRIORITY_COLORS[task.priority] ?? "#8888A0";

  return (
    <Card
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onClick?.(task)}
      className={`bg-slate-900/60 border-slate-700/50 hover:border-slate-600 transition-all mb-2 ${dimmed ? "opacity-60" : ""}`}
      style={{
        borderColor: hovered ? `${priorityColor}50` : undefined,
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 4px 16px ${priorityColor}18, 0 0 0 1px ${priorityColor}22`
          : "none",
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <CardContent className="p-3">
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

        {/* Badges & metadata row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            marginBottom: "8px",
            flexWrap: "wrap",
          }}
        >
          <CategoryTag category={task.category} />
          {task.dueDate && (
            <span
              style={{
                fontSize: "10px",
                color: overdue ? "#F87171" : "#A0A0B0",
                fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                fontWeight: overdue ? 700 : 400,
              }}
            >
              {overdue ? "⚠" : "📅"} Due: {formatDate(task.dueDate, true)}
            </span>
          )}
        </div>

        {/* Date row - Created & Updated */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "9px",
            color: "#6B7280",
            fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            marginTop: "8px",
            paddingTop: "8px",
            borderTop: "1px solid rgba(107,114,128,0.15)",
            flexWrap: "wrap",
          }}
        >
          <span>📝 Created: {formatDate(task.createdAt, true)}</span>
          {task.completedDate && (
            <span>✅ Completed: {formatDate(task.completedDate, true)}</span>
          )}
        </div>

        {/* Assignee row */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <AssigneeBadge name={task.assignee} />
        </div>
      </CardContent>
    </Card>
  );
}
