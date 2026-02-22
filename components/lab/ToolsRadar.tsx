"use client";

import { useState, useEffect } from "react";

interface Tool {
  name: string;
  description: string;
  category: string;
  /** Phase 2: evaluation date stamp e.g. "Feb 2026" */
  evaluatedAt?: string;
}

interface ToolsData {
  adopt: Tool[];
  trial: Tool[];
  reject: Tool[];
}

const COLUMN_CONFIG = [
  {
    key: "adopt" as const,
    label: "Adopt",
    emoji: "✅",
    color: "#34D399",
    bgColor: "rgba(52, 211, 153, 0.06)",
    borderColor: "rgba(52, 211, 153, 0.25)",
    dotColor: "#34D399",
    tagBg: "rgba(52, 211, 153, 0.1)",
    tagColor: "#34D399",
  },
  {
    key: "trial" as const,
    label: "Trial",
    emoji: "🧪",
    color: "#FBBF24",
    bgColor: "rgba(251, 191, 36, 0.06)",
    borderColor: "rgba(251, 191, 36, 0.25)",
    dotColor: "#FBBF24",
    tagBg: "rgba(251, 191, 36, 0.1)",
    tagColor: "#FBBF24",
  },
  {
    key: "reject" as const,
    label: "Reject",
    emoji: "❌",
    color: "#F87171",
    bgColor: "rgba(248, 113, 113, 0.06)",
    borderColor: "rgba(248, 113, 113, 0.25)",
    dotColor: "#F87171",
    tagBg: "rgba(248, 113, 113, 0.1)",
    tagColor: "#F87171",
  },
];

function ToolItem({
  tool,
  dotColor,
  tagBg,
  tagColor,
}: {
  tool: Tool;
  dotColor: string;
  tagBg: string;
  tagColor: string;
}) {
  return (
    <div
      style={{
        padding: "8px 10px",
        borderBottom: "1px solid rgba(30,45,69,0.5)",
        display: "flex",
        flexDirection: "column",
        gap: "3px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            background: dotColor,
            flexShrink: 0,
            boxShadow: `0 0 6px ${dotColor}60`,
          }}
        />
        <span
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "12px",
            fontWeight: 700,
            color: "#F0F0F5",
          }}
        >
          {tool.name}
        </span>
        <span
          style={{
            display: "inline-block",
            padding: "1px 5px",
            borderRadius: "4px",
            background: tagBg,
            color: tagColor,
            fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            fontSize: "9px",
            fontWeight: 600,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            marginLeft: "auto",
            flexShrink: 0,
          }}
        >
          {tool.category}
        </span>
      </div>
      <p
        style={{
          margin: 0,
          paddingLeft: "13px",
          fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          fontSize: "10px",
          color: "#A0A0B0",
          lineHeight: 1.4,
        }}
      >
        {tool.description}
      </p>
      {/* Phase 2: Evaluation timestamp */}
      {tool.evaluatedAt && (
        <div style={{
          paddingLeft: "13px",
          fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
          fontSize: "9px",
          color: "#A0A0B0",
          opacity: 0.7,
        }}>
          Evaluated: {tool.evaluatedAt}
        </div>
      )}
    </div>
  );
}

function ToolColumn({
  config,
  tools,
}: {
  config: typeof COLUMN_CONFIG[0];
  tools: Tool[];
}) {
  return (
    <div
      style={{
        flex: 1,
        background: config.bgColor,
        border: `1px solid ${config.borderColor}`,
        borderRadius: "8px",
        overflow: "hidden",
        minWidth: 0,
      }}
    >
      {/* Column header */}
      <div
        style={{
          padding: "8px 10px",
          borderBottom: `1px solid ${config.borderColor}`,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span style={{ fontSize: "12px" }}>{config.emoji}</span>
        <span
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "12px",
            fontWeight: 700,
            color: config.color,
          }}
        >
          {config.label}
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            fontSize: "10px",
            color: config.color,
            opacity: 0.7,
          }}
        >
          {tools.length}
        </span>
      </div>

      {/* Tool items */}
      <div>
        {tools.length === 0 ? (
          <div style={{
            padding: "16px 10px",
            textAlign: "center",
            color: "#A0A0B0",
            fontSize: "11px",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          }}>
            None recorded
          </div>
        ) : (
          tools.map((tool, i) => (
            <ToolItem
              key={i}
              tool={tool}
              dotColor={config.dotColor}
              tagBg={config.tagBg}
              tagColor={config.tagColor}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default function ToolsRadar() {
  const [data, setData] = useState<ToolsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/lab/tools")
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setData({ adopt: [], trial: [], reject: [] }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div
      style={{
        background: "#0D1220",
        border: "1px solid #1E2D45",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      {/* Panel header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #1E2D45",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{
          fontFamily: "var(--font-syne, Syne, sans-serif)",
          fontSize: "13px",
          fontWeight: 700,
          color: "#F0F0F5",
        }}>
          📡 Tools Radar
        </span>
        <span style={{
          fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          fontSize: "10px",
          color: "#A0A0B0",
        }}>
          Adopt · Trial · Reject
        </span>
      </div>

      {/* Three-column radar */}
      <div style={{ padding: "14px 16px" }}>
        {loading ? (
          <div style={{
            textAlign: "center",
            color: "#A0A0B0",
            fontSize: "13px",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            padding: "24px 0",
          }}>
            Loading tools radar…
          </div>
        ) : !data ? null : (
          <div style={{ display: "flex", gap: "10px" }}>
            {COLUMN_CONFIG.map(config => (
              <ToolColumn
                key={config.key}
                config={config}
                tools={data[config.key]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
