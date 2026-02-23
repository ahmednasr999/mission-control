"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";

interface AgentCardProps {
  id: string;
  name: string;
  emoji: string;
  role: string;
  isActive: boolean;
  lastActive: string | null;
  sessionCount: number;
  isMain?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
}

function formatLastActive(iso: string | null): string {
  if (!iso) return "Never";
  try {
    const d = new Date(iso);
    const now = Date.now();
    const diff = now - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  } catch {
    return "Unknown";
  }
}

export default function AgentCard({
  id,
  name,
  emoji,
  role,
  isActive,
  lastActive,
  sessionCount,
  isMain = false,
  isSelected = false,
  onClick,
}: AgentCardProps) {
  const [hovered, setHovered] = useState(false);

  const borderColor = isSelected
    ? "#4F8EF7"
    : hovered
    ? "#4F8EF780"
    : "#1E2D45";

  const glowColor = isSelected
    ? "0 0 0 1px #4F8EF740, 0 4px 24px #4F8EF720"
    : hovered
    ? "0 2px 12px rgba(79,142,247,0.1)"
    : "none";

  return (
    <Card
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isSelected
          ? "linear-gradient(135deg, rgba(79,142,247,0.08), rgba(124,58,237,0.08))"
          : "#0D1220",
        border: `1px solid ${borderColor}`,
        borderRadius: "10px",
        padding: isMain ? "20px 24px" : "14px 16px",
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: glowColor,
        position: "relative",
        userSelect: "none",
        ...(isMain && {
          background: isSelected
            ? "linear-gradient(135deg, rgba(79,142,247,0.12), rgba(124,58,237,0.12))"
            : "linear-gradient(135deg, rgba(79,142,247,0.05), rgba(124,58,237,0.05))",
          border: `1px solid ${isSelected ? "#4F8EF7" : hovered ? "#7C3AED60" : "#4F8EF730"}`,
        }),
      }}
    >
      {/* Status dot */}
      <div
        style={{
          position: "absolute",
          top: isMain ? "14px" : "10px",
          right: isMain ? "14px" : "10px",
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: isActive ? "#34D399" : "#A0A0B0",
          boxShadow: isActive ? "0 0 6px #34D39980" : "none",
        }}
      />

      {/* Emoji */}
      <div
        style={{
          fontSize: isMain ? "32px" : "24px",
          marginBottom: isMain ? "10px" : "6px",
          lineHeight: 1,
        }}
      >
        {emoji}
      </div>

      {/* Name */}
      <div
        style={{
          fontFamily: "var(--font-syne, Syne, sans-serif)",
          fontSize: isMain ? "18px" : "14px",
          fontWeight: 700,
          color: "#F0F0F5",
          letterSpacing: "-0.02em",
          marginBottom: "2px",
        }}
      >
        {name}
      </div>

      {/* Role */}
      <div
        style={{
          fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          fontSize: isMain ? "12px" : "11px",
          color: "#8888A0",
          marginBottom: isMain ? "12px" : "8px",
        }}
      >
        {role}
      </div>

      {/* Footer: last active + session count */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            fontSize: "10px",
            color: isActive ? "#34D399" : "#A0A0B0",
          }}
        >
          <span
            style={{
              width: "5px",
              height: "5px",
              borderRadius: "50%",
              background: isActive ? "#34D399" : "#A0A0B0",
              flexShrink: 0,
            }}
          />
          {isActive ? "Active" : formatLastActive(lastActive)}
        </span>

        {sessionCount > 0 && (
          <span
            style={{
              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
              fontSize: "10px",
              color: "#A0A0B0",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid #1E2D45",
              borderRadius: "20px",
              padding: "1px 6px",
            }}
          >
            {sessionCount} sessions
          </span>
        )}
      </div>
    </Card>
  );
}
