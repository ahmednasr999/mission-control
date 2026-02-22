"use client";

import { useEffect, useState } from "react";
import ContentCard from "./ContentCard";
import type { ContentItem } from "@/lib/marketing-db";

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
  { key: "ideas",     label: "Ideas",     dotColor: "#3B82F6" },
  { key: "draft",     label: "Draft",     dotColor: "#8B5CF6" },
  { key: "review",    label: "Review",    dotColor: "#F59E0B" },
  { key: "scheduled", label: "Scheduled", dotColor: "#22D3EE" },
  { key: "published", label: "Published", dotColor: "#34D399" },
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
    <div
      style={{
        background: "#0D1220",
        border: "1px solid #1E2D45",
        borderRadius: "10px",
        overflow: "hidden",
        marginBottom: "20px",
      }}
    >
      {/* Section header */}
      <div
        style={{
          padding: "16px 20px 14px",
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
              fontSize: "15px",
              fontWeight: 700,
              color: "#F0F0F5",
              letterSpacing: "-0.02em",
            }}
          >
            Content Pipeline
          </span>
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
      </div>

      {/* Kanban columns */}
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
            const items = data?.columns[col.key] ?? [];
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
                {/* Column header */}
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
                  {/* Status dot */}
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: col.dotColor,
                      flexShrink: 0,
                    }}
                  />
                  {/* Column name */}
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
                  {/* Count badge */}
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

                {/* Column body */}
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
    </div>
  );
}
