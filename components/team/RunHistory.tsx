"use client";

import { useEffect, useState } from "react";

interface RunRecord {
  id: string;
  task: string;
  agent: string;
  model: string;
  startTime: string;
  endTime: string | null;
  duration: string | null;
  outputFile: string | null;
  status: "completed" | "running" | "failed";
}

const STATUS_STYLES: Record<string, { color: string; bg: string; label: string }> = {
  completed: { color: "#34D399", bg: "rgba(52,211,153,0.12)", label: "Completed" },
  running: { color: "#FBBF24", bg: "rgba(251,191,36,0.12)", label: "Running" },
  failed: { color: "#F87171", bg: "rgba(248,113,113,0.12)", label: "Failed" },
};

function formatTime(iso: string | null): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", {
      timeZone: "Africa/Cairo",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLES[status] || STATUS_STYLES.completed;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "10px",
        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
        fontWeight: 600,
        color: style.color,
        background: style.bg,
        border: `1px solid ${style.color}35`,
        borderRadius: "20px",
        padding: "2px 8px",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "5px",
          height: "5px",
          borderRadius: "50%",
          background: style.color,
          flexShrink: 0,
        }}
      />
      {style.label}
    </span>
  );
}

function ModelBadge({ model }: { model: string }) {
  const short = model.split("/").pop() || model;
  return (
    <span
      style={{
        fontSize: "10px",
        fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
        color: "#8888A0",
        background: "rgba(136,136,160,0.08)",
        border: "1px solid rgba(136,136,160,0.2)",
        borderRadius: "4px",
        padding: "2px 6px",
        whiteSpace: "nowrap",
        maxWidth: "140px",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "inline-block",
      }}
    >
      {short}
    </span>
  );
}

const LIMIT = 20;

export default function RunHistory() {
  const [runs, setRuns] = useState<RunRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  async function fetchRuns(newOffset: number, append = false) {
    try {
      const res = await fetch(`/api/team/runs?offset=${newOffset}&limit=${LIMIT}`);
      const data = await res.json();
      const fetched: RunRecord[] = data.runs || [];
      setHasMore(data.hasMore || false);
      setTotal(data.total || 0);
      if (append) {
        setRuns(prev => [...prev, ...fetched]);
      } else {
        setRuns(fetched);
      }
      setOffset(newOffset + LIMIT);
    } catch {
      if (!append) setRuns([]);
    }
  }

  useEffect(() => {
    setLoading(true);
    fetchRuns(0, false).finally(() => setLoading(false));
  }, []);

  async function loadMore() {
    setLoadingMore(true);
    await fetchRuns(offset, true);
    setLoadingMore(false);
  }

  const COL_STYLES = {
    task: { flex: "3 1 0", minWidth: 0 },
    agent: { flex: "1 0 80px" },
    model: { flex: "1.5 0 100px" },
    duration: { flex: "0.8 0 70px" },
    started: { flex: "1.5 0 120px" },
    status: { flex: "1 0 90px" },
  };

  const HEADER_STYLE: React.CSSProperties = {
    fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
    fontSize: "10px",
    fontWeight: 600,
    color: "#A0A0B0",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    padding: "8px 12px",
  };

  return (
    <div
      style={{
        background: "#0D1220",
        border: "1px solid #1E2D45",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 20px",
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
              fontSize: "14px",
              fontWeight: 700,
              color: "#F0F0F5",
            }}
          >
            Sub-Agent Run History
          </span>
        </div>
        {total > 0 && (
          <span
            style={{
              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
              fontSize: "11px",
              color: "#A0A0B0",
            }}
          >
            {total} runs
          </span>
        )}
      </div>

      {/* Table header */}
      <div
        style={{
          display: "flex",
          borderBottom: "1px solid #1E2D45",
          background: "rgba(255,255,255,0.01)",
        }}
      >
        <div style={{ ...HEADER_STYLE, ...COL_STYLES.task }}>Task</div>
        <div style={{ ...HEADER_STYLE, ...COL_STYLES.agent }}>Agent</div>
        <div style={{ ...HEADER_STYLE, ...COL_STYLES.model }}>Model</div>
        <div style={{ ...HEADER_STYLE, ...COL_STYLES.duration }}>Duration</div>
        <div style={{ ...HEADER_STYLE, ...COL_STYLES.started }}>Started</div>
        <div style={{ ...HEADER_STYLE, ...COL_STYLES.status }}>Status</div>
      </div>

      {/* Rows */}
      {loading ? (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "#A0A0B0",
            fontSize: "13px",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          }}
        >
          Loading run history…
        </div>
      ) : runs.length === 0 ? (
        <div
          style={{
            padding: "40px 20px",
            textAlign: "center",
            color: "#A0A0B0",
            fontSize: "13px",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          }}
        >
          No sub-agent runs recorded
        </div>
      ) : (
        <>
          {runs.map((run, i) => (
            <div
              key={run.id}
              style={{
                display: "flex",
                alignItems: "center",
                borderBottom: i < runs.length - 1 ? "1px solid rgba(30,45,69,0.6)" : "none",
                padding: "10px 0",
                transition: "background 0.1s ease",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.015)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.background = "transparent";
              }}
            >
              {/* Task */}
              <div
                style={{
                  ...COL_STYLES.task,
                  padding: "0 12px",
                  fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                  fontSize: "12px",
                  color: "#F0F0F5",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                title={run.task}
              >
                {run.task || "—"}
              </div>

              {/* Agent */}
              <div
                style={{
                  ...COL_STYLES.agent,
                  padding: "0 12px",
                  fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                  fontSize: "12px",
                  color: "#8888A0",
                }}
              >
                sub-agent
              </div>

              {/* Model */}
              <div style={{ ...COL_STYLES.model, padding: "0 12px" }}>
                <ModelBadge model={run.model} />
              </div>

              {/* Duration */}
              <div
                style={{
                  ...COL_STYLES.duration,
                  padding: "0 12px",
                  fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                  fontSize: "11px",
                  color: "#8888A0",
                }}
              >
                {run.duration || "—"}
              </div>

              {/* Started */}
              <div
                style={{
                  ...COL_STYLES.started,
                  padding: "0 12px",
                  fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                  fontSize: "11px",
                  color: "#A0A0B0",
                }}
              >
                {formatTime(run.startTime)}
              </div>

              {/* Status */}
              <div style={{ ...COL_STYLES.status, padding: "0 12px" }}>
                <StatusBadge status={run.status} />
              </div>
            </div>
          ))}

          {/* Load More */}
          {hasMore && (
            <div
              style={{
                padding: "14px 20px",
                borderTop: "1px solid #1E2D45",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <button
                onClick={loadMore}
                disabled={loadingMore}
                style={{
                  background: "rgba(79,142,247,0.08)",
                  border: "1px solid #4F8EF730",
                  borderRadius: "6px",
                  padding: "7px 20px",
                  fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                  fontSize: "12px",
                  color: "#4F8EF7",
                  cursor: loadingMore ? "default" : "pointer",
                  opacity: loadingMore ? 0.6 : 1,
                  transition: "all 0.15s ease",
                }}
              >
                {loadingMore ? "Loading…" : "Load More"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
