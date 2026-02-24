"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";

interface AgentInfo {
  id: string;
  name: string;
  emoji: string;
  role: string;
  lastActive: string | null;
  isActive: boolean;
  sessionCount: number;
}

interface RunRecord {
  id: string;
  task: string;
  agent: string;
  model: string;
  startTime: string;
  endTime: string | null;
  duration: string | null;
  outputFile: string | null;
  status: "completed" | "running" | "failed";
}

interface ApiResponse {
  agents: AgentInfo[];
}

function formatLastRun(agents: AgentInfo[]): string {
  const withLast = agents.filter((a) => a.lastActive);
  if (withLast.length === 0) return "No recent runs";

  const sorted = [...withLast].sort((a, b) => {
    const at = a.lastActive ? new Date(a.lastActive).getTime() : 0;
    const bt = b.lastActive ? new Date(b.lastActive).getTime() : 0;
    return bt - at;
  });

  const last = sorted[0];
  if (!last.lastActive) return "No recent runs";

  const d = new Date(last.lastActive);
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return `${last.name} just now`;
  if (mins < 60) return `${last.name} · ${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${last.name} · ${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${last.name} · ${days}d ago`;
}

export default function TeamStatus() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/team/agents").then((r) => r.json()),
      fetch("/api/team/runs").then((r) => r.json()),
    ])
      .then(([agentsData, runsData]) => {
        setData(agentsData);
        setRuns(runsData.runs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) return null;

  const total = data.agents.length;
  const active = data.agents.filter((a) => a.isActive).length;
  const lastRun = formatLastRun(data.agents);

  // Count failed runs in last 24h
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  const recentErrors = runs.filter((r) => {
    if (r.status !== "failed") return false;
    if (!r.endTime) return false;
    return new Date(r.endTime).getTime() > oneDayAgo;
  }).length;

  return (
    <Card
      style={{
        marginBottom: "20px",
        borderRadius: "10px",
        border: "1px solid #1E2D45",
        background: "#020617",
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "18px" }}>👥</span>
        <div>
          <div
            style={{
              fontFamily: "var(--font-syne, Syne, sans-serif)",
              fontSize: "13px",
              fontWeight: 600,
              color: "#F0F0F5",
              letterSpacing: "0.02em",
              textTransform: "uppercase",
            }}
          >
            Team Status
          </div>
          <div
            style={{
              marginTop: "2px",
              fontSize: "11px",
              color: "#9CA3AF",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            }}
          >
            Agents: {active}/{total} active
          </div>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "4px",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            color: "#9CA3AF",
            fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
          }}
        >
          Errors (24h): <span style={{ color: recentErrors > 0 ? "#F87171" : "#34D399" }}>{recentErrors}</span>
        </div>
        <div
          style={{
            fontSize: "11px",
            color: "#9CA3AF",
            fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            whiteSpace: "nowrap",
          }}
        >
          Last run: {lastRun}
        </div>
      </div>
    </Card>
  );
}
