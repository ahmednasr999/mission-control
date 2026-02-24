"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

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
  onClick?: () => void;
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

function StatCard({ value, label, color, glow, trend, showDetails, details, onClick }: StatCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      className={`bg-slate-900/60 border-slate-700/50 hover:border-slate-600 transition-all`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={{
        borderColor: isHovered ? `${color}60` : undefined,
        cursor: onClick ? "pointer" : undefined,
      }}
    >
      <CardContent className="p-4">
        <style>{`
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.2); }
          }
          .stat-card-value {
            animation: slideDown 0.3s ease forwards;
          }
        `}</style>
        
        {/* Label */}
        <div style={{
          fontSize: "11px",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          color: "#A0A0B0",
          marginBottom: "8px",
        }}>
          {label}
        </div>

        {/* Value */}
        <div className="stat-card-value" style={{
          fontSize: "32px",
          fontWeight: 700,
          color: color,
          fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
          marginBottom: "6px",
          textShadow: `0 0 20px ${glow}`,
        }}>
          {value}
        </div>

        {/* Trend indicator */}
        {showDetails && (
          <div style={{
            fontSize: "10px",
            color: "#A0A0B0",
            display: "flex",
            alignItems: "center",
            gap: "4px",
          }}>
            <TrendBadge trend={trend} />
            {details && <span>{details}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StatCardsProps {
  stats: Stats | null;
  loading?: boolean;
  onStatClick?: (stat: string) => void;
}

export default function StatCards({ stats, loading, onStatClick }: StatCardsProps) {
  if (!stats) {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        {[1,2,3,4].map(i => (
          <Card key={i} className="bg-slate-900/60 border-slate-700/50 animate-pulse">
            <CardContent className="p-4">
              <div className="h-3 w-20 bg-slate-700 rounded mb-2"></div>
              <div className="h-8 w-16 bg-slate-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  const statItems: Array<{ value: string | number; label: string; color: string; glow: string; trend: TrendDirection; details?: string; statKey?: string }> = [
    {
      value: stats.activeJobs,
      label: "Active Job Leads",
      color: "#4F8EF7",
      glow: "rgba(79, 142, 247, 0.5)",
      trend: stats.prevActiveJobs !== null && stats.prevActiveJobs !== undefined
        ? stats.activeJobs > stats.prevActiveJobs
          ? "up"
          : stats.activeJobs < stats.prevActiveJobs
          ? "down"
          : "flat"
        : "na",
      details: stats.prevActiveJobs !== null && stats.prevActiveJobs !== undefined
        ? `${Math.abs(stats.activeJobs - stats.prevActiveJobs)} vs last check`
        : undefined,
      statKey: "activeJobs",
    },
    {
      value: stats.avgAts !== null ? `${stats.avgAts}%` : "—",
      label: "Avg ATS Score",
      color: "#34D399",
      glow: "rgba(52, 211, 153, 0.5)",
      trend: stats.prevAvgAts !== null && stats.prevAvgAts !== undefined
        ? stats.avgAts && stats.avgAts > stats.prevAvgAts
          ? "up"
          : stats.avgAts && stats.avgAts < stats.prevAvgAts
          ? "down"
          : "flat"
        : "na",
      details: stats.prevAvgAts !== null && stats.prevAvgAts !== undefined && stats.avgAts
        ? `${Math.abs(stats.avgAts - stats.prevAvgAts).toFixed(1)}pp vs last check`
        : undefined,
      statKey: "avgAts",
    },
    {
      value: stats.contentDue,
      label: "Content Due This Week",
      color: "#F59E0B",
      glow: "rgba(245, 158, 11, 0.5)",
      trend: stats.prevContentDue !== null && stats.prevContentDue !== undefined
        ? stats.contentDue > stats.prevContentDue
          ? "up"
          : stats.contentDue < stats.prevContentDue
          ? "down"
          : "flat"
        : "na",
      details: stats.prevContentDue !== null && stats.prevContentDue !== undefined
        ? `${Math.abs(stats.contentDue - stats.prevContentDue)} vs last check`
        : undefined,
      statKey: "contentDue",
    },
    {
      value: stats.openTasks,
      label: "Open Tasks",
      color: "#EC4899",
      glow: "rgba(236, 72, 153, 0.5)",
      trend: stats.prevOpenTasks !== null && stats.prevOpenTasks !== undefined
        ? stats.openTasks > stats.prevOpenTasks
          ? "up"
          : stats.openTasks < stats.prevOpenTasks
          ? "down"
          : "flat"
        : "na",
      details: stats.prevOpenTasks !== null && stats.prevOpenTasks !== undefined
        ? `${Math.abs(stats.openTasks - stats.prevOpenTasks)} vs last check`
        : undefined,
      statKey: "openTasks",
    },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "16px",
      marginBottom: "24px",
    }}>
      {statItems.map((item, idx) => (
        <StatCard
          key={idx}
          value={item.value}
          label={item.label}
          color={item.color}
          glow={item.glow}
          trend={item.trend}
          showDetails={true}
          details={item.details}
          delay={idx * 0.1}
          onClick={item.statKey && onStatClick ? () => onStatClick(item.statKey!) : undefined}
        />
      ))}
    </div>
  );
}
