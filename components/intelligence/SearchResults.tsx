"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface QmdResult {
  uri: string;
  file: string;
  title: string;
  score: string;
  snippet: string;
}

interface SearchResultsProps {
  results: QmdResult[];
  query: string;
  focusedIndex: number;
  onResultClick?: (result: QmdResult) => void;
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const regex = new RegExp(
    `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        style={{
          background: "rgba(79, 142, 247, 0.25)",
          color: "#4F8EF7",
          borderRadius: "2px",
          padding: "0 1px",
          fontWeight: 700,
        }}
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

function scoreColor(score: string): string {
  const num = parseInt(score);
  if (num >= 70) return "#34D399";
  if (num >= 40) return "#FBBF24";
  return "#A0A0B0";
}

export default function SearchResults({
  results,
  query,
  focusedIndex,
  onResultClick,
}: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          color: "#A0A0B0",
          fontSize: "13px",
          fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          padding: "24px 0",
        }}
      >
        {query.length >= 2
          ? `No results for "${query}"`
          : "Search across your workspace with QMD semantic search"}
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div
        style={{
          fontSize: "11px",
          color: "#A0A0B0",
          fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
          paddingBottom: "4px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span>
          {results.length} result{results.length !== 1 ? "s" : ""}
        </span>
        <Badge
          variant="outline"
          style={{
            fontSize: "9px",
            padding: "1px 6px",
            color: "#4F8EF7",
            borderColor: "#4F8EF720",
          }}
        >
          QMD Semantic
        </Badge>
      </div>

      {results.map((result, idx) => {
        const isFocused = idx === focusedIndex;
        return (
          <Card
            key={result.uri}
            onClick={() => onResultClick?.(result)}
            style={{
              background: isFocused
                ? "rgba(79, 142, 247, 0.08)"
                : "rgba(255,255,255,0.02)",
              border: isFocused
                ? "1px solid rgba(79, 142, 247, 0.4)"
                : "1px solid #1E2D45",
              borderRadius: "8px",
              padding: "12px 14px",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {/* Header: file + score */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: "6px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span style={{ fontSize: "14px" }}>📄</span>
                <span
                  style={{
                    fontFamily:
                      "var(--font-dm-mono, DM Mono, monospace)",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#4F8EF7",
                  }}
                >
                  {result.file}
                </span>
              </div>
              <Badge
                variant="outline"
                style={{
                  fontSize: "10px",
                  padding: "2px 8px",
                  color: scoreColor(result.score),
                  borderColor: `${scoreColor(result.score)}40`,
                }}
              >
                {result.score}
              </Badge>
            </div>

            {/* Title */}
            <div
              style={{
                fontFamily:
                  "var(--font-dm-sans, DM Sans, sans-serif)",
                fontSize: "13px",
                fontWeight: 600,
                color: "#F0F0F5",
                marginBottom: "4px",
              }}
            >
              {result.title}
            </div>

            {/* Snippet */}
            {result.snippet && (
              <div
                style={{
                  fontFamily:
                    "var(--font-dm-sans, DM Sans, sans-serif)",
                  fontSize: "12px",
                  color: "#A0A0B0",
                  lineHeight: 1.5,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {highlightText(result.snippet, query)}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}
