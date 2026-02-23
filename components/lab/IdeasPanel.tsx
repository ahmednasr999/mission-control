"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Section {
  title: string;
  content: string;
  agent?: string;
}

interface IdeasData {
  sections: Section[];
}

function renderContent(content: string): React.ReactNode {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let tableBuffer: string[] = [];
  let inTable = false;
  let keyCounter = 0;

  const key = () => `k-${keyCounter++}`;

  const flushTable = () => {
    if (tableBuffer.length === 0) return;
    const rows = tableBuffer.map(row =>
      row.split("|").map(cell => cell.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1)
    );
    const header = rows[0] || [];
    const body = rows.slice(2); // skip separator row

    elements.push(
      <div key={key()} style={{ overflowX: "auto", marginBottom: "8px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
          <thead>
            <tr>
              {header.map((h, i) => (
                <th
                  key={i}
                  style={{
                    textAlign: "left",
                    padding: "5px 8px",
                    color: "#A0A0B0",
                    fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                    fontSize: "10px",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    borderBottom: "1px solid #1E2D45",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {body.map((row, ri) => (
              <tr key={ri} style={{ borderBottom: "1px solid rgba(30,45,69,0.4)" }}>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    style={{
                      padding: "5px 8px",
                      color: ci === 0 ? "#F0F0F5" : "#8888A0",
                      fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                      fontSize: "11px",
                    }}
                  >
                    {renderInline(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableBuffer = [];
    inTable = false;
  };

  for (const line of lines) {
    // Table rows
    if (line.trim().startsWith("|")) {
      inTable = true;
      tableBuffer.push(line);
      continue;
    } else if (inTable) {
      flushTable();
    }

    const trimmed = line.trim();

    // Skip empty lines (just add small gap)
    if (!trimmed) {
      elements.push(<div key={key()} style={{ height: "4px" }} />);
      continue;
    }

    // Code block fence
    if (trimmed.startsWith("```")) {
      continue; // skip fence markers
    }

    // h3
    if (trimmed.startsWith("### ")) {
      elements.push(
        <div key={key()} style={{
          fontFamily: "var(--font-syne, Syne, sans-serif)",
          fontSize: "12px",
          fontWeight: 700,
          color: "#8888A0",
          marginTop: "10px",
          marginBottom: "4px",
        }}>
          {trimmed.slice(4)}
        </div>
      );
      continue;
    }

    // h4
    if (trimmed.startsWith("#### ")) {
      elements.push(
        <div key={key()} style={{
          fontFamily: "var(--font-syne, Syne, sans-serif)",
          fontSize: "11px",
          fontWeight: 700,
          color: "#A0A0B0",
          marginTop: "6px",
          marginBottom: "2px",
        }}>
          {trimmed.slice(5)}
        </div>
      );
      continue;
    }

    // Bullet/list item
    if (trimmed.startsWith("- ") || trimmed.startsWith("* ") || trimmed.match(/^\d+\. /) || trimmed.match(/^- \[/)) {
      const text = trimmed.replace(/^- \[[ x]\] /, "").replace(/^[-*] /, "").replace(/^\d+\. /, "");
      elements.push(
        <div key={key()} style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "8px",
          marginBottom: "3px",
        }}>
          <span style={{ color: "#4F8EF7", flexShrink: 0, marginTop: "2px", fontSize: "10px" }}>▸</span>
          <span style={{
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            fontSize: "11px",
            color: "#8888A0",
            lineHeight: 1.5,
          }}>
            {renderInline(text)}
          </span>
        </div>
      );
      continue;
    }

    // Code inline / monospace line
    if (trimmed.startsWith("`") && trimmed.endsWith("`")) {
      elements.push(
        <code key={key()} style={{
          display: "block",
          background: "rgba(255,255,255,0.04)",
          border: "1px solid #1E2D45",
          borderRadius: "4px",
          padding: "4px 8px",
          fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
          fontSize: "10px",
          color: "#4F8EF7",
          marginBottom: "4px",
        }}>
          {trimmed.slice(1, -1)}
        </code>
      );
      continue;
    }

    // Regular text
    elements.push(
      <p key={key()} style={{
        margin: "0 0 4px 0",
        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
        fontSize: "11px",
        color: "#8888A0",
        lineHeight: 1.6,
      }}>
        {renderInline(trimmed)}
      </p>
    );
  }

  if (inTable) flushTable();

  return <>{elements}</>;
}

function renderInline(text: string): React.ReactNode {
  // Bold: **text**
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ color: "#F0F0F5", fontWeight: 700 }}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={i} style={{
        fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
        fontSize: "10px",
        color: "#4F8EF7",
        background: "rgba(79,142,247,0.1)",
        padding: "1px 4px",
        borderRadius: "3px",
      }}>{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function IdeaCard({ section }: { section: Section }) {
  const [expanded, setExpanded] = useState(false);
  const preview = section.content.replace(/[#*`|\[\]]/g, "").replace(/\s+/g, " ").trim().slice(0, 120);

  return (
    <div
      style={{
        background: "#0D1220",
        border: "1px solid #1E2D45",
        borderRadius: "10px",
        overflow: "hidden",
        transition: "border-color 0.15s ease",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "#2E4060")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "#1E2D45")}
    >
      {/* Header */}
      <div
        style={{
          padding: "12px 14px",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          cursor: "pointer",
          borderBottom: expanded ? "1px solid #1E2D45" : "none",
        }}
        onClick={() => setExpanded(e => !e)}
      >
        {/* Agent badge */}
        {section.agent && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "24px",
              height: "24px",
              borderRadius: "6px",
              background: "linear-gradient(135deg, rgba(79,142,247,0.2), rgba(124,58,237,0.2))",
              border: "1px solid rgba(79,142,247,0.3)",
              fontSize: "12px",
              flexShrink: 0,
              marginTop: "1px",
            }}
          >
            {section.agent.split(" ")[0]}
          </span>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px" }}>
            <h3
              style={{
                margin: 0,
                fontFamily: "var(--font-syne, Syne, sans-serif)",
                fontSize: "13px",
                fontWeight: 700,
                color: "#F0F0F5",
                lineHeight: 1.3,
              }}
            >
              {section.title}
            </h3>
            <span
              style={{
                color: "#A0A0B0",
                fontSize: "11px",
                flexShrink: 0,
                marginTop: "2px",
                transition: "transform 0.15s ease",
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                display: "inline-block",
              }}
            >
              ▾
            </span>
          </div>

          {/* Agent name label */}
          {section.agent && (
            <span style={{
              display: "inline-block",
              marginTop: "3px",
              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
              fontSize: "9px",
              color: "#4F8EF7",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}>
              {section.agent.split(" ").slice(1).join(" ")}
            </span>
          )}

          {!expanded && (
            <p style={{
              margin: "6px 0 0",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              fontSize: "11px",
              color: "#A0A0B0",
              lineHeight: 1.5,
            }}>
              {preview}{section.content.length > 120 ? "…" : ""}
            </p>
          )}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div style={{ padding: "12px 14px" }}>
          {renderContent(section.content)}
        </div>
      )}

      {/* Read More / Collapse button */}
      <div
        style={{
          padding: "6px 14px 8px",
          borderTop: expanded ? "1px solid #1E2D45" : "none",
        }}
      >
        <Button
          variant="ghost"
          onClick={() => setExpanded(e => !e)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            fontSize: "10px",
            color: expanded ? "#A0A0B0" : "#4F8EF7",
            padding: 0,
            letterSpacing: "0.04em",
          }}
        >
          {expanded ? "← Collapse" : "Read More →"}
        </Button>
      </div>
    </div>
  );
}

export default function IdeasPanel() {
  const [data, setData] = useState<IdeasData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/lab/ideas")
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setData({ sections: [] }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px", overflow: "hidden" }}>
      <CardHeader className="pb-3" style={{ padding: "12px 16px", borderBottom: "1px solid #1E2D45", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <CardTitle className="text-sm font-semibold" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)", fontSize: "13px", fontWeight: 700, color: "#F0F0F5" }}>
          💡 Ideas & Recommendations
        </CardTitle>
        {data && (
          <span style={{
            fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            fontSize: "10px",
            color: "#A0A0B0",
          }}>
            {data.sections.length} sections
          </span>
        )}
      </CardHeader>
      <CardContent className="p-4" style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        {loading ? (
          <div style={{
            textAlign: "center",
            color: "#A0A0B0",
            fontSize: "13px",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            padding: "24px 0",
          }}>
            Loading knowledge base…
          </div>
        ) : !data || data.sections.length === 0 ? (
          <div style={{ textAlign: "center", color: "#A0A0B0", fontSize: "13px", padding: "20px 0" }}>
            No sections found in second_brain.md
          </div>
        ) : (
          data.sections.map((section, i) => (
            <IdeaCard key={i} section={section} />
          ))
        )}
      </CardContent>
    </Card>
  );
}
