"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface QmdResult {
  uri: string;
  file: string;
  title: string;
  score: string;
  snippet: string;
}

interface SearchActionsProps {
  query: string;
}

export default function SearchActions({ query }: SearchActionsProps) {
  const [results, setResults] = useState<QmdResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    fetch(`/api/qmd/search?q=${encodeURIComponent(query)}&limit=3`)
      .then((r) => r.json())
      .then((d) => {
        setResults(d.results || []);
        setLoading(false);
      })
      .catch(() => {
        setResults([]);
        setLoading(false);
      });
  }, [query]);

  if (!query || query.trim().length < 2) return null;

  return (
    <Card className="mt-4" style={{ borderRadius: "10px", border: "1px solid #1E2D45", background: "#020617" }}>
      <CardContent className="p-3" style={{ padding: "12px 14px" }}>
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

        {results.length === 0 && !loading && (
          <div
            style={{
              fontSize: "11px",
              color: "#9CA3AF",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            }}
          >
            No results found for "{query}". Try a different search term.
          </div>
        )}

        {results.length > 0 && (
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
            {results.map((result, idx) => (
              <div
                key={idx}
                style={{
                  padding: "8px 10px",
                  borderRadius: "6px",
                  border: "1px solid #1E2D45",
                  background: "#0A0F1A",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "4px",
                  }}
                >
                  <span style={{ fontSize: "10px" }}>📄</span>
                  <span
                    style={{
                      color: "#4F8EF7",
                      fontSize: "10px",
                      fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                    }}
                  >
                    {result.file}
                  </span>
                  <span
                    style={{
                      color: result.score,
                      fontSize: "9px",
                      fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                      marginLeft: "auto",
                    }}
                  >
                    {result.score}
                  </span>
                </div>
                <div
                  style={{
                    whiteSpace: "pre-wrap",
                    lineHeight: 1.4,
                    color: "#D1D5DB",
                    fontSize: "11px",
                  }}
                >
                  {result.snippet || result.title}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
