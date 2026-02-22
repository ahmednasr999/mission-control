"use client";

import { useEffect, useState, useCallback } from "react";
import AlertBanner from "@/components/command-center/AlertBanner";
import StatCards from "@/components/command-center/StatCards";
import TaskList from "@/components/command-center/TaskList";
import PipelinePreview from "@/components/command-center/PipelinePreview";
import AgentActivity from "@/components/command-center/AgentActivity";
import ContentPreview from "@/components/command-center/ContentPreview";
import GoalsProgress from "@/components/command-center/GoalsProgress";

// ---- Types ----

interface Alert {
  text: string;
  deadline: string;
  severity: "red" | "amber";
}

interface Stats {
  activeJobs: number;
  avgAts: number | null;
  contentDue: number;
  openTasks: number;
}

interface Task {
  id: number;
  title: string;
  priority: string;
  dueDate?: string | null;
  status: string;
  assignee: string;
}

interface Job {
  company: string;
  role: string;
  status: string;
  atsScore: number | null;
}

interface Agent {
  name: string;
  emoji: string;
  lastAction: string;
  timestamp: string | null;
}

interface ContentStages {
  ideas: number;
  draft: number;
  review: number;
  published: number;
}

interface Goal {
  category: string;
  objective: string;
  progress: number;
  status: string;
}

// ---- Priority Focus helpers ----

const PRIORITY_ORDER: Record<string, number> = { High: 0, high: 0, Medium: 1, medium: 1, Low: 2, low: 2 };

function isUrgent(task: Task): boolean {
  if (task.priority === "High" || task.priority === "high") return true;
  if (!task.dueDate) return false;
  try {
    const due = new Date(task.dueDate);
    const diff = due.getTime() - Date.now();
    return diff > 0 && diff < 48 * 60 * 60 * 1000; // within 48h
  } catch {
    return false;
  }
}

function getPriorityFocus(tasks: Task[]): Task[] {
  return [...tasks]
    .filter((t) => isUrgent(t))
    .sort((a, b) => (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1))
    .slice(0, 3);
}

// ---- Data fetcher ----

async function safeFetch<T>(url: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return fallback;
    return await res.json();
  } catch {
    return fallback;
  }
}

// ---- Dashboard State ----

interface DashboardData {
  alerts: Alert[];
  stats: Stats | null;
  tasks: Task[];
  jobs: Job[];
  agents: Agent[];
  stages: ContentStages | null;
  goals: Goal[];
}

const INITIAL: DashboardData = {
  alerts: [],
  stats: null,
  tasks: [],
  jobs: [],
  agents: [],
  stages: null,
  goals: [],
};

// ---- Priority Focus Card ----

function PriorityFocusCard({ tasks, loading }: { tasks: Task[]; loading: boolean }) {
  const focusTasks = getPriorityFocus(tasks);

  if (!loading && focusTasks.length === 0) return null;

  const PRIORITY_ICON: Record<string, string> = { High: "🔴", high: "🔴", Medium: "🟡", medium: "🟡", Low: "🟢", low: "🟢" };

  return (
    <div
      style={{
        background: "linear-gradient(135deg, rgba(79,142,247,0.06), rgba(124,58,237,0.06))",
        border: "1px solid rgba(79,142,247,0.25)",
        borderRadius: "10px",
        padding: "14px 20px",
        marginBottom: "20px",
      }}
    >
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "12px",
      }}>
        <span style={{
          fontFamily: "var(--font-syne, Syne, sans-serif)",
          fontSize: "13px",
          fontWeight: 700,
          color: "#F0F0F5",
        }}>
          🎯 Priority Focus
        </span>
        <span style={{
          fontSize: "10px",
          fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
          color: "#4F8EF7",
          opacity: 0.8,
        }}>
          TOP {focusTasks.length} TODAY
        </span>
      </div>

      {loading ? (
        <div style={{ color: "#555570", fontSize: "12px", fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)" }}>
          Loading…
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {focusTasks.map((task, i) => (
            <div key={task.id} style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "7px 10px",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "6px",
              border: "1px solid rgba(79,142,247,0.15)",
            }}>
              <span style={{ fontSize: "12px", flexShrink: 0 }}>
                {PRIORITY_ICON[task.priority] ?? "⚪"}
              </span>
              <span style={{
                flex: 1,
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                fontSize: "13px",
                fontWeight: 600,
                color: "#F0F0F5",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}>
                {task.title}
              </span>
              <span style={{
                fontSize: "10px",
                fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                color: "#4F8EF7",
                flexShrink: 0,
                background: "rgba(79,142,247,0.1)",
                padding: "2px 6px",
                borderRadius: "4px",
              }}>
                #{i + 1}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---- Component ----

export default function CommandCenterPage() {
  const [data, setData] = useState<DashboardData>(INITIAL);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [alertsRes, statsRes, tasksRes, pipelineRes, agentsRes, contentRes, goalsRes] =
      await Promise.all([
        safeFetch<{ alerts: Alert[] }>("/api/command-center/alerts", { alerts: [] }),
        safeFetch<Stats>("/api/command-center/stats", {
          activeJobs: 0,
          avgAts: null,
          contentDue: 0,
          openTasks: 0,
        }),
        safeFetch<Task[]>("/api/tasks", []),
        safeFetch<{ jobs: Job[] }>("/api/command-center/pipeline", { jobs: [] }),
        safeFetch<{ agents: Agent[] }>("/api/command-center/agents", { agents: [] }),
        safeFetch<{ stages: ContentStages }>("/api/command-center/content", {
          stages: { ideas: 0, draft: 0, review: 0, published: 0 },
        }),
        safeFetch<{ goals: Goal[] }>("/api/command-center/goals", { goals: [] }),
      ]);

    // Filter tasks for Ahmed, non-done, sort by priority
    const ahmedTasks = (Array.isArray(tasksRes) ? tasksRes : []).filter(
      (t: Task) =>
        t.assignee?.toLowerCase() === "ahmed" &&
        t.status?.toLowerCase() !== "done" &&
        t.status?.toLowerCase() !== "completed"
    );

    setData({
      alerts: alertsRes.alerts || [],
      stats: statsRes,
      tasks: ahmedTasks,
      jobs: pipelineRes.jobs || [],
      agents: agentsRes.agents || [],
      stages: contentRes.stages || null,
      goals: goalsRes.goals || [],
    });
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAll();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchAll, 60_000);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return (
    <div
      style={{
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "0",
        minHeight: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Phase 2: Mobile-responsive styles */}
      <style>{`
        .cc-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 16px;
          margin-bottom: 16px;
        }
        .cc-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 900px) {
          .cc-grid-3 {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 600px) {
          .cc-grid-3 {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          .cc-grid-2 {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          div[data-cc-page] {
            padding: 16px !important;
          }
        }
      `}</style>

      {/* Page heading */}
      <div style={{ marginBottom: "20px" }}>
        <h2
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "22px",
            fontWeight: 700,
            color: "#F0F0F5",
            letterSpacing: "-0.03em",
            margin: "0 0 4px 0",
          }}
        >
          Command Center
        </h2>
        <p
          style={{
            color: "#555570",
            fontSize: "12px",
            margin: 0,
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          }}
        >
          Mission overview — live data pipeline
        </p>
      </div>

      {/* Alert Banner */}
      <AlertBanner alerts={data.alerts} />

      {/* Phase 2: Priority Focus — shows top 3 urgent items */}
      <PriorityFocusCard tasks={data.tasks} loading={loading} />

      {/* Stat Cards */}
      <StatCards stats={data.stats} loading={loading} />

      {/* 3-Column grid */}
      <div className="cc-grid-3">
        <TaskList tasks={data.tasks} loading={loading} />
        <PipelinePreview jobs={data.jobs} loading={loading} />
        <AgentActivity agents={data.agents} loading={loading} />
      </div>

      {/* 2-Column bottom grid */}
      <div className="cc-grid-2">
        <ContentPreview stages={data.stages} loading={loading} />
        <GoalsProgress goals={data.goals} loading={loading} />
      </div>
    </div>
  );
}
