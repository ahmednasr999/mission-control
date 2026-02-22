"use client";

/**
 * PipelinePreview — Phase 3: A+ Animations
 * - Staggered fade-in on mount
 * - Hover lift with company avatar glow
 * - Status badge pulse on high-priority
 * - Smooth transitions
 */

import { useState, useEffect } from "react";

interface Job {
  company: string;
  role: string;
  status: string;
  atsScore: number | null;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; glow?: string }> = {
  Applied: { bg: "rgba(79, 142, 247, 0.15)", text: "#4F8EF7", glow: "rgba(79, 142, 247, 0.3)" },
  Interview: { bg: "rgba(124, 58, 237, 0.15)", text: "#A78BFA", glow: "rgba(124, 58, 237, 0.3)" },
  Offer: { bg: "rgba(5, 150, 105, 0.15)", text: "#34D399", glow: "rgba(5, 150, 105, 0.3)" },
  Rejected: { bg: "rgba(239, 68, 68, 0.12)", text: "#F87171" },
  Screening: { bg: "rgba(217, 119, 6, 0.15)", text: "#FBBF24", glow: "rgba(217, 119, 6, 0.3)" },
};

function normalizeStatus(s: string): string {
  const lower = (s || "").toLowerCase();
  if (lower.includes("interview")) return "Interview";
  if (lower.includes("offer")) return "Offer";
  if (lower.includes("reject")) return "Rejected";
  if (lower.includes("screen")) return "Screening";
  return "Applied";
}

function AtsScoreBadge({ score }: { score: number | null }) {
  if (score == null) return null;
  const color =
    score >= 85 ? "#34D399" : score >= 70 ? "#FBBF24" : "#F87171";
  return (
    <span
      style={{
        fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
        fontSize: "10px",
        color,
        background: `${color}20`,
        border: `1px solid ${color}40`,
        borderRadius: "4px",
        padding: "2px 6px",
        whiteSpace: "nowrap",
        transition: "all 0.2s ease",
      }}
    >
      ATS {score}%
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = normalizeStatus(status);
  const colors = STATUS_COLORS[normalized] || {
    bg: "rgba(136, 136, 160, 0.15)",
    text: "#8888A0",
  };
  return (
    <span
      style={{
        fontSize: "10px",
        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
        fontWeight: 600,
        color: colors.text,
        background: colors.bg,
        borderRadius: "4px",
        padding: "2px 7px",
        whiteSpace: "nowrap",
        transition: "all 0.2s ease",
      }}
    >
      {normalized}
    </span>
  );
}

interface PipelinePreviewProps {
  jobs: Job[];
  loading?: boolean;
}

export default function PipelinePreview({ jobs, loading }: PipelinePreviewProps) {
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
        display: "flex",
        flexDirection: "column",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <style>{`
        @keyframes slideIn {
          from { 
            opacity: 0; 
            transform: translateX(-10px);
          }
          to { 
            opacity: 1; 
            transform: translateX(0);
          }
        }
        @keyframes avatarGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(79, 142, 247, 0); }
          50% { box-shadow: 0 0 0 4px rgba(79, 142, 247, 0.2); }
        }
        .job-item {
          animation: slideIn 0.3s ease forwards;
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
          Job Pipeline
        </span>
        {!loading && jobs.length > 0 && (
          <span
            style={{
              fontSize: "11px",
              color: "#A0A0B0",
              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            }}
          >
            {jobs.length} active
          </span>
        )}
      </div>

      {/* Jobs list */}
      <div style={{ flex: 1 }}>
        {loading ? (
          <EmptyState message="Loading…" />
        ) : !jobs || jobs.length === 0 ? (
          <EmptyState message="No active applications yet" />
        ) : (
          jobs.slice(0, 4).map((job, i) => {
            const isHovered = hoveredIdx === i;
            const normalizedStatus = normalizeStatus(job.status);
            const statusGlow = STATUS_COLORS[normalizedStatus]?.glow;

            return (
              <div
                key={i}
                className="job-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "10px 16px",
                  borderBottom: i < Math.min(jobs.length, 4) - 1 ? "1px solid #1E2D45" : "none",
                  background: isHovered ? "rgba(79, 142, 247, 0.05)" : "transparent",
                  transform: isHovered ? "translateX(4px)" : "translateX(0)",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  animationDelay: `${i * 60}ms`,
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Company initial avatar */}
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    background: isHovered 
                      ? "linear-gradient(135deg, #4F8EF740, #7C3AED40)" 
                      : "linear-gradient(135deg, #4F8EF720, #7C3AED20)",
                    border: isHovered ? `1px solid ${statusGlow || "#4F8EF7"}` : "1px solid #1E2D45",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "11px",
                    fontWeight: 700,
                    color: isHovered ? "#F0F0F5" : "#8888A0",
                    fontFamily: "var(--font-syne, Syne, sans-serif)",
                    flexShrink: 0,
                    transition: "all 0.2s ease",
                    transform: isHovered ? "scale(1.1)" : "scale(1)",
                    boxShadow: isHovered ? `0 0 12px ${statusGlow || "rgba(79, 142, 247, 0.3)"}` : "none",
                  }}
                >
                  {(job.company || "?")[0].toUpperCase()}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                      fontSize: "13px",
                      color: isHovered ? "#F0F0F5" : "#E0E0E5",
                      fontWeight: 500,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      transition: "color 0.15s ease",
                    }}
                    title={`${job.company} — ${job.role}`}
                  >
                    {job.company}
                  </div>
                  <div
                    style={{
                      fontSize: "11px",
                      color: isHovered ? "#A0A0B0" : "#8888A0",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      marginTop: "1px",
                      transition: "color 0.15s ease",
                    }}
                  >
                    {job.role}
                  </div>
                </div>

                <div style={{ 
                  display: "flex", 
                  gap: "6px", 
                  alignItems: "center", 
                  flexShrink: 0,
                  transform: isHovered ? "translateX(-2px)" : "translateX(0)",
                  transition: "transform 0.2s ease",
                }}>
                  <StatusBadge status={job.status} />
                  <AtsScoreBadge score={job.atsScore} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: "32px 20px",
        textAlign: "center",
        color: "#A0A0B0",
        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
        fontSize: "13px",
        animation: "fadeIn 0.4s ease",
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {message}
    </div>
  );
}
