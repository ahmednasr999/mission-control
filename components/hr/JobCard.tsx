"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Job {
  id: number;
  company: string;
  role: string;
  status: string;
  column: "identified" | "radar" | "applied" | "interview" | "offer" | "closed";
  atsScore: number | null;
  nextAction: string | null;
  salary: string | null;
  companyDomain: string | null;
  updatedAt: string | null;
  link?: string | null;
  appliedDate?: string | null;
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
      <Badge variant="outline" className="text-slate-500 border-slate-700 bg-slate-900/50 font-mono text-xs">
        No ATS
      </Badge>
    );
  }

  const variant = score >= 85 ? "default" : score >= 70 ? "secondary" : "destructive";
  
  return (
    <Badge variant={variant as "default" | "secondary" | "destructive"} className="font-mono text-xs">
      {score}%
    </Badge>
  );
}

function SalaryIndicator({ salary }: { salary: string | null }) {
  if (!salary) return null;

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
  onClick?: (job: Job) => void;
  navigate?: boolean;
}

function getJobId(company: string): string {
  return company.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function JobCard({ job, dimmed = false, onClick, navigate = false }: JobCardProps) {
  const [hovered, setHovered] = useState(false);
  const router = useRouter();
  const colColor = COLUMN_COLORS[job.column] || "#64748B";
  const isHighMatchRadar = job.column === "radar" && (job.atsScore ?? 0) >= 85;

  const handleClick = () => {
    if (navigate) {
      router.push(`/hr/${getJobId(job.company)}`);
    } else {
      onClick?.(job);
    }
  };

  return (
    <Card
      onClick={handleClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`bg-slate-900/60 border-slate-700/50 hover:border-slate-600 cursor-pointer transition-all mb-2 ${
        isHighMatchRadar ? "border-pink-500/60 hover:border-pink-500" : ""
      } ${dimmed ? "opacity-60" : ""}`}
      style={{
        transform: hovered ? "translateY(-2px)" : "translateY(0)",
        boxShadow: hovered
          ? `0 4px 20px ${colColor}25, 0 0 0 1px ${colColor}30`
          : "none",
      }}
    >
      <CardContent className="p-3">
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
          <Badge
            style={{
              fontSize: "10px",
              color: colColor,
              background: `${colColor}18`,
              border: `1px solid ${colColor}40`,
            }}
            variant="outline"
          >
            {COLUMN_LABELS[job.column] || job.status}
          </Badge>

          {/* ATS score badge */}
          <AtsScoreBadge score={job.atsScore} />
        </div>

        {/* Salary indicator */}
        {job.salary && (
          <div style={{ marginTop: "8px" }}>
            <SalaryIndicator salary={job.salary} />
          </div>
        )}

        {/* Interview Highlight - Only for interview column */}
        {job.column === "interview" && job.nextAction && (
          <div
            style={{
              marginTop: "8px",
              padding: "8px 10px",
              background: "rgba(245, 158, 11, 0.18)",
              border: "1px solid rgba(245, 158, 11, 0.4)",
              borderRadius: "8px",
              fontSize: "11px",
              color: "#FBBF24",
              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
              fontWeight: 700,
              textAlign: "center",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
            }}
          >
            🎯 Next Interview: {job.nextAction}
          </div>
        )}

        {/* Next action */}
        {job.nextAction && (
          <div
            style={{
              marginTop: "8px",
              fontSize: "11px",
              color: "#A0A0B0",
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
      </CardContent>
    </Card>
  );
}
