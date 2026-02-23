"use client";

import { useEffect, useState } from "react";
import ContentCard from "./ContentCard";
import type { ContentItem } from "@/lib/marketing-db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ArchiveResponse {
  archived: ContentItem[];
  count: number;
}

export default function MarketingArchive() {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState<ArchiveResponse | null>(null);
  const [fetched, setFetched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Fetch count on mount
  useEffect(() => {
    fetch("/api/marketing/archive")
      .then((r) => r.json())
      .then((d: ArchiveResponse) => {
        setData(d);
        setFetched(true);
      })
      .catch(() => {
        setFetched(true);
      });
  }, []);

  const handleToggle = () => {
    if (!expanded && !fetched) {
      setLoading(true);
      fetch("/api/marketing/archive")
        .then((r) => r.json())
        .then((d: ArchiveResponse) => {
          setData(d);
          setLoading(false);
          setFetched(true);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
          setFetched(true);
        });
    }
    setExpanded((prev) => !prev);
  };

  const count = data?.count ?? 0;
  const archived = data?.archived ?? [];

  return (
    <Card style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px", overflow: "hidden" }}>
      <Button
        variant="ghost"
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
          justifyContent: "flex-start",
        }}
      >
        <span
          style={{
            color: "#A0A0B0",
            fontSize: "12px",
            transition: "transform 0.2s ease",
            display: "inline-block",
            transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
          }}
        >
          ▶
        </span>

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

        <span
          style={{
            fontSize: "11px",
            color: "#A0A0B0",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            marginLeft: "4px",
          }}
        >
          Published posts &gt;30 days ago
        </span>
      </Button>

      {expanded && (
        <div style={{ padding: "16px 20px" }}>
          {loading ? (
            <div
              style={{
                padding: "24px",
                textAlign: "center",
                color: "#A0A0B0",
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
                color: "#A0A0B0",
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                fontSize: "13px",
              }}
            >
              No archived posts yet
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: "8px",
              }}
            >
              {archived.map((item) => (
                <ContentCard
                  key={item.id}
                  item={item}
                  accentColor="#34D399"
                  dimmed
                />
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
