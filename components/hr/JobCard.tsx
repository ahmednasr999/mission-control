"use client";

import { useState } from "react";

export interface Job {
  id: number;
  company: string;
  role: string;
  status: string;
  column: "identified" | "applied" | "interview" | "offer" | "closed";
  atsScore: number | null;
  nextAction: string | null;
  salary: string | null;
  companyDomain: string | null;
  updatedAt: string | null;
}

const COLUMN_COLORS: Record<string, string> = {
  identified: "#64748B",
  applied: "#3B82F6",
  interview: "#F59E0B",
  offer: "#34D399",
  closed: "#6B7280",
};

const COLUMN_LABELS: Record<string, string> = {
  identified: "Identified",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  closed: "Closed",
};

function AtsScoreBadge({ score }: { score: number | null }) {
  if (score == null) {
    return (
      <span
        style={{
          fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
          fontSize: "10px",
          color: "#555570",
          background: "rgba(85,85,112,0.15)",
          border: "1px solid rgba(85,85,112,0.3)",
          borderRadius: "20px",
          padding: "2px 7px",
          whiteSpace: "nowrap",
        }}
      >
        No ATS
      </span>
    );
  }

  const color =
    score >= 85 ? "#34D399" : score >= 70 ? "#F59E0B" : "#F87171";

  return (
    <span
      style={{
        fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
        fontSize: "10px",
        color,
        background: `${color}20`,
        border: `1px solid ${color}50`,
        borderRadius: "20px",
        padding: "2px 7px",
        whiteSpace: "nowrap",
        fontWeight: 600,
      }}
    >
      {score}%
    </span>
  );
}

function SalaryIndicator({ salary }: { salary: string | null }) {
  if (!salary) return null;

  // Try to extract numeric value from salary string
  const match = salary.match(/[\d,]+/);
  if (!match) return null;
  const num = parseInt(match[0].replace(/,/g, ""), 10);
  const meetsTarget = num >= 50000;

  return (
    <span
      title={`Salary: ${salary}`}
      style={{
        fontSize: "11px",
        color: meetsTarget ? "#34D399" : "#F59E0B",
        fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
      }}
    >
      {meetsTarget ? "✓" : "⚠"} {salary}
    </span>
  );
}

function CompanyLogo({
  company,
  domain,
}: {
  company: string;
  domain: string | null;
}) {
  const [imgError, setImgError] = useState(false);
  const firstLetter = (company || "?")[0].toUpperCase();

  // Generate a deterministic color from company name
  let hash = 0;
  for (let i = 0; i < company.length; i++) {
    hash = company.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash) % 360;
  const circleColor = `hsl(${hue}, 55%, 35%)`;

  if (domain && !imgError) {
    return (
      <div
        style={{
          width: "32px",
          height: "32px",
          borderRadius: "8px",
          overflow: "hidden",
          border: "1px solid #1E2D45",
          background: "#0D1220",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=32`}
          alt={company}
          width={20}
          height={20}
          onError={() => setImgError(true)}
          style={{ display: "block" }}
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "8px",
        background: circleColor,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "13px",
        fontWeight: 700,
        color: "#F0F0F5",
        fontFamily: "var(--font-syne, Syne, sans-serif)",
        flexShrink: 0,
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {firstLetter}
    </div>
  );
}

interface JobCardProps {
  job: Job;
  dimmed?: boolean;
}

export default function JobCard({ job, dimmed = false }: JobCardProps) {
  const [hovered, setHovered] = useState(false);
  const colColor = COLUMN_COLORS[job.column] || "#64748B";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#0D1220",
        border: `1px solid ${hovered ? colColor + "60" : "#1E2D45"}`,
        borderRadius: "10px",
        padding: "12px 14px",
        cursor: "default",
        transition: "all 0.15s ease",
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 4px 20px ${colColor}25, 0 0 0 1px ${colColor}30`
          : "none",
        opacity: dimmed ? 0.6 : 1,
        marginBottom: "8px",
      }}
    >
      {/* Top: Logo + Company + Role */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
        <CompanyLogo company={job.company} domain={job.companyDomain} />

        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              fontSize: "14px",
              fontWeight: 700,
              color: "#F0F0F5",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              lineHeight: 1.3,
            }}
          >
            {job.company}
          </div>
          <div
            style={{
              fontSize: "13px",
              color: "#8888A0",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              marginTop: "2px",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            }}
          >
            {job.role}
          </div>
        </div>
      </div>

      {/* Badges row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          marginTop: "10px",
          flexWrap: "wrap",
        }}
      >
        {/* Status badge */}
        <span
          style={{
            fontSize: "10px",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            fontWeight: 600,
            color: colColor,
            background: `${colColor}18`,
            border: `1px solid ${colColor}40`,
            borderRadius: "20px",
            padding: "2px 8px",
            whiteSpace: "nowrap",
          }}
        >
          {COLUMN_LABELS[job.column] || job.status}
        </span>

        {/* ATS score badge */}
        <AtsScoreBadge score={job.atsScore} />
      </div>

      {/* Salary indicator */}
      {job.salary && (
        <div style={{ marginTop: "8px" }}>
          <SalaryIndicator salary={job.salary} />
        </div>
      )}

      {/* Next action */}
      {job.nextAction && (
        <div
          style={{
            marginTop: "8px",
            fontSize: "11px",
            color: "#555570",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            lineHeight: 1.4,
          }}
          title={job.nextAction}
        >
          → {job.nextAction}
        </div>
      )}
    </div>
  );
}
