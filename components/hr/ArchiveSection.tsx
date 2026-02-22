"use client";

import { useEffect, useState } from "react";
import JobCard, { Job } from "./JobCard";

interface ArchiveResponse {
  archived: Job[];
  count: number;
}

export default function ArchiveSection() {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState<ArchiveResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState(false);

  // Fetch count on mount, full data on expand
  useEffect(() => {
    fetch("/api/hr/archive")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setFetched(true);
      })
      .catch(() => {
        setFetched(true);
      });
  }, []);

  const handleToggle = () => {
    if (!expanded && !fetched) {
      setLoading(true);
      fetch("/api/hr/archive")
        .then((r) => r.json())
        .then((d) => {
          setData(d);
          setLoading(false);
          setFetched(true);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
          setFetched(true);
        });
    }
    setExpanded((prev) => !prev);
  };

  const count = data?.count ?? 0;
  const archived = data?.archived ?? [];

  return (
    <div
      style={{
        background: "#0D1220",
        border: "1px solid #1E2D45",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      {/* Toggle header */}
      <button
        onClick={handleToggle}
        style={{
          width: "100%",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          borderBottom: expanded ? "1px solid #1E2D45" : "none",
        }}
      >
        {/* Arrow */}
        <span
          style={{
            color: "#A0A0B0",
            fontSize: "12px",
            transition: "transform 0.2s ease",
            display: "inline-block",
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
          }}
        >
          ▶
        </span>

        {/* Label */}
        <span
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "14px",
            fontWeight: 700,
            color: "#8888A0",
            letterSpacing: "-0.01em",
          }}
        >
          {expanded ? "Hide Archive" : "View Archive"}
        </span>

        {/* Count badge */}
        {count > 0 && (
          <span
            style={{
              fontSize: "11px",
              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
              color: "#6B7280",
              background: "rgba(107,114,128,0.15)",
              border: "1px solid rgba(107,114,128,0.3)",
              borderRadius: "20px",
              padding: "1px 8px",
              fontWeight: 600,
            }}
          >
            {count}
          </span>
        )}

        {/* Subtitle */}
        <span
          style={{
            fontSize: "11px",
            color: "#A0A0B0",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            marginLeft: "4px",
          }}
        >
          Closed applications &gt;30 days ago
        </span>
      </button>

      {/* Archive body */}
      {expanded && (
        <div style={{ padding: "16px 20px" }}>
          {loading ? (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                color: "#A0A0B0",
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                fontSize: "13px",
              }}
            >
              Loading archive…
            </div>
          ) : error ? (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                color: "#F87171",
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                fontSize: "13px",
              }}
            >
              Failed to load archive
            </div>
          ) : archived.length === 0 ? (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                color: "#A0A0B0",
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                fontSize: "13px",
              }}
            >
              No archived applications yet
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: "8px",
              }}
            >
              {archived.map((job) => (
                <JobCard key={job.id} job={job} dimmed />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
