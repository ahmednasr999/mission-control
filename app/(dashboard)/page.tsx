"use client";

import { useEffect, useState, useCallback } from "react";
import AlertBanner from "@/components/command-center/AlertBanner";
import StatCards from "@/components/command-center/StatCards";
import TaskList from "@/components/command-center/TaskList";
import PipelinePreview from "@/components/command-center/PipelinePreview";
import ActivityFeed from "@/components/command-center/ActivityFeed";
import ContentPreview from "@/components/command-center/ContentPreview";
import GoalsProgress from "@/components/command-center/GoalsProgress";
import DailyNotesPreview from "@/components/command-center/DailyNotesPreview";

// ---- Types ----

interface Alert {
  text: string;
  deadline: string;
  severity: "red" | "amber" | "yellow";
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

interface DailyNote {
  id: number;
  date: string;
  summary: string;
  updatedAt: string;
}

interface DashboardData {
  alerts: Alert[];
  stats: Stats | null;
  tasks: Task[];
  jobs: Job[];
  agents: Agent[];
  stages: ContentStages | null;
  goals: Goal[];
  dailyNotes: DailyNote[];
}

const INITIAL: DashboardData = {
  alerts: [],
  stats: null,
  tasks: [],
  jobs: [],
  agents: [],
  stages: null,
  goals: [],
  dailyNotes: [],
};

// ---- Component ----

export default function CommandCenterPage() {
  const [data, setData] = useState<DashboardData>(INITIAL);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    const [alertsRes, statsRes, tasksRes, pipelineRes, agentsRes, contentRes, goalsRes, notesRes] =
      await Promise.all([
        safeFetch<{ alerts: Alert[] }>("/api/command-center/alerts", { alerts: [] }),
        safeFetch<Stats>("/api/command-center/stats", {
          activeJobs: 0,
          avgAts: null,
          contentDue: 0,
          openTasks: 0,
        }),
        safeFetch<{ columns: { todo: Task[]; inProgress: Task[]; blocked: Task[]; done: Task[] } }>("/api/ops/tasks", { columns: { todo: [], inProgress: [], blocked: [], done: [] } }),
        safeFetch<{ jobs: Job[] }>("/api/command-center/pipeline", { jobs: [] }),
        safeFetch<{ agents: Agent[] }>("/api/command-center/agents", { agents: [] }),
        safeFetch<{ stages: ContentStages }>("/api/command-center/content", {
          stages: { ideas: 0, draft: 0, review: 0, published: 0 },
        }),
        safeFetch<{ goals: Goal[] }>("/api/command-center/goals", { goals: [] }),
        safeFetch<{ notes: DailyNote[] }>("/api/intelligence/daily-notes", { notes: [] }),
      ]);

    // Flatten columns and filter for Ahmed, non-done
    const allTasks = [
      ...(tasksRes.columns?.todo || []),
      ...(tasksRes.columns?.inProgress || []),
      ...(tasksRes.columns?.blocked || []),
    ].map((t: any) => ({
      ...t,
      id: typeof t.id === 'string' ? parseInt(t.id, 10) : t.id,
      priority: t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1).toLowerCase() : 'Medium',
    }));
    const ahmedTasks = allTasks.filter(
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
      dailyNotes: notesRes.notes || [],
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
      data-cc-page
      style={{
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "0",
        minHeight: "100%",
        boxSizing: "border-box",
      }}
    >
      {/* Mobile-responsive styles */}
      <style>{`
        .cc-grid-3 {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 12px;
          margin-bottom: 12px;
        }
        .cc-grid-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }
        @media (max-width: 1024px) {
          .cc-grid-3 {
            grid-template-columns: 1fr 1fr;
          }
        }
        @media (max-width: 768px) {
          .cc-grid-3 {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          .cc-grid-2 {
            grid-template-columns: 1fr;
            gap: 10px;
          }
          div[data-cc-page] {
            padding: 12px !important;
          }
        }
      `}</style>

      {/* Alert Banner */}
      <AlertBanner alerts={data.alerts} />

      {/* Stat Cards — collapsible */}
      <StatCards stats={data.stats} loading={loading} />

      {/* 3-Column grid */}
      <div className="cc-grid-3">
        <TaskList tasks={data.tasks} loading={loading} />
        <PipelinePreview jobs={data.jobs} loading={loading} />
        <ActivityFeed tasks={data.tasks} jobs={data.jobs} agents={data.agents} loading={loading} />
      </div>

      {/* 2-Column bottom grid */}
      <div className="cc-grid-2">
        <ContentPreview stages={data.stages} loading={loading} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <GoalsProgress goals={data.goals} loading={loading} />
          <DailyNotesPreview notes={data.dailyNotes} loading={loading} />
        </div>
      </div>
    </div>
  );
}
