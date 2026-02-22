"use client";

/**
 * StatCards — Phase 3: A+ Animations
 * - Smooth expand/collapse with height animation
 * - Card hover lift + shadow
 * - Staggered fade-in on mount
 * - Counter animation on value change
 */

import { useState, useEffect, useRef } from "react";

interface Stats {
  activeJobs: number;
  avgAts: number | null;
  contentDue: number;
  openTasks: number;
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
  delay?: number;
}

// Animated counter hook - browser only
function useAnimatedCounter(target: number, duration = 600) {
  const [count, setCount] = useState(target);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    startTimeRef.current = null;
    
    const animate = (currentTime: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = currentTime;
      }
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(target * easeOut));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration]);

  return count;
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
      animation: "fadeIn 0.3s ease",
    }} title={label}>
      {icon}
    </span>
  );
}

function StatCard({ value, label, color, glow, trend, showDetails, details, delay = 0 }: StatCardProps) {
  const [mounted, setMounted] = useState(false);
  const numericValue = typeof value === "number" ? value : parseInt(value as string) || 0;
  const animatedValue = useAnimatedCounter(numericValue);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

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
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 12px 32px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(79, 142, 247, 0.1)";
        e.currentTarget.style.borderColor = "#2a3f5f";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "#1E2D45";
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
        {typeof value === "string" && value.includes("%") 
          ? `${animatedValue}%` 
          : value === "N/A" ? "N/A" : animatedValue}
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
  const [isAnimating, setIsAnimating] = useState(false);

  const handleExpand = () => {
    setIsAnimating(true);
    setCollapsed(false);
    setTimeout(() => setIsAnimating(false), 400);
  };

  const handleCollapse = () => {
    setIsAnimating(true);
    setCollapsed(true);
    setTimeout(() => setIsAnimating(false), 400);
  };

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
    <div style={{ marginBottom: "16px" }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 500px; }
        }
        @keyframes slideUp {
          from { opacity: 1; max-height: 500px; }
          to { opacity: 0; max-height: 0; }
        }
        .stat-cards-container {
          animation: ${collapsed ? 'slideUp' : 'slideDown'} 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          overflow: hidden;
        }
      `}</style>

      {/* Collapsed header view */}
      {collapsed ? (
        <div
          onClick={handleExpand}
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
            animation: "fadeIn 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#2a3f5f";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.2)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#1E2D45";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
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
          <span style={{ 
            fontSize: "11px", 
            color: "#4F8EF7",
            transition: "transform 0.2s ease",
          }}>▼ Expand</span>
        </div>
      ) : (
        <div className="stat-cards-container">
          {/* Cards row */}
          <div className="stat-cards-grid" style={{ marginBottom: "8px" }}>
            <style>{`
              .stat-cards-grid {
                display: flex;
                gap: 12px;
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
            {cards.map((card, i) => (
              <StatCard key={card.label} {...card} delay={i * 80} showDetails={showDetails} />
            ))}
          </div>

          {/* Toggle controls */}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            alignItems: "center",
            animation: "fadeIn 0.3s ease 0.3s both",
          }}>
            <button
              onClick={handleCollapse}
              style={{
                background: "transparent",
                border: "none",
                padding: "4px 8px",
                fontSize: "11px",
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                color: "#4F8EF7",
                cursor: "pointer",
                transition: "all 0.15s ease",
                borderRadius: "4px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(79, 142, 247, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
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
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#2a3f5f";
                e.currentTarget.style.color = "#F0F0F5";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#1E2D45";
                e.currentTarget.style.color = "#A0A0B0";
              }}
            >
              {showDetails ? "▲ Hide details" : "▼ Show details"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
