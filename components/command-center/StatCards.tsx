"use client";

/**
 * StatCards — Phase 3: A+ Polish (SSR-safe)
 * - CSS-only animations
 * - Hover effects
 * - Collapsible
 * - SSR-safe (no mounted state)
 */

import { useState } from "react";

interface Stats {
  activeJobs: number;
  avgAts: number | null;
  contentDue: number;
  openTasks: number;
  radarJobs?: number;
  prevActiveJobs?: number | null;
  prevAvgAts?: number | null;
  prevContentDue?: number | null;
  prevOpenTasks?: number | null;
  prevRadarJobs?: number | null;
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
  delay?: number;
}

function TrendBadge({ trend }: { trend: TrendDirection }) {
  if (trend === "na") {
    return (
      <span style={{
        fontSize: "9px",
        fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
        color: "#A0A0B0",
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
    na: { icon: "—", color: "#A0A0B0", label: "N/A" },
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
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="stat-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        flex: 1,
        minWidth: 0,
        background: "#0D1220",
        border: "1px solid #1E2D45",
        borderRadius: "10px",
        padding: "20px 20px 18px",
        position: "relative",
        overflow: "hidden",
        transform: isHovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: isHovered ? "0 12px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(79, 142, 247, 0.1)" : "none",
        borderColor: isHovered ? "#2a3f5f" : "#1E2D45",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
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
          opacity: isHovered ? 0.5 : 0.35,
          pointerEvents: "none",
          transition: "opacity 0.3s ease",
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
            color: "#A0A0B0",
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
      <div style={{
        maxHeight: showDetails && details ? "60px" : "0",
        opacity: showDetails && details ? 1 : 0,
        overflow: "hidden",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <div style={{
          marginTop: "8px",
          paddingTop: "8px",
          borderTop: "1px solid #1E2D45",
          fontSize: "11px",
          fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          color: "#A0A0B0",
          lineHeight: 1.5,
        }}>
          {details}
        </div>
      </div>
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
  const [collapsed, setCollapsed] = useState(true);

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
      value: loading ? "—" : stats?.radarJobs ?? 0,
      label: "Job Radar",
      color: "linear-gradient(135deg, #EC4899, #F472B6)",
      glow: "#EC4899",
      trend: calcTrend(stats?.radarJobs ?? null, stats?.prevRadarJobs ?? null),
      details: "High-potential roles parked in Radar. Review via HR → Focus: Job Radar.",
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
    <div style={{ marginBottom: "16px" }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stat-cards-grid {
          display: flex;
          gap: 12px;
          animation: fadeIn 0.4s ease;
        }
        @media (max-width: 600px) {
          .stat-cards-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 8px;
          }
          .stat-card {
            padding: 12px 10px !important;
          }
        }
      `}</style>

      {/* Collapsed header view */}
      {collapsed ? (
        <div
          onClick={() => setCollapsed(false)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 14px",
            background: "#0D1220",
            border: "1px solid #1E2D45",
            borderRadius: "8px",
            cursor: "pointer",
            transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#2a3f5f";
            e.currentTarget.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#1E2D45";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "13px" }}>📊</span>
            <span style={{
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              fontSize: "13px",
              color: "#F0F0F5",
              fontWeight: 500,
            }}>
              Dashboard Stats
            </span>
            <span style={{
              fontSize: "11px",
              color: "#A0A0B0",
              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            }}>
              {loading ? "—" : `${stats?.activeJobs ?? 0} jobs · ${stats?.openTasks ?? 0} tasks · ${stats?.avgAts ?? 0}% ATS`}
            </span>
          </div>
          <span style={{ fontSize: "11px", color: "#4F8EF7" }}>▼ Expand</span>
        </div>
      ) : (
        <>
          {/* Cards row */}
          <div className="stat-cards-grid" style={{ marginBottom: "8px" }}>
            {cards.map((card) => (
              <StatCard key={card.label} {...card} showDetails={showDetails} />
            ))}
          </div>

          {/* Toggle controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              onClick={() => setCollapsed(true)}
              style={{
                background: "transparent",
                border: "none",
                padding: "4px 8px",
                fontSize: "11px",
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                color: "#4F8EF7",
                cursor: "pointer",
              }}
            >
              ▲ Collapse
            </button>
            <button
              onClick={() => setShowDetails((s) => !s)}
              style={{
                background: "transparent",
                border: "1px solid #1E2D45",
                borderRadius: "20px",
                padding: "3px 12px",
                fontSize: "11px",
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                color: "#A0A0B0",
                cursor: "pointer",
              }}
            >
              {showDetails ? "▲ Hide details" : "▼ Show details"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
