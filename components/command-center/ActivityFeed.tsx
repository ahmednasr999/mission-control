"use client";

/**
 * ActivityFeed — Phase 3: A+ Polish (SSR-safe)
 * - Staggered fade-in using CSS only
 * - Hover lift effects
 * - SSR-safe (no state changes on mount)
 */

import { useState } from "react";
import { CheckCircle2, Briefcase, Zap, Clock } from "lucide-react";

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
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Build activities synchronously (SSR-safe)
  const activities: Activity[] = [];

  if (tasks?.length > 0) {
    tasks.slice(0, 3).forEach((task, i) => {
      activities.push({
        id: `task-${i}`,
        type: "task",
        icon: <CheckCircle2 size={14} />,
        message: `Task "${task.title}" marked ${task.status}`,
        timestamp: task.updatedAt || new Date().toISOString(),
        timeAgo: getTimeAgo(task.updatedAt),
      });
    });
  }

  if (jobs?.length > 0) {
    jobs.slice(0, 2).forEach((job, i) => {
      activities.push({
        id: `job-${i}`,
        type: "job",
        icon: <Briefcase size={14} />,
        message: `${job.company} — ${job.role} (${job.status})`,
        timestamp: job.updatedAt || new Date().toISOString(),
        timeAgo: getTimeAgo(job.updatedAt),
      });
    });
  }

  if (agents?.length > 0) {
    agents.slice(0, 2).forEach((agent, i) => {
      activities.push({
        id: `agent-${i}`,
        type: "agent",
        icon: <Zap size={14} />,
        message: `${agent.emoji} ${agent.name}: ${agent.lastAction}`,
        timestamp: agent.timestamp || new Date().toISOString(),
        timeAgo: getTimeAgo(agent.timestamp),
      });
    });
  }

  activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  const displayActivities = activities.slice(0, 6);

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
      <style>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .activity-item {
          animation: slideInRight 0.3s ease forwards;
        }
      `}</style>

      <CardHeader title="Live Activity" icon={<Clock size={16} />} badge={displayActivities.length} />

      {displayActivities.length === 0 ? (
        <EmptyState
          message="No recent activity"
          submessage="Start working — actions will appear here"
          action="View Team page →"
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {displayActivities.map((activity, i) => {
            const styles = TYPE_STYLES[activity.type];
            const isHovered = hoveredId === activity.id;

            return (
              <div
                key={activity.id}
                className="activity-item"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  padding: "10px 12px",
                  background: isHovered ? styles.bg.replace("0.08", "0.15") : styles.bg,
                  border: `1px solid ${isHovered ? styles.border.replace("0.2", "0.4") : styles.border}`,
                  borderRadius: "8px",
                  transform: isHovered ? "translateX(6px)" : "translateX(0)",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  animationDelay: `${i * 50}ms`,
                }}
                onMouseEnter={() => setHoveredId(activity.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <span style={{
                  color: styles.icon,
                  flexShrink: 0,
                  marginTop: "2px",
                  transform: isHovered ? "scale(1.2)" : "scale(1)",
                  transition: "transform 0.2s ease",
                }}>
                  {activity.icon}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                      fontSize: "12px",
                      color: isHovered ? "#F0F0F5" : "#E8E8ED",
                      lineHeight: 1.4,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      transition: "color 0.15s ease",
                    }}
                  >
                    {activity.message}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                      color: isHovered ? "#8888A0" : "#A0A0B0",
                      marginTop: "4px",
                      transition: "color 0.15s ease",
                    }}
                  >
                    {activity.timeAgo}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function CardHeader({ title, icon, badge }: { title: string; icon: React.ReactNode; badge?: number }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "12px",
        paddingBottom: "10px",
        borderBottom: "1px solid rgba(30, 45, 69, 0.5)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ color: "#4F8EF7" }}>{icon}</span>
        <span
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "13px",
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

function EmptyState({ message, submessage, action }: { message: string; submessage: string; action?: string }) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "24px 16px",
        color: "#A0A0B0",
      }}
    >
      <div style={{ fontSize: "24px", marginBottom: "8px" }}>📭</div>
      <div
        style={{
          fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          fontSize: "13px",
          fontWeight: 600,
          color: "#8888A0",
          marginBottom: "4px",
        }}
      >
        {message}
      </div>
      <div
        style={{
          fontSize: "11px",
          color: "#A0A0B0",
          marginBottom: action ? "8px" : 0,
        }}
      >
        {submessage}
      </div>
      {action && (
        <a
          href="/team"
          style={{
            fontSize: "11px",
            color: "#4F8EF7",
            textDecoration: "none",
          }}
        >
          {action}
        </a>
      )}
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: "#0D1220",
  border: "1px solid #1E2D45",
  borderRadius: "10px",
  padding: "12px",
  height: "100%",
  display: "flex",
  flexDirection: "column",
};
