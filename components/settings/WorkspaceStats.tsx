"use client";

/**
 * WorkspaceStats — Phase 2 updates:
 * - Shows file growth trend over last 7 days
 */

import { useState, useEffect } from "react";

interface StatsData {
  memoryFiles: string;
  memorySize: string;
  sessionFiles: string;
  agentCount: string;
  dailyLogs: string;
  workspaceSize: string;
  /** Phase 2: daily file count trend, format "MM-DD:count" */
  fileGrowthTrend?: string[];
}

interface StatItemProps {
  value: string;
  label: string;
  gradient: string;
}

function StatItem({ value, label, gradient }: StatItemProps) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid #1E2D45",
        borderRadius: "8px",
        padding: "18px 16px",
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <div
        style={{
          fontFamily: "var(--font-syne, Syne, sans-serif)",
          fontSize: "24px",
          fontWeight: 700,
          background: gradient,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          fontSize: "11px",
          color: "#A0A0B0",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          fontWeight: 500,
        }}
      >
        {label}
      </div>
    </div>
  );
}

/** Mini sparkline bar chart for the 7-day trend */
function FileGrowthChart({ trend }: { trend: string[] }) {
  if (!trend || trend.length === 0) {
    return (
      <div style={{
        fontSize: "11px",
        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
        color: "#A0A0B0",
      }}>
        Trend: N/A
      </div>
    );
  }

  const parsed = trend.map((t) => {
    const [date, countStr] = t.split(":");
    return { date, count: parseInt(countStr || "0", 10) };
  });
  const maxVal = Math.max(...parsed.map((p) => p.count), 1);

  return (
    <div>
      <div style={{
        fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
        fontSize: "10px",
        color: "#A0A0B0",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        marginBottom: "8px",
      }}>
        Memory File Activity (7 days)
      </div>
      <div style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "4px",
        height: "40px",
      }}>
        {parsed.map(({ date, count }) => {
          const heightPct = maxVal > 0 ? (count / maxVal) * 100 : 0;
          return (
            <div
              key={date}
              title={`${date}: ${count} files`}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "2px",
                height: "100%",
                justifyContent: "flex-end",
              }}
            >
              <div style={{
                width: "100%",
                height: `${Math.max(heightPct, 4)}%`,
                background: count > 0
                  ? "linear-gradient(180deg, #4F8EF7, #7C3AED)"
                  : "rgba(136,136,160,0.15)",
                borderRadius: "2px",
                transition: "height 0.3s ease",
                minHeight: "3px",
              }} />
              <div style={{
                fontSize: "8px",
                fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                color: "#A0A0B0",
                whiteSpace: "nowrap",
              }}>
                {date}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const STAT_CONFIGS = [
  {
    key: "memoryFiles" as keyof StatsData,
    label: "Memory Files",
    gradient: "linear-gradient(135deg, #4F8EF7, #60A5FA)",
  },
  {
    key: "memorySize" as keyof StatsData,
    label: "Memory Size",
    gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)",
  },
  {
    key: "sessionFiles" as keyof StatsData,
    label: "Session Files",
    gradient: "linear-gradient(135deg, #059669, #34D399)",
  },
  {
    key: "agentCount" as keyof StatsData,
    label: "Active Agents",
    gradient: "linear-gradient(135deg, #D97706, #FBBF24)",
  },
  {
    key: "dailyLogs" as keyof StatsData,
    label: "Daily Logs (2026)",
    gradient: "linear-gradient(135deg, #EC4899, #F472B6)",
  },
  {
    key: "workspaceSize" as keyof StatsData,
    label: "Total Workspace",
    gradient: "linear-gradient(135deg, #0891B2, #22D3EE)",
  },
];

export default function WorkspaceStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() =>
        setStats({
          memoryFiles: "—",
          memorySize: "—",
          sessionFiles: "—",
          agentCount: "—",
          dailyLogs: "—",
          workspaceSize: "—",
        })
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      style={{
        background: "#0D1220",
        border: "1px solid #1E2D45",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid #1E2D45",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "16px",
            fontWeight: 700,
            color: "#F0F0F5",
          }}
        >
          Workspace Statistics
        </span>
      </div>

      <div style={{ padding: "20px" }}>
        {loading ? (
          <div
            style={{
              color: "#A0A0B0",
              fontSize: "13px",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              padding: "20px 0",
              textAlign: "center",
            }}
          >
            Gathering statistics…
          </div>
        ) : (
          <>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              {STAT_CONFIGS.map((cfg) => (
                <StatItem
                  key={cfg.key}
                  value={stats?.[cfg.key] as string ?? "—"}
                  label={cfg.label}
                  gradient={cfg.gradient}
                />
              ))}
            </div>

            {/* Phase 2: File growth trend chart */}
            <div style={{
              padding: "16px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid #1E2D45",
              borderRadius: "8px",
            }}>
              <FileGrowthChart trend={stats?.fileGrowthTrend ?? []} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
