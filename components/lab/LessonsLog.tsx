"use client";

import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LessonEntry {
  date: string;
  missed: string[];
  why: string[];
  fix: string[];
  source: "file" | "memory";
}

interface LessonsData {
  entries: LessonEntry[];
}

function EntryCard({ entry }: { entry: LessonEntry }) {
  const [expanded, setExpanded] = useState(false);
  const summary = entry.missed[0] || "(no summary)";
  const hasDetail = entry.why.length > 0 || entry.fix.length > 0 || entry.missed.length > 1;

  return (
    <Card
      className="bg-slate-950 border-slate-800 border-l-4 border-l-red-400"
      style={{
        borderLeftWidth: "3px",
        borderLeftColor: "#F87171",
      }}
    >
      {/* Card header — always visible */}
      <div
        onClick={() => hasDetail && setExpanded(e => !e)}
        style={{
          padding: "10px 12px",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          cursor: hasDetail ? "pointer" : "default",
        }}
      >
        {/* Date badge */}
        <span
          style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid #1E2D45",
            borderRadius: "4px",
            padding: "2px 6px",
            fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            fontSize: "9px",
            color: "#A0A0B0",
            flexShrink: 0,
            marginTop: "2px",
            whiteSpace: "nowrap",
          }}
        >
          {entry.date}
        </span>

        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            margin: 0,
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            fontSize: "12px",
            color: "#F0F0F5",
            lineHeight: 1.5,
          }}>
            {summary}
          </p>
          {entry.source === "memory" && (
            <span style={{
              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
              fontSize: "9px",
              color: "#4F8EF7",
              letterSpacing: "0.06em",
            }}>
              MEMORY.md
            </span>
          )}
        </div>

        {hasDetail && (
          <span style={{
            color: "#A0A0B0",
            fontSize: "11px",
            flexShrink: 0,
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.15s ease",
            display: "inline-block",
            marginTop: "2px",
          }}>
            ▾
          </span>
        )}
      </div>

      {/* Expanded sections */}
      {expanded && (
        <div style={{ padding: "0 12px 12px 12px", borderTop: "1px solid #1E2D45" }}>

          {/* Additional missed items */}
          {entry.missed.length > 1 && (
            <div style={{ marginTop: "10px" }}>
              <div style={{
                fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                fontSize: "9px",
                fontWeight: 600,
                color: "#F87171",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}>
                What I Missed
              </div>
              {entry.missed.map((m, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "7px",
                  marginBottom: "4px",
                }}>
                  <span style={{ color: "#F87171", fontSize: "10px", flexShrink: 0, marginTop: "2px" }}>✕</span>
                  <span style={{
                    fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                    fontSize: "11px",
                    color: "#8888A0",
                    lineHeight: 1.5,
                  }}>
                    {m}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Why section */}
          {entry.why.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              <div style={{
                fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                fontSize: "9px",
                fontWeight: 600,
                color: "#FBBF24",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}>
                Root Cause
              </div>
              {entry.why.map((w, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "7px",
                  marginBottom: "4px",
                  paddingLeft: "2px",
                  borderLeft: "2px solid rgba(251,191,36,0.3)",
                }}>
                  <span style={{
                    fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                    fontSize: "11px",
                    color: "#8888A0",
                    lineHeight: 1.5,
                    paddingLeft: "6px",
                  }}>
                    {w}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Fix section */}
          {entry.fix.length > 0 && (
            <div style={{ marginTop: "10px" }}>
              <div style={{
                fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                fontSize: "9px",
                fontWeight: 600,
                color: "#34D399",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}>
                Fix
              </div>
              {entry.fix.map((f, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "7px",
                  marginBottom: "4px",
                }}>
                  <span style={{ color: "#34D399", fontSize: "10px", flexShrink: 0, marginTop: "2px" }}>→</span>
                  <span style={{
                    fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                    fontSize: "11px",
                    color: "#8888A0",
                    lineHeight: 1.5,
                  }}>
                    {f}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function LessonsLog() {
  const [data, setData] = useState<LessonsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/lab/lessons")
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setData({ entries: [] }))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    const q = search.toLowerCase().trim();
    if (!q) return data.entries;
    return data.entries.filter(entry => {
      const combined = [
        entry.date,
        ...entry.missed,
        ...entry.why,
        ...entry.fix,
      ].join(" ").toLowerCase();
      return combined.includes(q);
    });
  }, [data, search]);

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
          padding: "12px 16px",
          borderBottom: "1px solid #1E2D45",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <span style={{
          fontFamily: "var(--font-syne, Syne, sans-serif)",
          fontSize: "13px",
          fontWeight: 700,
          color: "#F0F0F5",
        }}>
          📚 Lessons Learned Log
        </span>
        {data && (
          <span style={{
            fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            fontSize: "10px",
            color: "#A0A0B0",
          }}>
            {filtered.length} / {data.entries.length} entries
          </span>
        )}
      </div>

      {/* Search bar */}
      <div style={{ padding: "10px 16px", borderBottom: "1px solid #1E2D45" }}>
        <div style={{ position: "relative" }}>
          <span style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#A0A0B0",
            fontSize: "12px",
            pointerEvents: "none",
          }}>
            🔍
          </span>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search lessons, root causes, fixes…"
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid #1E2D45",
              borderRadius: "8px",
              padding: "7px 10px 7px 30px",
              color: "#F0F0F5",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              fontSize: "12px",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.15s ease",
            }}
            onFocus={e => (e.currentTarget.style.borderColor = "#4F8EF7")}
            onBlur={e => (e.currentTarget.style.borderColor = "#1E2D45")}
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                color: "#A0A0B0",
                cursor: "pointer",
                fontSize: "12px",
                padding: 0,
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Entries */}
      <div style={{ padding: "12px 16px", maxHeight: "420px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
        {loading ? (
          <div style={{
            textAlign: "center",
            color: "#A0A0B0",
            fontSize: "13px",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            padding: "24px 0",
          }}>
            Loading lessons log…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: "center",
            color: "#A0A0B0",
            fontSize: "13px",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            padding: "24px 0",
          }}>
            {search ? `No results for "${search}"` : "No lessons recorded yet"}
          </div>
        ) : (
          filtered.map((entry, i) => <EntryCard key={i} entry={entry} />)
        )}
      </div>
    </div>
  );
}
