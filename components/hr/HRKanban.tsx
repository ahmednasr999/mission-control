"use client";

import { useEffect, useState } from "react";
import JobCard, { Job } from "./JobCard";
import JobDetailPanel from "./JobDetailPanel";

interface PipelineResponse {
  columns: {
    identified: Job[];
    radar: Job[];
    applied: Job[];
    interview: Job[];
    offer: Job[];
    closed: Job[];
  };
}

const COLUMNS: {
  key: keyof PipelineResponse["columns"];
  label: string;
  dotColor: string;
}[] = [
  { key: "identified", label: "Identified", dotColor: "#64748B" },
  { key: "radar",     label: "Radar",      dotColor: "#F472B6" },
  { key: "applied",    label: "Applied",    dotColor: "#3B82F6" },
  { key: "interview",  label: "Interview",  dotColor: "#F59E0B" },
  { key: "offer",      label: "Offer",      dotColor: "#34D399" },
  { key: "closed",     label: "Closed",     dotColor: "#6B7280" },
];

function EmptyColumn() {
  return (
    <div
      style={{
        padding: "24px 8px",
        textAlign: "center",
        color: "#A0A0B0",
        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
        fontSize: "12px",
      }}
    >
      No jobs here
    </div>
  );
}

export default function HRKanban() {
  const [data, setData] = useState<PipelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showRadarOnly, setShowRadarOnly] = useState(false);

  useEffect(() => {
    fetch("/api/hr/pipeline")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const totalJobs = data
    ? COLUMNS.reduce((sum, col) => sum + (data.columns[col.key]?.length ?? 0), 0)
    : 0;

  return (
    <>
      <div
        style={{
          background: "#0D1220",
          border: "1px solid #1E2D45",
          borderRadius: "10px",
          overflow: "hidden",
          marginBottom: "20px",
        }}
      >
        {/* Section header */}
        <div
          style={{
            padding: "16px 20px 14px",
            borderBottom: "1px solid #1E2D45",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            <div>
              <span
                style={{
                  fontFamily: "var(--font-syne, Syne, sans-serif)",
                  fontSize: "15px",
                  fontWeight: 700,
                  color: "#F0F0F5",
                  letterSpacing: "-0.02em",
                }}
              >
                Job Pipeline
              </span>
              <span
                style={{
                  marginLeft: "10px",
                  fontSize: "11px",
                  color: "#A0A0B0",
                  fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                }}
              >
                Kanban
              </span>
            </div>
            {!loading && (
              <span
                style={{
                  fontSize: "11px",
                  color: "#6B7280",
                  fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                }}
              >
                {totalJobs} total • {data?.columns.radar.length ?? 0} in Radar
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            {!loading && (
              <button
                onClick={() => setShowRadarOnly((v) => !v)}
                style={{
                  fontSize: "11px",
                  fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                  padding: "6px 10px",
                  borderRadius: "999px",
                  border: showRadarOnly ? "1px solid #F472B6" : "1px solid #1E2D45",
                  background: showRadarOnly ? "rgba(244, 114, 182, 0.16)" : "transparent",
                  color: showRadarOnly ? "#F9A8D4" : "#A0A0B0",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  whiteSpace: "nowrap",
                }}
              >
                {showRadarOnly ? "Showing Radar only" : "Focus: Job Radar"}
              </button>
            )}
          </div>
        </div>

        {/* Kanban columns */}
        {loading ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "#A0A0B0",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              fontSize: "13px",
            }}
          >
            Loading pipeline…
          </div>
        ) : error ? (
          <div
            style={{
              padding: "40px",
              textAlign: "center",
              color: "#F87171",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              fontSize: "13px",
            }}
          >
            Failed to load pipeline
          </div>
        ) : (
          <div className="hr-kanban-grid" style={{ minHeight: "300px" }}>
            <style>{`
              .hr-kanban-grid {
                display: grid;
                grid-template-columns: repeat(6, 1fr);
                gap: 0;
              }
              @media (max-width: 1200px) {
                .hr-kanban-grid {
                  grid-template-columns: repeat(3, 1fr);
                }
              }
              @media (max-width: 768px) {
                .hr-kanban-grid {
                  grid-template-columns: 1fr;
                }
                .hr-kanban-grid > div {
                  border-right: none !important;
                  border-bottom: 1px solid #1E2D45;
                }
              }
            `}</style>
            {COLUMNS.map((col, idx) => {
              if (showRadarOnly && col.key !== "radar") {
                return null;
              }
              const jobs = data?.columns[col.key] ?? [];
              return (
                <div
                  key={col.key}
                  style={{
                    borderRight:
                      idx < COLUMNS.length - 1 ? "1px solid #1E2D45" : "none",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {/* Column header */}
                  <div
                    style={{
                      padding: "12px 14px 10px",
                      borderBottom: "1px solid #1E2D45",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      background: "#080C16",
                    }}
                  >
                    {/* Dot */}
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: col.dotColor,
                        flexShrink: 0,
                      }}
                    />
                    {/* Column name */}
                    <span
                      style={{
                        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                        fontSize: "12px",
                        fontWeight: 600,
                        color: "#F0F0F5",
                        flex: 1,
                      }}
                    >
                      {col.label}
                    </span>
                    {/* Count badge */}
                    <span
                      style={{
                        fontSize: "11px",
                        fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                        color: col.dotColor,
                        background: `${col.dotColor}18`,
                        border: `1px solid ${col.dotColor}35`,
                        borderRadius: "20px",
                        padding: "1px 7px",
                        fontWeight: 600,
                      }}
                    >
                      {jobs.length}
                    </span>
                  </div>

                  {/* Column body — scrollable */}
                  <div
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: "12px 10px",
                      maxHeight: "480px",
                    }}
                  >
                    {jobs.length === 0 ? (
                      <EmptyColumn />
                    ) : (
                      jobs.map((job) => (
                        <JobCard 
                          key={job.id} 
                          job={job} 
                          onClick={setSelectedJob}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Job Detail Panel */}
      <JobDetailPanel 
        job={selectedJob} 
        onClose={() => setSelectedJob(null)} 
      />
    </>
  );
}
