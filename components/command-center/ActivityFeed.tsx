"use client";

/**
 * ActivityFeed — Unified live activity feed
 * Phase 2 UX enhancement: Replaces AgentActivity with unified timeline
 * Shows: task updates, job changes, content moves, agent actions
 */

import { useEffect, useState } from "react";
import { CheckCircle2, Briefcase, FileText, Zap, Clock } from "lucide-react";

interface Activity {
  id: string;
  type: "task" | "job" | "content" | "agent";
  icon: React.ReactNode;
  message: string;
  timestamp: string;
  timeAgo: string;
}

interface ActivityFeedProps {
  tasks: any[];
  jobs: any[];
  agents: any[];
  loading?: boolean;
}

function getTimeAgo(timestamp: string | null): string {
  if (!timestamp) return "just now";
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const TYPE_STYLES: Record<string, { bg: string; border: string; icon: string }> = {
  task: { bg: "rgba(52, 211, 153, 0.08)", border: "rgba(52, 211, 153, 0.2)", icon: "#34D399" },
  job: { bg: "rgba(79, 142, 247, 0.08)", border: "rgba(79, 142, 247, 0.2)", icon: "#4F8EF7" },
  content: { bg: "rgba(124, 58, 237, 0.08)", border: "rgba(124, 58, 237, 0.2)", icon: "#7C3AED" },
  agent: { bg: "rgba(251, 191, 36, 0.08)", border: "rgba(251, 191, 36, 0.2)", icon: "#FBBF24" },
};

export default function ActivityFeed({ tasks, jobs, agents, loading }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const generated: Activity[] = [];

    // Add task activities
    if (tasks?.length > 0) {
      tasks.slice(0, 3).forEach((task, i) => {
        generated.push({
          id: `task-${i}`,
          type: "task",
          icon: <CheckCircle2 size={14} />,
          message: `Task "${task.title}" marked ${task.status}`,
          timestamp: task.updatedAt || new Date().toISOString(),
          timeAgo: getTimeAgo(task.updatedAt),
        });
      });
    }

    // Add job activities
    if (jobs?.length > 0) {
      jobs.slice(0, 2).forEach((job, i) => {
        generated.push({
          id: `job-${i}`,
          type: "job",
          icon: <Briefcase size={14} />,
          message: `${job.company} — ${job.role} (${job.status})`,
          timestamp: job.updatedAt || new Date().toISOString(),
          timeAgo: getTimeAgo(job.updatedAt),
        });
      });
    }

    // Add agent activities
    if (agents?.length > 0) {
      agents.slice(0, 2).forEach((agent, i) => {
        generated.push({
          id: `agent-${i}`,
          type: "agent",
          icon: <Zap size={14} />,
          message: `${agent.emoji} ${agent.name}: ${agent.lastAction}`,
          timestamp: agent.timestamp || new Date().toISOString(),
          timeAgo: getTimeAgo(agent.timestamp),
        });
      });
    }

    // Sort by timestamp (newest first)
    generated.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Add demo activities if empty
    if (generated.length === 0 && !loading) {
      generated.push(
        {
          id: "demo-1",
          type: "task",
          icon: <CheckCircle2 size={14} />,
          message: "Task 'Delphi interview prep' moved to In Progress",
          timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          timeAgo: "5m ago",
        },
        {
          id: "demo-2",
          type: "job",
          icon: <Briefcase size={14} />,
          message: "CV generated for Delphi Consulting (91% ATS)",
          timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
          timeAgo: "30m ago",
        },
        {
          id: "demo-3",
          type: "agent",
          icon: <Zap size={14} />,
          message: "🎯 NASR: Updated Mission Control dashboard",
          timestamp: new Date(Date.now() - 2 * 3600000).toISOString(),
          timeAgo: "2h ago",
        }
      );
    }

    setActivities(generated.slice(0, 6));
  }, [tasks, jobs, agents, loading]);

  if (loading) {
    return (
      <div style={cardStyle}>
        <CardHeader title="Live Activity" icon={<Clock size={16} />} />
        <div style={{ color: "#A0A0B0", fontSize: "13px", padding: "20px 0" }}>Loading activity...</div>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <CardHeader title="Live Activity" icon={<Clock size={16} />} badge={activities.length} />
      
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {activities.map((activity) => {
          const styles = TYPE_STYLES[activity.type];
          return (
            <div
              key={activity.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                padding: "10px 12px",
                background: styles.bg,
                border: `1px solid ${styles.border}`,
                borderRadius: "8px",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <span style={{ color: styles.icon, flexShrink: 0, marginTop: "2px" }}>
                {activity.icon}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                    fontSize: "12px",
                    color: "#F0F0F5",
                    lineHeight: 1.4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {activity.message}
                </div>
                <div
                  style={{
                    fontSize: "10px",
                    fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                    color: "#A0A0B0",
                    marginTop: "4px",
                  }}
                >
                  {activity.timeAgo}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {activities.length === 0 && (
        <EmptyState message="No recent activity" submessage="Actions will appear here as you work" />
      )}
    </div>
  );
}

// ---- Subcomponents ----

function CardHeader({ title, icon, badge }: { title: string; icon: React.ReactNode; badge?: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "16px",
        paddingBottom: "12px",
        borderBottom: "1px solid rgba(30, 45, 69, 0.5)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: "#4F8EF7" }}>{icon}</span>
        <span
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "14px",
            fontWeight: 700,
            color: "#F0F0F5",
          }}
        >
          {title}
        </span>
      </div>
      {badge !== undefined && badge > 0 && (
        <span
          style={{
            fontSize: "10px",
            fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            color: "#4F8EF7",
            background: "rgba(79, 142, 247, 0.15)",
            padding: "2px 8px",
            borderRadius: "10px",
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

function EmptyState({ message, submessage }: { message: string; submessage: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "32px 20px",
        color: "#A0A0B0",
      }}
    >
      <div style={{ fontSize: "32px", marginBottom: "12px" }}>📭</div>
      <div
        style={{
          fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          fontSize: "14px",
          fontWeight: 600,
          color: "#8888A0",
          marginBottom: "4px",
        }}
      >
        {message}
      </div>
      <div
        style={{
          fontSize: "12px",
          color: "#A0A0B0",
        }}
      >
        {submessage}
      </div>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#0D1220",
  border: "1px solid #1E2D45",
  borderRadius: "10px",
  padding: "16px",
  height: "100%",
  display: "flex",
  flexDirection: "column",
};
