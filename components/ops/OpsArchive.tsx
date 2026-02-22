"use client";

import { useEffect, useState } from "react";
import OpsTaskCard from "./OpsTaskCard";
import type { OpsTask } from "@/lib/ops-db";

interface ArchiveResponse {
  archived: OpsTask[];
  count: number;
}

export default function OpsArchive() {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState<ArchiveResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Fetch count on mount
  useEffect(() => {
    fetch("/api/ops/archive")
      .then((r) => r.json())
      .then((d: ArchiveResponse) => setData(d))
      .catch(() => {});
  }, []);

  const handleToggle = () => {
    if (!expanded && !data) {
      setLoading(true);
      fetch("/api/ops/archive")
        .then((r) => r.json())
        .then((d: ArchiveResponse) => {
          setData(d);
          setLoading(false);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
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
          textAlign: "left",
        }}
      >
        {/* Arrow */}
        <span
          style={{
            color: "#555570",
            fontSize: "12px",
            display: "inline-block",
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
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
            color: "#555570",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            marginLeft: "4px",
          }}
        >
          Done tasks &gt;7 days ago
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
                color: "#555570",
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
                color: "#555570",
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                fontSize: "13px",
              }}
            >
              No archived tasks yet
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "8px",
              }}
            >
              {archived.map((task) => (
                <OpsTaskCard key={task.id} task={task} dimmed />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
