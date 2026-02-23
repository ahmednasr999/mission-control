"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Goal {
  category: string;
  objective: string;
  progress: number;
  status: string;
}

function ProgressBar({ progress, status }: { progress: number; status: string }) {
  const isComplete = status === "complete";

  const barColor =
    isComplete
      ? "linear-gradient(90deg, #059669, #34D399)"
      : progress >= 60
      ? "linear-gradient(90deg, #4F8EF7, #7C3AED)"
      : progress >= 30
      ? "linear-gradient(90deg, #D97706, #FBBF24)"
      : "linear-gradient(90deg, #A0A0B0, #8888A0)";

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          height: "5px",
          borderRadius: "3px",
          background: "#1E2D45",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress}%`,
            background: barColor,
            borderRadius: "3px",
            transition: "width 0.5s ease",
            position: "relative",
          }}
        >
          {isComplete && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                animation: "shimmer 2s infinite",
              }}
            />
          )}
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

interface GoalsProgressProps {
  goals: Goal[];
  loading?: boolean;
}

export default function GoalsProgress({ goals, loading }: GoalsProgressProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const completedCount = goals?.filter(g => g.status === "complete").length || 0;
  const totalCount = goals?.length || 0;

  return (
    <Card className="bg-[#0D1220] border-[#1E2D45] rounded-[10px] overflow-hidden">
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .goal-item {
          animation: slideInUp 0.4s ease forwards;
        }
      `}</style>

      <CardHeader className="pb-2" style={{ padding: "12px 16px 10px", borderBottom: "1px solid #1E2D45" }}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-[#F0F0F5]" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
            Q1 Goals
          </CardTitle>
          {!loading && totalCount > 0 && (
            <span style={{ fontSize: "11px", color: "#A0A0B0", fontFamily: "var(--font-dm-mono, DM Mono, monospace)" }}>
              {completedCount}/{totalCount} done
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent style={{ padding: "12px 16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#A0A0B0", fontSize: "13px", fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)", padding: "16px 0" }}>
            Loading…
          </div>
        ) : !goals || goals.length === 0 ? (
          <div style={{ textAlign: "center", color: "#A0A0B0", fontSize: "13px", fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)", padding: "16px 0" }}>
            No goals data yet
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {goals.map((goal, i) => {
              const isHovered = hoveredIdx === i;
              const progressColor = goal.progress >= 80 ? "#34D399" : goal.progress >= 40 ? "#4F8EF7" : "#8888A0";

              return (
                <div
                  key={i}
                  className="goal-item"
                  style={{
                    padding: isHovered ? "8px 10px" : "0",
                    margin: isHovered ? "-4px -6px" : "0",
                    background: isHovered ? "rgba(79, 142, 247, 0.05)" : "transparent",
                    borderRadius: "6px",
                    border: isHovered ? "1px solid rgba(79, 142, 247, 0.2)" : "1px solid transparent",
                    transition: "all 0.2s ease",
                    cursor: "pointer",
                    animationDelay: `${i * 80}ms`,
                  }}
                  onMouseEnter={() => setHoveredIdx(i)}
                  onMouseLeave={() => setHoveredIdx(null)}
                >
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "5px", gap: "8px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span
                        style={{
                          fontSize: "10px",
                          fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                          color: isHovered ? "#8888A0" : "#A0A0B0",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          display: "block",
                          marginBottom: "2px",
                          transition: "color 0.15s ease",
                        }}
                      >
                        {goal.category}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                          fontSize: "12px",
                          color: isHovered ? "#F0F0F5" : "#8888A0",
                          display: "block",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          transition: "color 0.15s ease",
                        }}
                        title={goal.objective}
                      >
                        {goal.objective}
                      </span>
                    </div>
                    <span
                      style={{
                        fontFamily: "var(--font-syne, Syne, sans-serif)",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: progressColor,
                        whiteSpace: "nowrap",
                        transform: isHovered ? "scale(1.1)" : "scale(1)",
                        transition: "transform 0.2s ease",
                      }}
                    >
                      {goal.progress}%
                    </span>
                  </div>
                  <ProgressBar progress={goal.progress} status={goal.status} />
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
