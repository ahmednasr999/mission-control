"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Mistake {
  date: string;
  text: string;
  fix?: string;
}

interface Win {
  text: string;
  date?: string;
}

interface LessonsData {
  mistakes: Mistake[];
  wins: Win[];
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
        color: "#A0A0B0",
        flexShrink: 0,
      }}
    >
      {date}
    </span>
  );
}

function MistakeItem({ item }: { item: Mistake }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div
      onClick={() => item.fix && setExpanded(e => !e)}
      style={{
        background: "rgba(248, 113, 113, 0.04)",
        border: "1px solid rgba(248, 113, 113, 0.2)",
        borderRadius: "8px",
        padding: "10px 12px",
        cursor: item.fix ? "pointer" : "default",
        transition: "all 0.1s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
        <span style={{ color: "#F87171", fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>✕</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
            <DateBadge date={item.date} />
          </div>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              fontSize: "12px",
              color: "#F0F0F5",
              lineHeight: 1.5,
            }}
          >
            {item.text}
          </p>
          {expanded && item.fix && (
            <div
              style={{
                marginTop: "8px",
                paddingTop: "8px",
                borderTop: "1px solid rgba(248, 113, 113, 0.15)",
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                fontSize: "11px",
                color: "#8888A0",
                display: "flex",
                gap: "6px",
              }}
            >
              <span style={{ color: "#34D399", flexShrink: 0 }}>→</span>
              <span>Fix: {item.fix}</span>
            </div>
          )}
          {item.fix && !expanded && (
            <span
              style={{
                fontSize: "10px",
                color: "#A0A0B0",
                fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                marginTop: "4px",
                display: "block",
              }}
            >
              click to see fix
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function WinItem({ item }: { item: Win }) {
  return (
    <div
      style={{
        background: "rgba(52, 211, 153, 0.04)",
        border: "1px solid rgba(52, 211, 153, 0.2)",
        borderRadius: "8px",
        padding: "10px 12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
        <span style={{ color: "#34D399", fontSize: "14px", flexShrink: 0, marginTop: "1px" }}>✓</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          {item.date && (
            <div style={{ marginBottom: "4px" }}>
              <DateBadge date={item.date} />
            </div>
          )}
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              fontSize: "12px",
              color: "#F0F0F5",
              lineHeight: 1.5,
            }}
          >
            {item.text}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LessonsLearned() {
  const [data, setData] = useState<LessonsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"mistakes" | "wins">("mistakes");

  useEffect(() => {
    fetch("/api/intelligence/lessons")
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setData({ mistakes: [], wins: [] }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card style={{ background: "#0D1220", borderColor: "#1E2D45", overflow: "hidden", height: "100%" }}>
      {/* Header */}
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
        <span
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "13px",
            fontWeight: 700,
            color: "#F0F0F5",
          }}
        >
          📚 Lessons Learned
        </span>

        {/* Tab toggles */}
        <div style={{ display: "flex", gap: "4px" }}>
          <Button
            variant={tab === "mistakes" ? "default" : "ghost"}
            onClick={() => setTab("mistakes")}
            style={{
              background: tab === "mistakes" ? "rgba(248, 113, 113, 0.15)" : "transparent",
              border: tab === "mistakes" ? "1px solid rgba(248, 113, 113, 0.4)" : "1px solid #1E2D45",
              borderRadius: "6px",
              padding: "4px 10px",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              fontSize: "11px",
              fontWeight: tab === "mistakes" ? 700 : 500,
              color: tab === "mistakes" ? "#F87171" : "#A0A0B0",
            }}
          >
            What Went Wrong {data ? `(${data.mistakes.length})` : ""}
          </Button>
          <Button
            variant={tab === "wins" ? "default" : "ghost"}
            onClick={() => setTab("wins")}
            style={{
              background: tab === "wins" ? "rgba(52, 211, 153, 0.15)" : "transparent",
              border: tab === "wins" ? "1px solid rgba(52, 211, 153, 0.4)" : "1px solid #1E2D45",
              borderRadius: "6px",
              padding: "4px 10px",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              fontSize: "11px",
              fontWeight: tab === "wins" ? 700 : 500,
              color: tab === "wins" ? "#34D399" : "#A0A0B0",
            }}
          >
            What&apos;s Working {data ? `(${data.wins.length})` : ""}
          </Button>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "14px 16px", maxHeight: "480px", overflowY: "auto" }}>
        {loading ? (
          <div
            style={{
              textAlign: "center",
              color: "#A0A0B0",
              fontSize: "13px",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              padding: "24px 0",
            }}
          >
            Loading lessons…
          </div>
        ) : !data ? null : tab === "mistakes" ? (
          data.mistakes.length === 0 ? (
            <div style={{ textAlign: "center", color: "#A0A0B0", fontSize: "13px", padding: "20px 0" }}>
              No lessons recorded yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {data.mistakes.map((m, i) => (
                <MistakeItem key={i} item={m} />
              ))}
            </div>
          )
        ) : (
          data.wins.length === 0 ? (
            <div style={{ textAlign: "center", color: "#A0A0B0", fontSize: "13px", padding: "20px 0" }}>
              No wins recorded yet
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {data.wins.map((w, i) => (
                <WinItem key={i} item={w} />
              ))}
            </div>
          )
        )}
      </div>
    </Card>
  );
}
