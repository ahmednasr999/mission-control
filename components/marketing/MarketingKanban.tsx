"use client";

import { useEffect, useState } from "react";
import ContentCard from "./ContentCard";
import type { ContentItem } from "@/lib/marketing-db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PipelineResponse {
  columns: {
    ideas: ContentItem[];
    draft: ContentItem[];
    review: ContentItem[];
    scheduled: ContentItem[];
    published: ContentItem[];
  };
}

const COLUMNS: {
  key: keyof PipelineResponse["columns"];
  label: string;
  dotColor: string;
}[] = [
  { key: "ideas",     label: "Ideas",     dotColor: "#8888A0" },
  { key: "draft",     label: "Draft",     dotColor: "#D97706" },
  { key: "review",    label: "Review",    dotColor: "#7C3AED" },
  { key: "scheduled", label: "This Week", dotColor: "#F59E0B" },
  { key: "published",  label: "Done",      dotColor: "#059669" },
];

function EmptyColumn({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "24px 8px",
        textAlign: "center",
        color: "#A0A0B0",
        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
        fontSize: "12px",
      }}
    >
      No {label.toLowerCase()} yet
    </div>
  );
}

export default function MarketingKanban() {
  const [data, setData] = useState<PipelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetch("/api/marketing/pipeline")
      .then((r) => r.json())
      .then((d: PipelineResponse) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  const totalItems = data
    ? COLUMNS.reduce(
        (sum, col) => sum + (data.columns[col.key]?.length ?? 0),
        0
      )
    : 0;

  return (
    <Card style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px", overflow: "hidden", marginBottom: "20px" }}>
      <CardHeader className="pb-3" style={{ padding: "16px 20px 14px", borderBottom: "1px solid #1E2D45", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <CardTitle
            className="text-base"
            style={{
              fontFamily: "var(--font-syne, Syne, sans-serif)",
              fontSize: "15px",
              fontWeight: 700,
              color: "#F0F0F5",
              letterSpacing: "-0.02em",
            }}
          >
            Content Pipeline
          </CardTitle>
          <span
            style={{
              marginLeft: "10px",
              fontSize: "11px",
              color: "#A0A0B0",
              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            }}
          >
            Kanban
          </span>
        </div>
        {!loading && !error && (
          <span
            style={{
              fontSize: "11px",
              color: "#A0A0B0",
              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            }}
          >
            {totalItems} item{totalItems !== 1 ? "s" : ""}
          </span>
        )}
      </CardHeader>

      {/* Search bar */}
      <div style={{ padding: "12px 20px", borderBottom: "1px solid #1E2D45" }}>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Search content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: "#080C16",
              border: "1px solid #1E2D45",
              borderRadius: "6px",
              padding: "8px 12px 8px 32px",
              fontSize: "12px",
              color: "#F0F0F5",
              width: "100%",
              maxWidth: "240px",
              outline: "none",
            }}
          />
          <span style={{ position: "absolute", left: "10px", top: "8px", fontSize: "12px", color: "#6B7280" }}>🔍</span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: "8px",
                top: "8px",
                background: "none",
                border: "none",
                color: "#6B7280",
                cursor: "pointer",
                fontSize: "10px",
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <CardContent className="p-0">
        {loading ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: "#A0A0B0",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              fontSize: "13px",
            }}
          >
            Loading pipeline…
          </div>
        ) : error ? (
          <div
            style={{
              padding: "48px",
              textAlign: "center",
              color: "#F87171",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              fontSize: "13px",
            }}
          >
            Failed to load pipeline — check API
          </div>
        ) : (
          <div className="marketing-kanban-grid" style={{ minHeight: "300px" }}>
            <style>{`
              .marketing-kanban-grid {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 0;
              }
              @media (max-width: 768px) {
                .marketing-kanban-grid {
                  grid-template-columns: 1fr;
                }
                .marketing-kanban-grid > div {
                  border-right: none !important;
                  border-bottom: 1px solid #1E2D45;
                }
              }
            `}</style>
            {COLUMNS.map((col, idx) => {
              let items = data?.columns[col.key] ?? [];
              // Filter by search query
              if (searchQuery) {
                const q = searchQuery.toLowerCase();
                items = items.filter((item) =>
                  (item.title || "").toLowerCase().includes(q) ||
                  (item.pillar || "").toLowerCase().includes(q)
                );
              }
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
                    <div
                      style={{
                        width: "8px",
                        height: "8px",
                        borderRadius: "50%",
                        background: col.dotColor,
                        flexShrink: 0,
                      }}
                    />
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
                      {items.length}
                    </span>
                  </div>

                  <div
                    style={{
                      flex: 1,
                      overflowY: "auto",
                      padding: "12px 10px",
                      maxHeight: "480px",
                    }}
                  >
                    {items.length === 0 ? (
                      <EmptyColumn label={col.label} />
                    ) : (
                      items.map((item) => (
                        <ContentCard
                          key={item.id}
                          item={item}
                          accentColor={col.dotColor}
                        />
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
