"use client";

/**
 * StatCards — Phase 2 updates:
 * - Collapsible/expandable secondary stats toggle
 * - Trending indicators (↑ ↓ →) based on historical data or N/A
 * - Mobile-responsive grid (2-col on small screens)
 */

import { useState } from "react";

interface Stats {
  activeJobs: number;
  avgAts: number | null;
  contentDue: number;
  openTasks: number;
  /** Phase 2: optional previous-day values for trend calculation */
  prevActiveJobs?: number | null;
  prevAvgAts?: number | null;
  prevContentDue?: number | null;
  prevOpenTasks?: number | null;
}

type TrendDirection = "up" | "down" | "flat" | "na";

interface StatCardProps {
  value: string | number;
  label: string;
  color: string;
  glow: string;
  trend: TrendDirection;
  showDetails: boolean;
  details?: string;
}

function TrendBadge({ trend }: { trend: TrendDirection }) {
  if (trend === "na") {
    return (
      <span style={{
        fontSize: "9px",
        fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
        color: "#555570",
        letterSpacing: "0.05em",
      }}>
        Trend: N/A
      </span>
    );
  }
  const map: Record<TrendDirection, { icon: string; color: string; label: string }> = {
    up: { icon: "↑", color: "#34D399", label: "Up" },
    down: { icon: "↓", color: "#F87171", label: "Down" },
    flat: { icon: "→", color: "#FBBF24", label: "Stable" },
    na: { icon: "—", color: "#555570", label: "N/A" },
  };
  const { icon, color, label } = map[trend];
  return (
    <span style={{
      fontSize: "11px",
      fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
      color,
      fontWeight: 700,
    }} title={label}>
      {icon}
    </span>
  );
}

function StatCard({ value, label, color, glow, trend, showDetails, details }: StatCardProps) {
  return (
    <div
      className="stat-card"
      style={{
        flex: 1,
        minWidth: 0,
        background: "#0D1220",
        border: "1px solid #1E2D45",
        borderRadius: "10px",
        padding: "20px 20px 18px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle glow blob */}
      <div
        style={{
          position: "absolute",
          top: "-20px",
          right: "-20px",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: glow,
          filter: "blur(30px)",
          opacity: 0.35,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          fontFamily: "var(--font-syne, Syne, sans-serif)",
          fontSize: "28px",
          fontWeight: 700,
          background: color,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          lineHeight: 1.1,
          marginBottom: "4px",
          letterSpacing: "-0.03em",
        }}
      >
        {value}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
        <div
          style={{
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            fontSize: "11px",
            color: "#555570",
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </div>
        <TrendBadge trend={trend} />
      </div>

      {/* Secondary details — shown when expanded */}
      {showDetails && details && (
        <div style={{
          marginTop: "8px",
          paddingTop: "8px",
          borderTop: "1px solid #1E2D45",
          fontSize: "11px",
          fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          color: "#555570",
          lineHeight: 1.5,
        }}>
          {details}
        </div>
      )}
    </div>
  );
}

interface StatCardsProps {
  stats: Stats | null;
  loading?: boolean;
}

function calcTrend(current: number | null | undefined, prev: number | null | undefined): TrendDirection {
  if (current == null || prev == null) return "na";
  if (current > prev) return "up";
  if (current < prev) return "down";
  return "flat";
}

export default function StatCards({ stats, loading }: StatCardsProps) {
  const [showDetails, setShowDetails] = useState(false);

  const cards = [
    {
      value: loading ? "—" : stats?.activeJobs ?? 0,
      label: "Active Applications",
      color: "linear-gradient(135deg, #4F8EF7, #60A5FA)",
      glow: "#4F8EF7",
      trend: calcTrend(stats?.activeJobs, stats?.prevActiveJobs),
      details: "Applications in Identified, Applied, or Interview stages",
    },
    {
      value: loading ? "—" : stats?.avgAts != null ? `${stats.avgAts}%` : "N/A",
      label: "Avg ATS Score",
      color: "linear-gradient(135deg, #7C3AED, #A78BFA)",
      glow: "#7C3AED",
      trend: calcTrend(stats?.avgAts, stats?.prevAvgAts),
      details: "Average ATS score across active CVs",
    },
    {
      value: loading ? "—" : stats?.contentDue ?? 0,
      label: "Content Due",
      color: "linear-gradient(135deg, #D97706, #FBBF24)",
      glow: "#D97706",
      trend: calcTrend(stats?.contentDue, stats?.prevContentDue),
      details: "Content items in Draft or Review stage",
    },
    {
      value: loading ? "—" : stats?.openTasks ?? 0,
      label: "Open Tasks",
      color: "linear-gradient(135deg, #059669, #34D399)",
      glow: "#059669",
      trend: calcTrend(stats?.openTasks, stats?.prevOpenTasks),
      details: "Tasks not yet completed across all assignees",
    },
  ];

  return (
    <div style={{ marginBottom: "20px" }}>
      {/* Cards row */}
      <div className="stat-cards-grid" style={{ marginBottom: "8px" }}>
        <style>{`
          .stat-cards-grid {
            display: flex;
            gap: 16px;
          }
          @media (max-width: 600px) {
            .stat-cards-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 10px;
            }
            .stat-card {
              padding: 14px 12px !important;
            }
          }
        `}</style>
        {cards.map((card) => (
          <StatCard key={card.label} {...card} showDetails={showDetails} />
        ))}
      </div>

      {/* Toggle expand/collapse */}
      <div style={{ textAlign: "right" }}>
        <button
          onClick={() => setShowDetails((s) => !s)}
          style={{
            background: "transparent",
            border: "1px solid #1E2D45",
            borderRadius: "20px",
            padding: "3px 12px",
            fontSize: "11px",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            color: "#555570",
            cursor: "pointer",
            transition: "all 0.12s ease",
          }}
        >
          {showDetails ? "▲ Hide details" : "▼ Show details"}
        </button>
      </div>
    </div>
  );
}
