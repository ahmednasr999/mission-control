"use client";

import { useState, useEffect } from "react";

interface Win {
  text: string;
  date?: string;
}

interface Mistake {
  date: string;
  text: string;
  fix?: string;
}

interface InsightsData {
  wins: Win[];
  mistakes: Mistake[];
}

function DateBadge({ date }: { date?: string }) {
  if (!date) return null;
  return (
    <span
      style={{
        display: "inline-block",
        background: "rgba(255,255,255,0.05)",
        border: "1px solid #1E2D45",
        borderRadius: "4px",
        padding: "1px 6px",
        fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
        fontSize: "10px",
        color: "#555570",
        flexShrink: 0,
        whiteSpace: "nowrap",
      }}
    >
      {date}
    </span>
  );
}

function WinItem({ item }: { item: Win }) {
  return (
    <div
      style={{
        background: "rgba(52, 211, 153, 0.04)",
        border: "1px solid rgba(52, 211, 153, 0.18)",
        borderRadius: "8px",
        padding: "9px 12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
        <span style={{ color: "#34D399", fontSize: "13px", flexShrink: 0, marginTop: "1px" }}>✓</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {item.date && (
            <div style={{ marginBottom: "3px" }}>
              <DateBadge date={item.date} />
            </div>
          )}
          <p style={{
            margin: 0,
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            fontSize: "12px",
            color: "#F0F0F5",
            lineHeight: 1.5,
          }}>
            {item.text}
          </p>
        </div>
      </div>
    </div>
  );
}

function MistakeItem({ item }: { item: Mistake }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => item.fix && setExpanded(e => !e)}
      style={{
        background: "rgba(248, 113, 113, 0.04)",
        border: "1px solid rgba(248, 113, 113, 0.18)",
        borderRadius: "8px",
        padding: "9px 12px",
        cursor: item.fix ? "pointer" : "default",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
        <span style={{ color: "#F87171", fontSize: "13px", flexShrink: 0, marginTop: "1px" }}>✕</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {item.date && (
            <div style={{ marginBottom: "3px" }}>
              <DateBadge date={item.date} />
            </div>
          )}
          <p style={{
            margin: 0,
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            fontSize: "12px",
            color: "#F0F0F5",
            lineHeight: 1.5,
          }}>
            {item.text}
          </p>
          {expanded && item.fix && (
            <div style={{
              marginTop: "7px",
              paddingTop: "7px",
              borderTop: "1px solid rgba(248, 113, 113, 0.15)",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              fontSize: "11px",
              color: "#8888A0",
              display: "flex",
              gap: "6px",
            }}>
              <span style={{ color: "#34D399", flexShrink: 0 }}>→</span>
              <span>Fix: {item.fix}</span>
            </div>
          )}
          {item.fix && !expanded && (
            <span style={{
              fontSize: "10px",
              color: "#555570",
              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
              marginTop: "3px",
              display: "block",
            }}>
              tap to see fix
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function InsightsPanel() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"wins" | "mistakes">("wins");

  useEffect(() => {
    fetch("/api/lab/insights")
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setData({ wins: [], mistakes: [] }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      style={{
        background: "#0D1220",
        border: "1px solid #1E2D45",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      {/* Header with tab toggles */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #1E2D45",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "8px",
        }}
      >
        <span style={{
          fontFamily: "var(--font-syne, Syne, sans-serif)",
          fontSize: "13px",
          fontWeight: 700,
          color: "#F0F0F5",
        }}>
          ⚡ System Health
        </span>

        <div style={{ display: "flex", gap: "4px" }}>
          <button
            onClick={() => setTab("wins")}
            style={{
              background: tab === "wins" ? "rgba(52, 211, 153, 0.15)" : "transparent",
              border: tab === "wins" ? "1px solid rgba(52, 211, 153, 0.4)" : "1px solid #1E2D45",
              borderRadius: "6px",
              padding: "3px 10px",
              cursor: "pointer",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              fontSize: "11px",
              fontWeight: tab === "wins" ? 700 : 500,
              color: tab === "wins" ? "#34D399" : "#555570",
              transition: "all 0.12s ease",
            }}
          >
            ✓ Working {data ? `(${data.wins.length})` : ""}
          </button>
          <button
            onClick={() => setTab("mistakes")}
            style={{
              background: tab === "mistakes" ? "rgba(248, 113, 113, 0.15)" : "transparent",
              border: tab === "mistakes" ? "1px solid rgba(248, 113, 113, 0.4)" : "1px solid #1E2D45",
              borderRadius: "6px",
              padding: "3px 10px",
              cursor: "pointer",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              fontSize: "11px",
              fontWeight: tab === "mistakes" ? 700 : 500,
              color: tab === "mistakes" ? "#F87171" : "#555570",
              transition: "all 0.12s ease",
            }}
          >
            ✕ Went Wrong {data ? `(${data.mistakes.length})` : ""}
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "12px 16px", maxHeight: "320px", overflowY: "auto" }}>
        {loading ? (
          <div style={{
            textAlign: "center",
            color: "#555570",
            fontSize: "13px",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            padding: "20px 0",
          }}>
            Loading insights…
          </div>
        ) : !data ? null : tab === "wins" ? (
          data.wins.length === 0 ? (
            <div style={{ textAlign: "center", color: "#555570", fontSize: "13px", padding: "20px 0" }}>
              No milestones found
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {data.wins.map((w, i) => <WinItem key={i} item={w} />)}
            </div>
          )
        ) : (
          data.mistakes.length === 0 ? (
            <div style={{ textAlign: "center", color: "#555570", fontSize: "13px", padding: "20px 0" }}>
              No lessons found
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "7px" }}>
              {data.mistakes.map((m, i) => <MistakeItem key={i} item={m} />)}
            </div>
          )
        )}
      </div>
    </div>
  );
}
