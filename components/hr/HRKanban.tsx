"use client";

import { useEffect, useState } from "react";
import JobCard, { Job } from "./JobCard";

interface PipelineResponse {
  columns: {
    identified: Job[];
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
        color: "#555570",
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
        }}
      >
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
              color: "#555570",
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
              color: "#555570",
              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            }}
          >
            {totalJobs} total
          </span>
        )}
      </div>

      {/* Kanban columns */}
      {loading ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "#555570",
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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: "0",
            minHeight: "300px",
          }}
        >
          {COLUMNS.map((col, idx) => {
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
                    jobs.map((job) => <JobCard key={job.id} job={job} />)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
