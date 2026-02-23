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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/team/agents")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading || !data) return null;

  const total = data.agents.length;
  const active = data.agents.filter((a) => a.isActive).length;
  const lastRun = formatLastRun(data.agents);

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
          maxWidth: "50%",
          fontSize: "11px",
          color: "#9CA3AF",
          fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
          textAlign: "right",
          whiteSpace: "nowrap",
          textOverflow: "ellipsis",
          overflow: "hidden",
        }}
      >
        Last run: {lastRun}
      </div>
    </Card>
  );
}
