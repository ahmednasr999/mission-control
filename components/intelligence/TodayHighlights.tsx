"use client";

import { useEffect, useState } from "react";

interface Agent {
  name: string;
  role: string;
  status: string;
}

interface HighlightsResponse {
  priorities: string[];
  identity: string[];
  agents: Agent[];
}

export default function TodayHighlights() {
  const [data, setData] = useState<HighlightsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/intelligence/highlights")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (loading || error || !data) return null;

  const topPriorities = data.priorities.slice(0, 3);
  const whoAhmedIs = data.identity.slice(0, 2);

  return (
    <div
      style={{
        marginBottom: "20px",
        borderRadius: "10px",
        border: "1px solid #1E2D45",
        background: "#020617",
        padding: "10px 14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "18px" }}>🧭</span>
        <div>
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
            Todays Highlights
          </div>
          <div
            style={{
              marginTop: "2px",
              fontSize: "11px",
              color: "#9CA3AF",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            }}
          >
            {topPriorities.length > 0
              ? topPriorities.join("  •  ")
              : "No strategic priorities found in MEMORY.md"}
          </div>
        </div>
      </div>
      {whoAhmedIs.length > 0 && (
        <div
          style={{
            maxWidth: "50%",
            fontSize: "11px",
            color: "#9CA3AF",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            textAlign: "right",
            whiteSpace: "nowrap",
            textOverflow: "ellipsis",
            overflow: "hidden",
          }}
          title={whoAhmedIs.join(" • ")}
        >
          {whoAhmedIs.join("  •  ")}
        </div>
      )}
    </div>
  );
}
