"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";

interface ActivityLog {
  date: string;
  excerpt: string;
}

interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  priority: string;
  category: string;
  dueDate?: string;
  createdAt: string;
  status?: string;
  blocker?: string;
}

const PRIORITY_COLORS: Record<string, string> = {
  high: "#F87171",
  medium: "#FBBF24",
  low: "#34D399",
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  "to do": { bg: "rgba(136,136,160,0.15)", text: "#8888A0" },
  "inbox": { bg: "rgba(136,136,160,0.15)", text: "#8888A0" },
  "in progress": { bg: "rgba(59,130,246,0.15)", text: "#3B82F6" },
  "inprogress": { bg: "rgba(59,130,246,0.15)", text: "#3B82F6" },
  blocked: { bg: "rgba(248,113,113,0.15)", text: "#F87171" },
  done: { bg: "rgba(52,211,153,0.15)", text: "#34D399" },
  completed: { bg: "rgba(52,211,153,0.15)", text: "#34D399" },
};

const ASSIGNEE_COLORS: Record<string, { text: string; bg: string }> = {
  Ahmed: { text: "#3B82F6", bg: "rgba(59,130,246,0.15)" },
  NASR: { text: "#7C3AED", bg: "rgba(124,58,237,0.15)" },
  adham: { text: "#34D399", bg: "rgba(52,211,153,0.15)" },
  heikal: { text: "#FBBF24", bg: "rgba(251,191,36,0.15)" },
  maher: { text: "#22D3EE", bg: "rgba(34,211,238,0.15)" },
  lotfi: { text: "#EC4899", bg: "rgba(236,72,153,0.15)" },
};

const ASSIGNEE_DISPLAY: Record<string, string> = {
  ahmed: "Ahmed",
  nasr: "NASR",
  adham: "CV Optimizer",
  heikal: "Job Hunter",
  maher: "Researcher",
  lotfi: "Content Creator",
};

function getAssigneeDisplay(name?: string): string {
  const key = (name || "").toLowerCase().trim();
  return ASSIGNEE_DISPLAY[key] || name || "Unassigned";
}

function getAssigneeColor(name?: string): { text: string; bg: string } {
  const key = (name || "").toLowerCase().trim();
  for (const [k, v] of Object.entries(ASSIGNEE_COLORS)) {
    if (key.includes(k)) return v;
  }
  return { text: "#64748B", bg: "rgba(100,116,139,0.15)" };
}

function formatDate(isoString?: string): string {
  if (!isoString) return "—";
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

function StatusBadge({ status }: { status?: string }) {
  const s = (status || "").toLowerCase().trim();
  const colors = STATUS_COLORS[s] || STATUS_COLORS["to do"];
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: 600,
        background: colors.bg,
        color: colors.text,
        textTransform: "capitalize",
      }}
    >
      {status || "To Do"}
    </span>
  );
}

function PriorityBadge({ priority }: { priority?: string }) {
  const p = (priority || "medium").toLowerCase();
  const colors = PRIORITY_COLORS[p] || PRIORITY_COLORS["medium"];
  const labels: Record<string, string> = { high: "High", medium: "Medium", low: "Low" };
  return (
    <span
      style={{
        display: "inline-block",
        padding: "4px 10px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: 600,
        background: `${colors}22`,
        color: colors,
        border: `1px solid ${colors}44`,
      }}
    >
      {labels[p] || "Medium"}
    </span>
  );
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

export default function TaskDetailPage({ params }: { params: { taskId: string } }) {
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [relatedTasks, setRelatedTasks] = useState<Task[]>([]);
  const [activityLog, setActivityLog] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/ops/tasks/${params.taskId}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(true);
        } else {
          setTask(d.task);
          setRelatedTasks(d.relatedTasks || []);
          setActivityLog(d.activityLog || []);
        }
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [params.taskId]);

  if (loading) {
    return (
      <div style={{ padding: "24px 32px", background: "#080C16", minHeight: "100vh" }}>
        <div style={{ color: "#A0A0B0", textAlign: "center", paddingTop: "48px" }}>Loading task...</div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div style={{ padding: "24px 32px", background: "#080C16", minHeight: "100vh" }}>
        <Link href="/ops" style={{ color: "#4F8EF7", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "24px" }}>
          ← Back to OPS
        </Link>
        <div style={{ color: "#F87171", textAlign: "center", paddingTop: "48px" }}>Task not found</div>
      </div>
    );
  }

  const { text: assigneeText, bg: assigneeBg } = getAssigneeColor(task.assignee);
  const displayAssignee = getAssigneeDisplay(task.assignee);

  return (
    <div style={{ padding: "24px 32px", background: "#080C16", minHeight: "100vh" }}>
      <style>{`
        @media (max-width: 768px) {
          .task-detail-page { padding: 16px !important; }
          .info-cards-row { flex-direction: column !important; }
        }
      `}</style>
      
      <Link href="/ops" style={{ color: "#4F8EF7", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px", marginBottom: "20px", fontSize: "14px", fontWeight: 500 }}>
        ← Back to OPS
      </Link>

      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontFamily: "var(--font-syne, Syne, sans-serif)", fontSize: "22px", fontWeight: 700, color: "#F0F0F5", marginBottom: "12px", lineHeight: 1.3 }}>
          {task.title}
        </h1>
        {/* Quick glance row */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", fontSize: "12px" }}>
            <span style={{ color: "#A0A0B0" }}>👤 {displayAssignee}</span>
            <span style={{ color: "#A0A0B0" }}>📂 {task.category}</span>
            {task.dueDate && <span style={{ color: "#F59E0B" }}>⏰ Due {formatDate(task.dueDate)}</span>}
            {task.blocker && task.blocker.trim() && (
              <span style={{ color: "#F87171" }}>🛑 Blocker: {task.blocker}</span>
            )}
          </div>
        </div>
      </div>

      {/* Key info cards */}
      <div className="info-cards-row" style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
        <Card style={{ flex: 1, background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px" }}>
          <CardContent style={{ padding: "16px" }}>
            <div style={{ fontSize: "11px", color: "#A0A0B0", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Task Meta</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <div style={{ fontSize: "10px", color: "#6B7280", marginBottom: "2px" }}>Assignee</div>
                <div style={{ fontSize: "13px", color: "#F0F0F5" }}>{displayAssignee}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#6B7280", marginBottom: "2px" }}>Category</div>
                <div style={{ fontSize: "13px", color: "#F0F0F5" }}>{task.category}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#6B7280", marginBottom: "2px" }}>Created</div>
                <div style={{ fontSize: "13px", color: "#F0F0F5" }}>{formatDate(task.createdAt)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ flex: 1, background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px" }}>
          <CardContent style={{ padding: "16px" }}>
            <div style={{ fontSize: "11px", color: "#A0A0B0", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Status & Timing</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div>
                <div style={{ fontSize: "10px", color: "#6B7280", marginBottom: "2px" }}>Current Status</div>
                <div style={{ fontSize: "13px", color: "#F0F0F5" }}>{task.status || "To Do"}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#6B7280", marginBottom: "2px" }}>Due Date</div>
                <div style={{ fontSize: "13px", color: "#F0F0F5" }}>{task.dueDate ? formatDate(task.dueDate) : "—"}</div>
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#6B7280", marginBottom: "2px" }}>Created</div>
                <div style={{ fontSize: "13px", color: "#F0F0F5" }}>{formatDate(task.createdAt)}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card style={{ flex: 1, background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px" }}>
          <CardContent style={{ padding: "16px" }}>
            <div style={{ fontSize: "11px", color: "#A0A0B0", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Assignee Avatar</div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: assigneeText, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ color: "#F0F0F5", fontSize: "14px", fontWeight: 700 }}>{displayAssignee.charAt(0)}</span>
              </div>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 600, color: assigneeText }}>{displayAssignee.toUpperCase()}</div>
                <div style={{ fontSize: "11px", color: "#A0A0B0" }}>Agent</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {(task.description) && (
        <Card style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px", marginBottom: "24px" }}>
          <CardContent style={{ padding: "16px" }}>
            <div style={{ fontSize: "11px", color: "#A0A0B0", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Description</div>
            <div style={{ fontSize: "14px", color: "#F0F0F5", lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {task.description}
            </div>
          </CardContent>
        </Card>
      )}

      {activityLog.length > 0 && (
        <Card style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px", marginBottom: "24px" }}>
          <CardContent style={{ padding: "16px" }}>
            <div style={{ fontSize: "11px", color: "#A0A0B0", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Activity Log</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {activityLog.map((log, i) => (
                <div key={i} style={{ display: "flex", gap: "12px", paddingBottom: "12px", borderBottom: i < activityLog.length - 1 ? "1px solid #1E2D45" : "none" }}>
                  <span style={{ fontSize: "11px", color: "#4F8EF7", fontFamily: "var(--font-dm-mono, monospace)", flexShrink: 0 }}>{log.date}</span>
                  <span style={{ fontSize: "13px", color: "#A0A0B0" }}>{log.excerpt}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {relatedTasks.length > 0 && (
        <Card style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px" }}>
          <CardContent style={{ padding: "16px" }}>
            <div style={{ fontSize: "11px", color: "#A0A0B0", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "12px" }}>Related Tasks</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {relatedTasks.map((rt) => (
                <Link key={rt.id} href={`/ops/${rt.id}`} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "#080C16", borderRadius: "6px", textDecoration: "none" }}>
                  <PriorityDot priority={rt.priority} />
                  <span style={{ flex: 1, fontSize: "13px", color: "#F0F0F5" }}>{rt.title}</span>
                  <StatusBadge status={rt.status} />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
