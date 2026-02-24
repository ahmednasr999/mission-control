"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import AlertBanner from "@/components/command-center/AlertBanner";
import StatCards from "@/components/command-center/StatCards";
import TaskList from "@/components/command-center/TaskList";
import PipelinePreview from "@/components/command-center/PipelinePreview";
import ActivityFeed from "@/components/command-center/ActivityFeed";
import ContentPreview from "@/components/command-center/ContentPreview";
import GoalsProgress from "@/components/command-center/GoalsProgress";
import DailyNotesPreview from "@/components/command-center/DailyNotesPreview";
import SlidePanel from "@/components/ui/SlidePanel";
import { Badge } from "@/components/ui/badge";

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
  sessionCount?: number;
  agentId?: string;
}

interface ContentStages {
  ideas: number;
  draft: number;
  review: number;
  published: number;
}

interface Goal {
  id?: number;
  category: string;
  objective: string;
  progress: number;
  status: string;
}

interface ContentItem {
  id: string;
  title: string;
  pillar: string;
  stage: string;
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
  contentItems: ContentItem[];
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
  contentItems: [],
};

// ---- Component ----

export default function CommandCenterPage() {
  const [data, setData] = useState<DashboardData>(INITIAL);
  const [loading, setLoading] = useState(true);
  const [activePanel, setActivePanel] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    const [alertsRes, statsRes, tasksRes, pipelineRes, agentsRes, contentRes, goalsRes, notesRes, marketingRes] =
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
        safeFetch<{ columns: { ideas: ContentItem[]; draft: ContentItem[]; review: ContentItem[]; scheduled: ContentItem[]; published: ContentItem[] } }>("/api/marketing/pipeline", { columns: { ideas: [], draft: [], review: [], scheduled: [], published: [] } }),
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
      contentItems: [
        ...(marketingRes.columns?.ideas || []),
        ...(marketingRes.columns?.draft || []),
        ...(marketingRes.columns?.review || []),
        ...(marketingRes.columns?.scheduled || []),
        ...(marketingRes.columns?.published || []),
      ],
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
      <StatCards stats={data.stats} loading={loading} onStatClick={(stat) => {
        if (stat === "activeJobs") setActivePanel("jobs");
        if (stat === "openTasks") setActivePanel("tasks");
      }} />

      {/* 3-Column grid */}
      <div className="cc-grid-3">
        <TaskList tasks={data.tasks} loading={loading} />
        <PipelinePreview jobs={data.jobs} loading={loading} />
        <ActivityFeed tasks={data.tasks} jobs={data.jobs} agents={data.agents} loading={loading} onAgentClick={() => setActivePanel("agents")} />
      </div>

      {/* 2-Column bottom grid */}
      <div className="cc-grid-2">
        <ContentPreview stages={data.stages} loading={loading} onClick={() => setActivePanel("content")} />
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <GoalsProgress goals={data.goals} loading={loading} onClick={() => setActivePanel("goals")} />
          <DailyNotesPreview notes={data.dailyNotes} loading={loading} />
        </div>
      </div>

      {/* Panel A — Active Jobs */}
      <SlidePanel isOpen={activePanel === "jobs"} onClose={() => setActivePanel(null)} title="Active Job Leads">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {data.jobs.length === 0 ? (
            <div style={{ textAlign: "center", color: "#A0A0B0", padding: "32px 0" }}>No active jobs</div>
          ) : (
            data.jobs.map((job, i) => {
              const statusColors: Record<string, { bg: string; text: string }> = {
                Applied: { bg: "rgba(79, 142, 247, 0.15)", text: "#4F8EF7" },
                Interview: { bg: "rgba(124, 58, 237, 0.15)", text: "#A78BFA" },
                Offer: { bg: "rgba(5, 150, 105, 0.15)", text: "#34D399" },
                Rejected: { bg: "rgba(239, 68, 68, 0.12)", text: "#F87171" },
                Screening: { bg: "rgba(217, 119, 6, 0.15)", text: "#FBBF24" },
              };
              const status = job.status || "Applied";
              const colors = statusColors[status] || { bg: "rgba(136, 136, 160, 0.15)", text: "#8888A0" };
              const jobId = job.company.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
              return (
                <Link 
                  key={i} 
                  href={`/hr/${jobId}`}
                  style={{ 
                    display: "block", 
                    background: "#0D1220", 
                    border: "1px solid #1E2D45", 
                    borderRadius: "8px", 
                    padding: "12px",
                    textDecoration: "none"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)", fontSize: "14px", fontWeight: 600, color: "#F0F0F5" }}>{job.company}</div>
                      <div style={{ fontSize: "12px", color: "#A0A0B0" }}>{job.role}</div>
                    </div>
                    <Badge style={{ fontSize: "10px", background: colors.bg, color: colors.text, borderRadius: "4px" }}>{status}</Badge>
                  </div>
                  {job.atsScore !== null && (
                    <div style={{ fontFamily: "var(--font-dm-mono, DM Mono, monospace)", fontSize: "10px", color: job.atsScore >= 70 ? "#34D399" : "#F87171" }}>
                      ATS Score: {job.atsScore}%
                    </div>
                  )}
                </Link>
              );
            })
          )}
          <Link href="/hr" style={{ display: "block", textAlign: "center", marginTop: "8px", padding: "10px", background: "#1E2D45", borderRadius: "6px", color: "#4F8EF7", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
            View All →
          </Link>
        </div>
      </SlidePanel>

      {/* Panel B — Open Tasks */}
      <SlidePanel isOpen={activePanel === "tasks"} onClose={() => setActivePanel(null)} title="Open Tasks">
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {data.tasks.length === 0 ? (
            <div style={{ textAlign: "center", color: "#A0A0B0", padding: "32px 0" }}>No open tasks</div>
          ) : (
            [...data.tasks].sort((a, b) => {
              const order = { High: 0, Medium: 1, Low: 2 };
              return (order[a.priority as keyof typeof order] ?? 1) - (order[b.priority as keyof typeof order] ?? 1);
            }).map((task, i) => (
              <Link key={task.id || i} href={`/ops/${task.id}`} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 12px", background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "6px", textDecoration: "none" }}>
                <span style={{ fontSize: "12px" }}>{task.priority === "High" ? "🔴" : task.priority === "Medium" ? "🟡" : "🟢"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "13px", color: "#F0F0F5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{task.title}</div>
                  <div style={{ fontSize: "11px", color: "#A0A0B0" }}>{task.assignee} • {task.dueDate || "No due date"}</div>
                </div>
              </Link>
            ))
          )}
          <Link href="/ops" style={{ display: "block", textAlign: "center", marginTop: "8px", padding: "10px", background: "#1E2D45", borderRadius: "6px", color: "#EC4899", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
            View All →
          </Link>
        </div>
      </SlidePanel>

      {/* Panel C — Agent Activity */}
      <SlidePanel isOpen={activePanel === "agents"} onClose={() => setActivePanel(null)} title="Agent Activity">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {data.agents.length === 0 ? (
            <div style={{ textAlign: "center", color: "#A0A0B0", padding: "32px 0" }}>No agents configured</div>
          ) : (
            data.agents.map((agent, i) => {
              const agentId = agent.agentId || (agent.name === "NASR" ? "main" : agent.name.toLowerCase().replace(/\s+/g, "-"));
              return (
                <Link 
                  key={agent.name} 
                  href={`/team/${agentId}`}
                  style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "8px", textDecoration: "none" }}
                >
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "linear-gradient(135deg, rgba(79, 142, 247, 0.2), rgba(124, 58, 237, 0.2))", border: "1px solid #1E2D45", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>
                    {agent.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--font-syne, Syne, sans-serif)", fontSize: "14px", fontWeight: 700, color: "#F0F0F5" }}>{agent.name}</div>
                    <div style={{ fontSize: "12px", color: "#A0A0B0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{agent.lastAction}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "var(--font-dm-mono, DM Mono, monospace)", fontSize: "10px", color: "#34D399" }}>{agent.timestamp || "—"}</div>
                    {agent.sessionCount !== undefined && <div style={{ fontSize: "10px", color: "#A0A0B0" }}>{agent.sessionCount} sessions</div>}
                  </div>
                </Link>
              );
            })
          )}
          <Link href="/team" style={{ display: "block", textAlign: "center", marginTop: "8px", padding: "10px", background: "#1E2D45", borderRadius: "6px", color: "#7C3AED", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
            View All →
          </Link>
        </div>
      </SlidePanel>

      {/* Panel D — Content Pipeline */}
      <SlidePanel isOpen={activePanel === "content"} onClose={() => setActivePanel(null)} title="Content Pipeline">
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {["ideas", "draft", "review", "published"].map((stage) => {
            const items = data.contentItems.filter(item => item.stage.toLowerCase() === stage);
            const stageColors: Record<string, { color: string; bg: string }> = {
              ideas: { color: "#8888A0", bg: "rgba(136, 136, 160, 0.15)" },
              draft: { color: "#D97706", bg: "rgba(217, 119, 6, 0.15)" },
              review: { color: "#7C3AED", bg: "rgba(124, 58, 237, 0.15)" },
              published: { color: "#059669", bg: "rgba(5, 150, 105, 0.15)" },
            };
            const colors = stageColors[stage] || { color: "#A0A0B0", bg: "#1E2D45" };
            return (
              <div key={stage}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: colors.color }}></span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: colors.color, textTransform: "capitalize" }}>{stage}</span>
                  <span style={{ fontSize: "11px", color: "#A0A0B0" }}>({items.length})</span>
                </div>
                {items.length === 0 ? (
                  <div style={{ fontSize: "12px", color: "#666", paddingLeft: "16px" }}>No items</div>
                ) : (
                  items.slice(0, 3).map((item, i) => (
                    <Link
                      key={item.id || i}
                      href={`/marketing/${item.id}`}
                      style={{
                        display: "block",
                        marginLeft: "16px",
                        padding: "8px 10px",
                        background: "#0D1220",
                        border: "1px solid #1E2D45",
                        borderRadius: "6px",
                        marginBottom: "6px",
                        textDecoration: "none",
                      }}
                    >
                      <div style={{ fontSize: "13px", color: "#F0F0F5", marginBottom: "4px" }}>{item.title}</div>
                      <Badge style={{ fontSize: "9px", background: colors.bg, color: colors.color, borderRadius: "3px" }}>{item.pillar}</Badge>
                    </Link>
                  ))
                )}
              </div>
            );
          })}
          <Link href="/marketing" style={{ display: "block", textAlign: "center", marginTop: "8px", padding: "10px", background: "#1E2D45", borderRadius: "6px", color: "#F59E0B", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
            View All →
          </Link>
        </div>
      </SlidePanel>

      {/* Panel E — Goals */}
      <SlidePanel isOpen={activePanel === "goals"} onClose={() => setActivePanel(null)} title="Goals">
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {data.goals.length === 0 ? (
            <div style={{ textAlign: "center", color: "#A0A0B0", padding: "32px 0" }}>No goals set</div>
          ) : (
            data.goals.map((goal, i) => {
              const categoryColors: Record<string, string> = {
                Revenue: "#34D399",
                Growth: "#4F8EF7",
                Retention: "#7C3AED",
                Default: "#A0A0B0",
              };
              const color = categoryColors[goal.category] || categoryColors.Default;
              const isComplete = goal.status === "complete";
              return (
                <Link 
                  key={i} 
                  href={`/intelligence/${goal.id}`}
                  style={{ 
                    display: "block", 
                    background: "#0D1220", 
                    border: "1px solid #1E2D45", 
                    borderRadius: "8px", 
                    padding: "12px",
                    textDecoration: "none"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <Badge style={{ fontSize: "9px", background: `${color}20`, color, borderRadius: "3px", border: `1px solid ${color}40` }}>{goal.category}</Badge>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#F0F0F5", flex: 1 }}>{goal.objective}</span>
                    <span style={{ fontFamily: "var(--font-syne, Syne, sans-serif)", fontSize: "14px", fontWeight: 700, color: goal.progress >= 80 ? "#34D399" : "#4F8EF7" }}>{goal.progress}%</span>
                  </div>
                  <div style={{ height: "4px", background: "#1E2D45", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${goal.progress}%`, background: isComplete ? "linear-gradient(90deg, #059669, #34D399)" : "linear-gradient(90deg, #4F8EF7, #7C3AED)", borderRadius: "2px" }}></div>
                  </div>
                </Link>
              );
            })
          )}
          <Link href="/intelligence" style={{ display: "block", textAlign: "center", marginTop: "8px", padding: "10px", background: "#1E2D45", borderRadius: "6px", color: "#4F8EF7", textDecoration: "none", fontSize: "13px", fontWeight: 600 }}>
            View All →
          </Link>
        </div>
      </SlidePanel>
    </div>
  );
}
