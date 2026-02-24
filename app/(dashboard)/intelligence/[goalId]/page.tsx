"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Goal {
  id: number;
  category: string;
  objective: string;
  status: string;
  deadline: string | null;
  progress: number;
  updatedAt: string;
}

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  assignee: string;
}

interface ActivityEntry {
  date: string;
  excerpt: string;
  sourceFile: string;
}

interface GoalDetailData {
  goal: Goal;
  relatedGoals: Goal[];
  relatedTasks: Task[];
  activityTimeline: ActivityEntry[];
}

const categoryColors: Record<string, { bg: string; text: string }> = {
  "Executive Job Search": { bg: "rgba(79, 142, 247, 0.15)", text: "#4F8EF7" },
  "AI Automation Ecosystem": { bg: "rgba(124, 58, 237, 0.15)", text: "#A78BFA" },
  "TOPMED": { bg: "rgba(5, 150, 105, 0.15)", text: "#34D399" },
  "MBA": { bg: "rgba(217, 119, 6, 0.15)", text: "#FBBF24" },
  "Education": { bg: "rgba(217, 119, 6, 0.15)", text: "#FBBF24" },
  "Content & LinkedIn": { bg: "rgba(236, 72, 153, 0.15)", text: "#EC4899" },
};

const statusColors: Record<string, { bg: string; text: string }> = {
  Active: { bg: "rgba(5, 150, 105, 0.15)", text: "#34D399" },
  Done: { bg: "rgba(79, 142, 247, 0.15)", text: "#4F8EF7" },
  Completed: { bg: "rgba(79, 142, 247, 0.15)", text: "#4F8EF7" },
  "On Hold": { bg: "rgba(136, 136, 160, 0.15)", text: "#8888A0" },
};

const priorityDots: Record<string, string> = {
  High: "🔴",
  Medium: "🟡",
  Low: "🟢",
};

function ProgressBar({ progress }: { progress: number }) {
  const clamped = Math.max(0, Math.min(100, progress));
  const color = progress >= 75 ? "#34D399" : progress >= 40 ? "#FBBF24" : "#F87171";
  
  return (
    <div style={{ height: "8px", background: "#1E2D45", borderRadius: "4px", overflow: "hidden" }}>
      <div
        style={{
          height: "100%",
          width: `${clamped}%`,
          background: `linear-gradient(90deg, ${color}, ${color}CC)`,
          borderRadius: "4px",
          transition: "width 0.5s ease",
        }}
      />
    </div>
  );
}

function CircularProgress({ progress }: { progress: number }) {
  const clamped = Math.max(0, Math.min(100, progress));
  const color = progress >= 75 ? "#34D399" : progress >= 40 ? "#FBBF24" : "#F87171";
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (clamped / 100) * circumference;
  
  return (
    <div style={{ position: "relative", width: "100px", height: "100px" }}>
      <svg width="100" height="100" style={{ transform: "rotate(-90deg)" }}>
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="#1E2D45"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.5s ease" }}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          fontFamily: "var(--font-syne, Syne, sans-serif)",
          fontSize: "24px",
          fontWeight: 700,
          color: color,
        }}
      >
        {clamped}%
      </div>
    </div>
  );
}

export default function GoalDetailPage({ params }: { params: Promise<{ goalId: string }> }) {
  const [data, setData] = useState<GoalDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [goalId, setGoalId] = useState<string>("");

  useEffect(() => {
    params.then(p => {
      setGoalId(p.goalId);
      fetch(`/api/intelligence/goals/${p.goalId}`)
        .then(r => r.json())
        .then(d => setData(d))
        .catch(() => setData(null))
        .finally(() => setLoading(false));
    });
  }, [params]);

  if (loading) {
    return (
      <div style={{ padding: "32px", background: "#080C16", minHeight: "100vh" }}>
        <div style={{ color: "#A0A0B0", fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)" }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!data || !data.goal) {
    return (
      <div style={{ padding: "32px", background: "#080C16", minHeight: "100vh" }}>
        <Link
          href="/intelligence"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#4F8EF7",
            textDecoration: "none",
            fontSize: "14px",
            marginBottom: "24px",
          }}
        >
          ← Back to INTELLIGENCE
        </Link>
        <div style={{ color: "#A0A0B0", fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)" }}>
          Goal not found
        </div>
      </div>
    );
  }

  const { goal, relatedGoals, relatedTasks, activityTimeline } = data;
  const categoryColor = categoryColors[goal.category] || { bg: "rgba(136, 136, 160, 0.15)", text: "#8888A0" };
  const statusColor = statusColors[goal.status] || statusColors.Active;

  return (
    <div style={{ padding: "32px", background: "#080C16", minHeight: "100vh" }}>
      {/* Back Button */}
      <Link
        href="/intelligence"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          color: "#4F8EF7",
          textDecoration: "none",
          fontSize: "14px",
          marginBottom: "24px",
          transition: "color 0.2s ease",
        }}
      >
        ← INTELLIGENCE
      </Link>

      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "28px",
            fontWeight: 700,
            color: "#F0F0F5",
            margin: "0 0 16px",
            lineHeight: 1.3,
          }}
        >
          {goal.objective}
        </h1>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 600,
              background: categoryColor.bg,
              color: categoryColor.text,
              border: `1px solid ${categoryColor.text}40`,
            }}
          >
            {goal.category}
          </span>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 600,
              background: statusColor.bg,
              color: statusColor.text,
              border: `1px solid ${statusColor.text}40`,
            }}
          >
            {goal.status}
          </span>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: "4px",
              fontSize: "12px",
              fontWeight: 700,
              fontFamily: "var(--font-syne, Syne, sans-serif)",
              background: "rgba(79, 142, 247, 0.15)",
              color: "#4F8EF7",
              border: "1px solid #4F8EF740",
            }}
          >
            {goal.progress}%
          </span>
        </div>
      </div>

      {/* Info Cards Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        {/* Card 1: Goal Info */}
        <div
          style={{
            background: "#0D1220",
            border: "1px solid #1E2D45",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-syne, Syne, sans-serif)",
              fontSize: "16px",
              fontWeight: 700,
              color: "#F0F0F5",
              margin: "0 0 16px",
            }}
          >
            Goal Info
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <div style={{ fontSize: "11px", color: "#A0A0B0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Category</div>
              <div style={{ fontSize: "14px", color: "#F0F0F5" }}>{goal.category}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#A0A0B0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Deadline</div>
              <div style={{ fontSize: "14px", color: "#F0F0F5" }}>{goal.deadline || "Not set"}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#A0A0B0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Status</div>
              <div style={{ fontSize: "14px", color: statusColor.text }}>{goal.status}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "#A0A0B0", textTransform: "uppercase", letterSpacing: "0.05em" }}>Created</div>
              <div style={{ fontSize: "14px", color: "#F0F0F5" }}>{new Date(goal.updatedAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>

        {/* Card 2: Progress */}
        <div
          style={{
            background: "#0D1220",
            border: "1px solid #1E2D45",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-syne, Syne, sans-serif)",
              fontSize: "16px",
              fontWeight: 700,
              color: "#F0F0F5",
              margin: "0 0 16px",
            }}
          >
            Progress
          </h3>
          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <CircularProgress progress={goal.progress} />
            <div style={{ flex: 1 }}>
              <ProgressBar progress={goal.progress} />
              <div style={{ marginTop: "12px", fontSize: "12px", color: "#A0A0B0" }}>
                Last updated: {new Date(goal.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      {activityTimeline.length > 0 && (
        <div
          style={{
            background: "#0D1220",
            border: "1px solid #1E2D45",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "32px",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-syne, Syne, sans-serif)",
              fontSize: "16px",
              fontWeight: 700,
              color: "#F0F0F5",
              margin: "0 0 16px",
            }}
          >
            Activity Timeline
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {activityTimeline.map((entry, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: "12px",
                  padding: "12px",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: "8px",
                  border: "1px solid #1E2D45",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                    fontSize: "11px",
                    color: "#4F8EF7",
                    whiteSpace: "nowrap",
                  }}
                >
                  {entry.date}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "13px", color: "#A0A0B0" }}>{entry.excerpt}</div>
                  <div style={{ fontSize: "11px", color: "#666", marginTop: "4px" }}>From: {entry.sourceFile}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Related Tasks */}
      {relatedTasks.length > 0 && (
        <div
          style={{
            background: "#0D1220",
            border: "1px solid #1E2D45",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "32px",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-syne, Syne, sans-serif)",
              fontSize: "16px",
              fontWeight: 700,
              color: "#F0F0F5",
              margin: "0 0 16px",
            }}
          >
            Related Tasks
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {relatedTasks.map((task) => (
              <Link
                key={task.id}
                href={`/ops/${task.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: "8px",
                  border: "1px solid #1E2D45",
                  textDecoration: "none",
                  transition: "background 0.2s ease",
                }}
              >
                <span style={{ fontSize: "12px" }}>{priorityDots[task.priority] || "🟡"}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#F0F0F5",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {task.title}
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "11px",
                    color: "#A0A0B0",
                    padding: "2px 8px",
                    background: "rgba(136, 136, 160, 0.1)",
                    borderRadius: "4px",
                  }}
                >
                  {task.status}
                </span>
                <span style={{ fontSize: "11px", color: "#666" }}>{task.assignee}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Related Goals */}
      {relatedGoals.length > 0 && (
        <div
          style={{
            background: "#0D1220",
            border: "1px solid #1E2D45",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h3
            style={{
              fontFamily: "var(--font-syne, Syne, sans-serif)",
              fontSize: "16px",
              fontWeight: 700,
              color: "#F0F0F5",
              margin: "0 0 16px",
            }}
          >
            Related Goals
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {relatedGoals.map((g) => (
              <Link
                key={g.id}
                href={`/intelligence/${g.id}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  padding: "12px",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: "8px",
                  border: "1px solid #1E2D45",
                  textDecoration: "none",
                  transition: "background 0.2s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span
                    style={{
                      fontSize: "14px",
                      color: "#F0F0F5",
                      flex: 1,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {g.objective}
                  </span>
                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      color: g.progress >= 75 ? "#34D399" : "#4F8EF7",
                    }}
                  >
                    {g.progress}%
                  </span>
                </div>
                <ProgressBar progress={g.progress} />
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
