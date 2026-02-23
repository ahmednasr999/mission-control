"use client";

import { useEffect, useState } from "react";

interface Match {
  line: number;
  text: string;
  context: string;
}

interface FileResult {
  file: string;
  matches: Match[];
}

interface SearchResponse {
  results: FileResult[];
  totalMatches: number;
}

interface SearchActionsProps {
  query: string;
}

export default function SearchActions({ query }: SearchActionsProps) {
  const [data, setData] = useState<SearchResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setData(null);
      return;
    }
    setLoading(true);
    fetch(`/api/intelligence/search?q=${encodeURIComponent(query)}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setData(null);
        setLoading(false);
      });
  }, [query]);

  if (!query || query.trim().length < 2) return null;

  const hasMatches = data && data.totalMatches > 0;

  return (
    <div
      style={{
        marginTop: "16px",
        borderRadius: "10px",
        border: "1px solid #1E2D45",
        background: "#020617",
        padding: "12px 14px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "16px" }}>🧩</span>
          <div
            style={{
              fontFamily: "var(--font-syne, Syne, sans-serif)",
              fontSize: "13px",
              fontWeight: 600,
              color: "#F0F0F5",
              letterSpacing: "0.02em",
              textTransform: "uppercase",
            }}
          >
            Suggested Actions
          </div>
        </div>
        {loading && (
          <span
            style={{
              fontSize: "11px",
              color: "#6B7280",
              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            }}
          >
            Thinking…
          </span>
        )}
      </div>

      {!hasMatches && !loading && (
        <div
          style={{
            fontSize: "11px",
            color: "#9CA3AF",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          }}
        >
          No notes found yet for "{query}". Once you have more history on this topic, Ill propose concrete next steps here.
        </div>
      )}

      {hasMatches && data && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            fontSize: "11px",
            color: "#E5E7EB",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          }}
        >
          {data.results.slice(0, 3).map((file, idx) => (
            <div
              key={idx}
              style={{
                padding: "6px 8px",
                borderRadius: "6px",
                border: "1px solid #1E2D45",
                background: "#020617",
              }}
            >
              <div
                style={{
                  marginBottom: "2px",
                  color: "#9CA3AF",
                  fontSize: "10px",
                  fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                }}
              >
                {file.file}
              </div>
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.4,
                  color: "#D1D5DB",
                }}
              >
                {file.matches[0]?.context}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
