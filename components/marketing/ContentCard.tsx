"use client";

import { useState } from "react";
import Link from "next/link";
import type { ContentItem } from "@/lib/marketing-db";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
  return "#94A3B8";
}

function getPillarLabel(pillar: string): string {
  if (!pillar || pillar === "—") return "Other";
  return pillar;
}

function PillarTag({ pillar }: { pillar: string }) {
  const color = getPillarColor(pillar);
  const label = getPillarLabel(pillar);
  if (!pillar) return null;
  return (
    <Badge style={{ 
      fontSize: "10px", 
      color, 
      background: `${color}18`, 
      border: `1px solid ${color}40` 
    }} variant="outline">
      {label}
    </Badge>
  );
}

function AssigneeBadge({ name }: { name: string }) {
  const initial = name.charAt(0).toUpperCase();
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
        flexShrink: 0,
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
    <Link href={`/marketing/${item.id}`} style={{ textDecoration: "none", display: "block" }}>
      <Card
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`bg-slate-900/60 border-slate-700/50 hover:border-slate-600 transition-all mb-2 cursor-pointer ${dimmed ? "opacity-55" : ""}`}
        style={{
          borderColor: hovered ? `${accentColor}55` : undefined,
          transform: hovered ? "translateY(-2px)" : "translateY(0)",
          boxShadow: hovered ? `0 4px 20px ${accentColor}20, 0 0 0 1px ${accentColor}25` : "none",
        }}
      >
        <CardContent className="p-3">
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
          <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
            <PillarTag pillar={item.pillar} />
            {item.assignee && <AssigneeBadge name={item.assignee} />}
          </div>

          {/* Performance Notes */}
          {item.performance && (
            <div
              style={{
                fontSize: "12px",
                color: "#A0A0B0",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                lineHeight: 1.4,
              }}
              title={item.performance}
            >
              {item.performance}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
