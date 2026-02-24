"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface SessionInfo {
  sessionId: string;
  startTime: string;
  duration: number | null;
  status: "running" | "completed" | "failed";
}

interface SubAgentInfo {
  id: string;
  name: string;
  emoji: string;
  status: "active" | "inactive";
  lastRun: string | null;
}

interface AgentInfo {
  id: string;
  name: string;
  emoji: string;
  role: string;
  status: "active" | "inactive";
  sessionCount: number;
  lastActive: string | null;
  lastAction: string | null;
  sessions: SessionInfo[];
  subAgents?: SubAgentInfo[];
}

interface TimelineEntry {
  action: string;
  timestamp: string;
}

const AGENT_META: Record<string, { label: string; emoji: string; role: string }> = {
  main: { label: "NASR", emoji: "🎯", role: "Strategic Consultant" },
  "cv-optimizer": { label: "CV Optimizer", emoji: "📄", role: "CV Optimization" },
  "job-hunter": { label: "Job Hunter", emoji: "🔍", role: "Job Hunting" },
  researcher: { label: "Researcher", emoji: "🔬", role: "Research" },
  "content-creator": { label: "Content Creator", emoji: "✍️", role: "Content Creation" },
};

function formatLastActive(iso: string | null): string {
  if (!iso) return "Never";
  try {
    const d = new Date(iso);
    const now = Date.now();
    const diff = now - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch {
    return "Unknown";
  }
}

function formatDuration(ms: number | null): string {
  if (!ms) return "-";
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const remainingSecs = secs % 60;
  if (mins < 60) return `${mins}m ${remainingSecs}s`;
  const hrs = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `${hrs}h ${remainingMins}m`;
}

function formatDateTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function AgentDetailPage({ params }: { params: Promise<{ agentId: string }> }) {
  const router = useRouter();
  const [agentId, setAgentId] = useState<string | null>(null);
  const [agent, setAgent] = useState<AgentInfo | null>(null);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(p => setAgentId(p.agentId));
  }, [params]);

  useEffect(() => {
    if (!agentId) return;
    
    fetch(`/api/team/agents/${agentId}`)
      .then(r => r.json())
      .then(d => {
        if (d.agent) {
          setAgent(d.agent);
          setTimeline(d.timeline || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [agentId]);

  if (loading) {
    return (
      <div style={{ 
        background: "#080C16", 
        minHeight: "100vh", 
        padding: "24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ color: "#A0A0B0", fontFamily: "var(--font-dm-sans, sans-serif)" }}>Loading...</div>
      </div>
    );
  }

  if (!agent) {
    return (
      <div style={{ 
        background: "#080C16", 
        minHeight: "100vh", 
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <div style={{ color: "#A0A0B0", fontFamily: "var(--font-dm-sans, sans-serif)", marginBottom: "16px" }}>Agent not found</div>
        <Link 
          href="/team"
          style={{ 
            color: "#4F8EF7", 
            textDecoration: "none",
            fontFamily: "var(--font-dm-sans, sans-serif)"
          }}
        >
          ← Back to Team
        </Link>
      </div>
    );
  }

  const isMain = agent.id === "main";

  return (
    <div style={{ 
      background: "#080C16", 
      minHeight: "100vh", 
      padding: "24px",
      fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
    }}>
      {/* Header */}
      <div style={{ marginBottom: "32px" }}>
        <Link 
          href="/team"
          style={{ 
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "#A0A0B0",
            textDecoration: "none",
            fontSize: "13px",
            marginBottom: "16px",
            transition: "color 0.2s"
          }}
        >
          <span>←</span> TEAM
        </Link>
        
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "36px" }}>{agent.emoji}</span>
            <h1 style={{ 
              fontFamily: "var(--font-syne, Syne, sans-serif)",
              fontSize: "28px",
              fontWeight: 700,
              color: "#F0F0F5",
              margin: 0,
              letterSpacing: "-0.02em"
            }}>
              {agent.name}
            </h1>
          </div>
          
          <div style={{ display: "flex", gap: "8px" }}>
            <span style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              background: agent.status === "active" ? "rgba(52, 211, 153, 0.1)" : "rgba(160, 160, 176, 0.1)",
              color: agent.status === "active" ? "#34D399" : "#A0A0B0",
              border: `1px solid ${agent.status === "active" ? "#34D39940" : "#1E2D45"}`,
            }}>
              <span style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: agent.status === "active" ? "#34D399" : "#A0A0B0",
              }} />
              {agent.status}
            </span>
            
            <span style={{
              padding: "4px 10px",
              borderRadius: "20px",
              fontSize: "11px",
              fontWeight: 600,
              background: "rgba(79, 142, 247, 0.1)",
              color: "#4F8EF7",
              border: "1px solid #4F8EF740",
            }}>
              {agent.sessionCount} sessions
            </span>
          </div>
        </div>
      </div>

      {/* Info Cards - Row */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", 
        gap: "16px",
        marginBottom: "32px"
      }}>
        {/* Card 1: Agent Info */}
        <div style={{
          background: "#0D1220",
          border: "1px solid #1E2D45",
          borderRadius: "10px",
          padding: "20px",
        }}>
          <h3 style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "12px",
            fontWeight: 700,
            color: "#A0A0B0",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "16px",
            marginTop: 0,
          }}>
            Agent Info
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8888A0", fontSize: "13px" }}>Role</span>
              <span style={{ color: "#F0F0F5", fontSize: "13px" }}>{agent.role}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8888A0", fontSize: "13px" }}>Status</span>
              <span style={{ 
                color: agent.status === "active" ? "#34D399" : "#A0A0B0", 
                fontSize: "13px",
                textTransform: "capitalize"
              }}>
                {agent.status}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8888A0", fontSize: "13px" }}>Total Sessions</span>
              <span style={{ color: "#F0F0F5", fontSize: "13px" }}>{agent.sessionCount}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#8888A0", fontSize: "13px" }}>Last Active</span>
              <span style={{ color: "#F0F0F5", fontSize: "13px" }}>
                {agent.lastActive ? formatLastActive(agent.lastActive) : "Never"}
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Recent Activity */}
        <div style={{
          background: "#0D1220",
          border: "1px solid #1E2D45",
          borderRadius: "10px",
          padding: "20px",
        }}>
          <h3 style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "12px",
            fontWeight: 700,
            color: "#A0A0B0",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "16px",
            marginTop: 0,
          }}>
            Recent Activity
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <span style={{ color: "#8888A0", fontSize: "13px", display: "block", marginBottom: "4px" }}>
                Last Action
              </span>
              <span style={{ color: "#F0F0F5", fontSize: "13px" }}>
                {agent.lastAction || "No recent actions"}
              </span>
            </div>
            <div>
              <span style={{ color: "#8888A0", fontSize: "13px", display: "block", marginBottom: "4px" }}>
                Last Active Time
              </span>
              <span style={{ color: "#F0F0F5", fontSize: "13px" }}>
                {agent.lastActive ? formatDateTime(agent.lastActive) : "Never"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Session History */}
      <div style={{
        background: "#0D1220",
        border: "1px solid #1E2D45",
        borderRadius: "10px",
        padding: "20px",
        marginBottom: "32px",
      }}>
        <h3 style={{
          fontFamily: "var(--font-syne, Syne, sans-serif)",
          fontSize: "12px",
          fontWeight: 700,
          color: "#A0A0B0",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          marginBottom: "16px",
          marginTop: 0,
        }}>
          Session History
        </h3>
        
        {agent.sessions.length === 0 ? (
          <div style={{ color: "#8888A0", fontSize: "13px", textAlign: "center", padding: "20px" }}>
            No sessions yet
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ 
              width: "100%", 
              borderCollapse: "collapse",
              fontSize: "13px"
            }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #1E2D45" }}>
                  <th style={{ 
                    textAlign: "left", 
                    padding: "12px 8px", 
                    color: "#8888A0",
                    fontWeight: 500,
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}>
                    Session ID
                  </th>
                  <th style={{ 
                    textAlign: "left", 
                    padding: "12px 8px", 
                    color: "#8888A0",
                    fontWeight: 500,
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}>
                    Start Time
                  </th>
                  <th style={{ 
                    textAlign: "left", 
                    padding: "12px 8px", 
                    color: "#8888A0",
                    fontWeight: 500,
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}>
                    Duration
                  </th>
                  <th style={{ 
                    textAlign: "left", 
                    padding: "12px 8px", 
                    color: "#8888A0",
                    fontWeight: 500,
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em"
                  }}>
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {agent.sessions.map((session) => (
                  <tr key={session.sessionId} style={{ borderBottom: "1px solid #1E2D4530" }}>
                    <td style={{ 
                      padding: "12px 8px", 
                      color: "#4F8EF7",
                      fontFamily: "var(--font-dm-mono, monospace)",
                      fontSize: "12px"
                    }}>
                      {session.sessionId.substring(0, 12)}...
                    </td>
                    <td style={{ padding: "12px 8px", color: "#F0F0F5" }}>
                      {formatDateTime(session.startTime)}
                    </td>
                    <td style={{ padding: "12px 8px", color: "#F0F0F5" }}>
                      {formatDuration(session.duration)}
                    </td>
                    <td style={{ padding: "12px 8px" }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "2px 8px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 500,
                        background: session.status === "completed" ? "rgba(52, 211, 153, 0.1)" :
                                   session.status === "failed" ? "rgba(239, 68, 68, 0.1)" :
                                   "rgba(79, 142, 247, 0.1)",
                        color: session.status === "completed" ? "#34D399" :
                               session.status === "failed" ? "#EF4444" :
                               "#4F8EF7",
                      }}>
                        <span style={{
                          width: "4px",
                          height: "4px",
                          borderRadius: "50%",
                          background: session.status === "completed" ? "#34D399" :
                                     session.status === "failed" ? "#EF4444" :
                                     "#4F8EF7",
                        }} />
                        {session.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sub-Agents (only for NASR) */}
      {isMain && agent.subAgents && agent.subAgents.length > 0 && (
        <div style={{
          background: "#0D1220",
          border: "1px solid #1E2D45",
          borderRadius: "10px",
          padding: "20px",
          marginBottom: "32px",
        }}>
          <h3 style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "12px",
            fontWeight: 700,
            color: "#A0A0B0",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "16px",
            marginTop: 0,
          }}>
            Sub-Agents
          </h3>
          
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
            gap: "12px" 
          }}>
            {agent.subAgents.map((subAgent) => (
              <Link
                key={subAgent.id}
                href={`/team/${subAgent.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  background: "#080C16",
                  border: "1px solid #1E2D45",
                  borderRadius: "8px",
                  textDecoration: "none",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: "24px" }}>{subAgent.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    color: "#F0F0F5", 
                    fontSize: "14px", 
                    fontWeight: 600,
                    marginBottom: "2px"
                  }}>
                    {subAgent.name}
                  </div>
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "6px",
                    fontSize: "11px",
                  }}>
                    <span style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      background: subAgent.status === "active" ? "#34D399" : "#A0A0B0",
                    }} />
                    <span style={{ color: subAgent.status === "active" ? "#34D399" : "#A0A0B0" }}>
                      {subAgent.status}
                    </span>
                    {subAgent.lastRun && (
                      <span style={{ color: "#8888A0" }}>
                        • {formatLastActive(subAgent.lastRun)}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Activity Timeline */}
      {timeline.length > 0 && (
        <div style={{
          background: "#0D1220",
          border: "1px solid #1E2D45",
          borderRadius: "10px",
          padding: "20px",
        }}>
          <h3 style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "12px",
            fontWeight: 700,
            color: "#A0A0B0",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "16px",
            marginTop: 0,
          }}>
            Activity Timeline
          </h3>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {timeline.map((entry, i) => (
              <div 
                key={i}
                style={{
                  display: "flex",
                  gap: "12px",
                  padding: "8px 0",
                  borderBottom: i < timeline.length - 1 ? "1px solid #1E2D4530" : "none",
                }}
              >
                <span style={{ 
                  color: "#4F8EF7", 
                  fontSize: "12px",
                  fontFamily: "var(--font-dm-mono, monospace)",
                  minWidth: "80px"
                }}>
                  {entry.timestamp}
                </span>
                <span style={{ color: "#F0F0F5", fontSize: "13px" }}>
                  {entry.action}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
