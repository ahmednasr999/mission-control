"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";

interface Agent {
  name: string;
  role: string;
  status: string;
}

interface HighlightsData {
  priorities: string[];
  identity: string[];
  agents: Agent[];
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card style={{ background: "#0D1220", borderColor: "#1E2D45", overflow: "hidden", marginBottom: "12px" }}>
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #1E2D45",
          display: "flex",
          alignItems: "center",
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
          {title}
        </span>
      </div>
      <div style={{ padding: "14px 16px" }}>{children}</div>
    </Card>
  );
}

export default function MemoryHighlights() {
  const [data, setData] = useState<HighlightsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/intelligence/highlights")
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setData({ priorities: [], identity: [], agents: [] }))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Card style={{ background: "#0D1220", borderColor: "#1E2D45", padding: "24px", textAlign: "center" }}>
        <span style={{ color: "#A0A0B0", fontSize: "13px", fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)" }}>
          Loading memory…
        </span>
      </Card>
    );
  }

  if (!data) return null;

  return (
    <div>
      {/* Strategic Priorities */}
      <SectionCard title="🎯 Current Strategic Priorities">
        {data.priorities.length === 0 ? (
          <span style={{ color: "#A0A0B0", fontSize: "13px" }}>No priorities found</span>
        ) : (
          <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: "8px" }}>
            {data.priorities.map((p, i) => (
              <li
                key={i}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "10px",
                  fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                  fontSize: "13px",
                  color: "#F0F0F5",
                  lineHeight: 1.5,
                }}
              >
                <span
                  style={{
                    flexShrink: 0,
                    width: "20px",
                    height: "20px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #4F8EF7, #7C3AED)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "10px",
                    fontWeight: 700,
                    color: "#fff",
                    fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                    marginTop: "1px",
                  }}
                >
                  {i + 1}
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ol>
        )}
      </SectionCard>

      {/* Who Ahmed Is */}
      <SectionCard title="🧠 Who Ahmed Is">
        {data.identity.length === 0 ? (
          <span style={{ color: "#A0A0B0", fontSize: "13px" }}>No identity data found</span>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {data.identity.map((fact, i) => (
              <div
                key={i}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid #1E2D45",
                  borderRadius: "6px",
                  padding: "7px 12px",
                  fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                  fontSize: "12px",
                  color: "#8888A0",
                  lineHeight: 1.5,
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                }}
              >
                <span style={{ color: "#4F8EF7", flexShrink: 0, marginTop: "1px" }}>▸</span>
                <span>{fact}</span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* AI Agent Registry */}
      <SectionCard title="🤖 AI Automation Ecosystem">
        {data.agents.length === 0 ? (
          <span style={{ color: "#A0A0B0", fontSize: "13px" }}>No agents found</span>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Agent", "Role", "Status"].map(h => (
                  <th
                    key={h}
                    style={{
                      textAlign: "left",
                      padding: "6px 8px",
                      fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                      fontSize: "10px",
                      fontWeight: 600,
                      color: "#A0A0B0",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      borderBottom: "1px solid #1E2D45",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.agents.map((agent, i) => (
                <tr
                  key={i}
                  style={{
                    borderBottom: i < data.agents.length - 1 ? "1px solid rgba(30,45,69,0.5)" : "none",
                  }}
                >
                  <td
                    style={{
                      padding: "8px 8px",
                      fontFamily: "var(--font-syne, Syne, sans-serif)",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#F0F0F5",
                    }}
                  >
                    {agent.name}
                  </td>
                  <td
                    style={{
                      padding: "8px 8px",
                      fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                      fontSize: "12px",
                      color: "#8888A0",
                    }}
                  >
                    {agent.role}
                  </td>
                  <td style={{ padding: "8px 8px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                        fontSize: "11px",
                        color: agent.status.toLowerCase() === "active" ? "#34D399" : "#F87171",
                      }}
                    >
                      <span
                        style={{
                          width: "6px",
                          height: "6px",
                          borderRadius: "50%",
                          background: agent.status.toLowerCase() === "active" ? "#34D399" : "#F87171",
                          flexShrink: 0,
                        }}
                      />
                      {agent.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </SectionCard>
    </div>
  );
}
