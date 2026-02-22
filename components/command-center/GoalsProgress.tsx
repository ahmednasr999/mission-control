"use client";

/**
 * GoalsProgress — Phase 3: A+ Animations
 * - Animated progress bars on mount
 * - Counter animation on percentages
 * - Staggered goal entrance
 * - Hover highlight on goals
 * - Progress bar shimmer effect on complete
 */

import { useState, useEffect, useRef } from "react";

interface Goal {
  category: string;
  objective: string;
  progress: number;
  status: string;
}

// Animated progress hook - browser only
function useAnimatedProgress(target: number, duration = 1000, delay = 0) {
  const [progress, setProgress] = useState(target);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const startTimer = setTimeout(() => {
      startTimeRef.current = null;
      
      const animate = (currentTime: number) => {
        if (startTimeRef.current === null) {
          startTimeRef.current = currentTime;
        }
        const elapsed = currentTime - startTimeRef.current;
        const p = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - p, 3);
        setProgress(Math.floor(target * easeOut));

        if (p < 1) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };

      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(startTimer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay]);

  return progress;
}

function ProgressBar({ progress, status, delay = 0 }: { progress: number; status: string; delay?: number }) {
  const animatedProgress = useAnimatedProgress(progress, 1200, delay);
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
            width: `${animatedProgress}%`,
            background: barColor,
            borderRadius: "3px",
            transition: "width 0.1s linear",
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
  const [mounted, setMounted] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      style={{
        background: "#0D1220",
        border: "1px solid #1E2D45",
        borderRadius: "10px",
        overflow: "hidden",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <style>{`
        @keyframes slideInUp {
          from { 
            opacity: 0; 
            transform: translateY(10px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .goal-item {
          animation: slideInUp 0.4s ease forwards;
          opacity: 0;
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          padding: "12px 16px 10px",
          borderBottom: "1px solid #1E2D45",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "13px",
            fontWeight: 700,
            color: "#F0F0F5",
          }}
        >
          Q1 Goals
        </span>
        {!loading && goals.length > 0 && (
          <span
            style={{
              fontSize: "11px",
              color: "#A0A0B0",
              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            }}
          >
            {goals.filter(g => g.status === "complete").length}/{goals.length} done
          </span>
        )}
      </div>

      {/* Goals list */}
      <div style={{ padding: "12px 16px" }}>
        {loading ? (
          <div
            style={{
              textAlign: "center",
              color: "#A0A0B0",
              fontSize: "13px",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              padding: "16px 0",
            }}
          >
            Loading…
          </div>
        ) : !goals || goals.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#A0A0B0",
              fontSize: "13px",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              padding: "16px 0",
              animation: "fadeIn 0.4s ease",
            }}
          >
            No goals data yet
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {goals.map((goal, i) => {
              const isHovered = hoveredIdx === i;
              const progressColor = goal.progress >= 80
                ? "#34D399"
                : goal.progress >= 40
                ? "#4F8EF7"
                : "#8888A0";

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
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      marginBottom: "5px",
                      gap: "8px",
                    }}
                  >
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
                  <ProgressBar progress={goal.progress} status={goal.status} delay={i * 80 + 200} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
