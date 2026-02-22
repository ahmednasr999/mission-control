"use client";

import { useState } from "react";
import type { ContentItem } from "@/lib/marketing-db";

// ---- Pillar colors ----

const PILLAR_COLORS: Record<string, string> = {
  "thought leadership": "#3B82F6",
  "regional positioning": "#22D3EE",
  story: "#8B5CF6",
  leadership: "#EC4899",
};

function getPillarColor(pillar: string): string {
  const key = pillar.toLowerCase().trim();
  for (const [k, v] of Object.entries(PILLAR_COLORS)) {
    if (key.includes(k)) return v;
  }
  return "#94A3B8"; // default gray
}

function getPillarLabel(pillar: string): string {
  if (!pillar || pillar === "—") return "Other";
  return pillar;
}

// ---- Sub-components ----

function PillarTag({ pillar }: { pillar: string }) {
  const color = getPillarColor(pillar);
  const label = getPillarLabel(pillar);
  if (!pillar) return null;
  return (
    <span
      style={{
        fontSize: "10px",
        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
        fontWeight: 600,
        color,
        background: `${color}18`,
        border: `1px solid ${color}40`,
        borderRadius: "20px",
        padding: "2px 8px",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      {label}
    </span>
  );
}

function AssigneeBadge({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
  // Ahmed = blue, LOTFI = violet, default = gray
  const color = name.toLowerCase().startsWith("ahmed")
    ? "#4F8EF7"
    : name.toLowerCase().startsWith("lotfi")
    ? "#7C3AED"
    : "#64748B";

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "10px",
        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
        fontWeight: 600,
        color,
        background: `${color}18`,
        border: `1px solid ${color}35`,
        borderRadius: "20px",
        padding: "2px 7px 2px 4px",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "14px",
          height: "14px",
          borderRadius: "50%",
          background: color,
          color: "#F0F0F5",
          fontSize: "8px",
          fontWeight: 700,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {initial}
      </span>
      {name.toUpperCase()}
    </span>
  );
}

// ---- Main card ----

interface ContentCardProps {
  item: ContentItem;
  accentColor?: string;
  dimmed?: boolean;
}

export default function ContentCard({
  item,
  accentColor = "#64748B",
  dimmed = false,
}: ContentCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#0D1220",
        border: `1px solid ${hovered ? accentColor + "55" : "#1E2D45"}`,
        borderRadius: "10px",
        padding: "12px 14px",
        cursor: "default",
        transition: "all 0.15s ease",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 4px 20px ${accentColor}20, 0 0 0 1px ${accentColor}25`
          : "none",
        opacity: dimmed ? 0.55 : 1,
        marginBottom: "8px",
      }}
    >
      {/* Title */}
      <div
        style={{
          fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          fontSize: "14px",
          fontWeight: 700,
          color: "#F0F0F5",
          lineHeight: 1.35,
          marginBottom: "8px",
        }}
      >
        {item.title}
      </div>

      {/* Pillar + Assignee row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          flexWrap: "wrap",
          marginBottom: "8px",
        }}
      >
        {item.pillar && <PillarTag pillar={item.pillar} />}
        {item.assignee && <AssigneeBadge name={item.assignee} />}
        {item.platform && (
          <span
            style={{
              fontSize: "10px",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              color: "#8888A0",
              background: "rgba(136,136,160,0.12)",
              border: "1px solid rgba(136,136,160,0.25)",
              borderRadius: "20px",
              padding: "2px 7px",
              whiteSpace: "nowrap",
            }}
          >
            {item.platform}
          </span>
        )}
      </div>

      {/* Word count + Date row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "6px",
        }}
      >
        {item.wordCount != null && (
          <span
            style={{
              fontSize: "11px",
              color: "#A0A0B0",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            }}
          >
            {item.wordCount.toLocaleString()} words
          </span>
        )}

        {item.date && item.date !== "—" && (
          <span
            style={{
              fontSize: "11px",
              color: "#A0A0B0",
              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
              marginLeft: "auto",
            }}
          >
            {item.date}
          </span>
        )}
      </div>

      {/* Performance note (published cards) */}
      {item.performance && (
        <div
          style={{
            marginTop: "8px",
            fontSize: "11px",
            color: "#34D399",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={item.performance}
        >
          📈 {item.performance}
        </div>
      )}

      {/* File reference */}
      {item.file && (
        <div
          style={{
            marginTop: "6px",
            fontSize: "10px",
            color: "#A0A0B0",
            fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={item.file}
        >
          📄 {item.file.split("/").pop()}
        </div>
      )}
    </div>
  );
}
