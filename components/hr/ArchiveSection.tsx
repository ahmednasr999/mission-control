"use client";

import { useEffect, useState } from "react";
import JobCard, { Job } from "./JobCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ArchiveResponse {
  archived: Job[];
  count: number;
}

export default function ArchiveSection() {
  const [expanded, setExpanded] = useState(false);
  const [data, setData] = useState<ArchiveResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/hr/archive")
      .then((r) => r.json())
      .then((d) => {
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
      fetch("/api/hr/archive")
        .then((r) => r.json())
        .then((d) => {
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
    <Card className="overflow-hidden" style={{ background: "#0D1220", borderColor: "#1E2D45" }}>
      <Button
        variant="ghost"
        onClick={handleToggle}
        className="w-full justify-start px-5 py-3 h-auto"
        style={{ borderBottom: expanded ? "1px solid #1E2D45" : "none", borderRadius: 0 }}
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
          <Badge variant="secondary" className="ml-2" style={{ background: "rgba(107,114,128,0.15)", borderColor: "rgba(107,114,128,0.3)", color: "#6B7280" }}>
            {count}
          </Badge>
        )}
        <span
          style={{
            fontSize: "11px",
            color: "#A0A0B0",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            marginLeft: "4px",
          }}
        >
          Closed applications &gt;30 days ago
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
              No archived applications yet
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: "8px",
              }}
            >
              {archived.map((job) => (
                <JobCard key={job.id} job={job} dimmed />
              ))}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
