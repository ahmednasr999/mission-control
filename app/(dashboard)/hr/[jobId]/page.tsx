"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase, Clock, FileText, TrendingUp, Calendar, ExternalLink, User, Target, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CVHistoryEntry {
  id: number;
  jobTitle: string;
  company: string;
  atsScore: number | null;
  status: string;
  createdAt: string;
  filePath: string | null;
}

interface TimelineEntry {
  date: string;
  excerpt: string;
  source: string;
}

interface JobDetail {
  id: number;
  company: string;
  role: string;
  status: string;
  column: string;
  atsScore: number | null;
  nextAction: string | null;
  salary: string | null;
  location: string | null;
  companyDomain: string | null;
  updatedAt: string | null;
  appliedDate: string | null;
  jdLink: string | null;
  cvHistory: CVHistoryEntry[];
  interviewNotes: TimelineEntry[];
  notes: string | null;
}

interface ApiResponse {
  job: JobDetail;
  interviewPrepLink: string | null;
  source: string;
}

const COLUMN_COLORS: Record<string, string> = {
  identified: "#64748B",
  radar: "#F472B6",
  applied: "#3B82F6",
  interview: "#F59E0B",
  offer: "#34D399",
  closed: "#6B7280",
};

const COLUMN_LABELS: Record<string, string> = {
  identified: "Identified",
  radar: "Radar",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  closed: "Closed",
};

function InfoCard({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "#0D1220",
        border: "1px solid #1E2D45",
        borderRadius: "12px",
        padding: "16px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
          color: "#A0A0B0",
        }}
      >
        {icon}
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          }}
        >
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colColor = COLUMN_COLORS[status] || "#64748B";
  return (
    <Badge
      style={{
        background: `${colColor}18`,
        borderColor: `${colColor}40`,
        color: colColor,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        fontSize: "11px",
        padding: "4px 10px",
      }}
    >
      {COLUMN_LABELS[status] || status}
    </Badge>
  );
}

function AtsScoreBadge({ score }: { score: number | null }) {
  if (score == null) {
    return (
      <Badge
        variant="outline"
        style={{
          borderColor: "#1E2D45",
          color: "#64748B",
          fontSize: "12px",
        }}
      >
        No ATS
      </Badge>
    );
  }

  const color = score >= 85 ? "#34D399" : score >= 70 ? "#F59E0B" : "#F87171";
  return (
    <Badge
      style={{
        background: `${color}18`,
        borderColor: `${color}40`,
        color: color,
        fontSize: "14px",
        fontWeight: 700,
        padding: "4px 12px",
      }}
    >
      {score}%
    </Badge>
  );
}

export default function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const router = useRouter();
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [jobId, setJobId] = useState<string>("");
  const [showAllNotes, setShowAllNotes] = useState(false);

  useEffect(() => {
    async function loadParams() {
      const resolved = await params;
      setJobId(resolved.jobId);
    }
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!jobId) return;
    fetch(`/api/hr/jobs/${jobId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [jobId]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#080C16",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ color: "#A0A0B0", fontFamily: "var(--font-dm-sans)" }}>Loading...</div>
      </div>
    );
  }

  if (error || !data?.job) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#080C16",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
        }}
      >
        <div style={{ color: "#F87171", fontFamily: "var(--font-dm-sans)" }}>Job not found</div>
        <Link href="/hr">
          <Button
            variant="outline"
            style={{
              borderColor: "#1E2D45",
              color: "#A0A0B0",
            }}
          >
            ← Back to HR
          </Button>
        </Link>
      </div>
    );
  }

  const { job, interviewPrepLink } = data;
  const colColor = COLUMN_COLORS[job.column] || "#64748B";

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#080C16",
        padding: "24px",
      }}
    >
      <style>{`
        @media (max-width: 768px) {
          .info-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Back Button */}
      <Link href="/hr" style={{ textDecoration: "none" }}>
        <Button
          variant="ghost"
          style={{
            background: "transparent",
            border: "1px solid #1E2D45",
            color: "#A0A0B0",
            marginBottom: "20px",
            padding: "8px 16px",
          }}
        >
          <ArrowLeft size={16} style={{ marginRight: "8px" }} />
          HR
        </Button>
      </Link>

      {/* Header - Compact with key metrics */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {/* Main row: Company + Role + Status */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: "var(--font-syne, Syne, sans-serif)",
                fontSize: "24px",
                fontWeight: 700,
                color: "#F0F0F5",
                marginBottom: "4px",
                lineHeight: 1.2,
              }}
            >
              {job.company}
            </h1>
            <p
              style={{
                fontSize: "14px",
                color: "#8888A0",
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              }}
            >
              {job.role}
            </p>
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            <StatusBadge status={job.column} />
            <AtsScoreBadge score={job.atsScore} />
          </div>
        </div>

        {/* Quick metrics row */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          {job.location && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#A0A0B0", fontSize: "12px" }}>
              <span style={{ opacity: 0.6 }}>📍</span> {job.location}
            </div>
          )}
          {job.salary && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#A0A0B0", fontSize: "12px" }}>
              <span style={{ opacity: 0.6 }}>💰</span> {job.salary}
            </div>
          )}
          {job.appliedDate && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#A0A0B0", fontSize: "12px" }}>
              <span style={{ opacity: 0.6 }}>📅</span> Applied {job.appliedDate}
            </div>
          )}
          {job.nextAction && (
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#F59E0B", fontSize: "12px", fontWeight: 500 }}>
              <span style={{ opacity: 0.6 }}>⚡</span> {job.nextAction}
            </div>
          )}
        </div>
      </div>

      {/* Info Cards - Single row, non-redundant */}
      <div
        className="info-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "16px",
          marginBottom: "32px",
        }}
      >
        {/* Card: Application Status */}
        <InfoCard title="Application Status" icon={<Clock size={16} />}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <DetailRow label="Status" value={COLUMN_LABELS[job.column] || job.status} />
            <DetailRow label="Applied" value={job.appliedDate || "—"} />
            <DetailRow label="Last Updated" value={job.updatedAt ? new Date(job.updatedAt).toLocaleDateString("en-GB") : "—"} />
            <DetailRow label="Source" value={data.source === "goals" ? "GOALS.md" : "Database"} />
          </div>
        </InfoCard>

        {/* Card 3: CV Match */}
        <InfoCard title="CV Match" icon={<FileText size={16} />}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ color: "#8888A0", fontSize: "13px" }}>ATS Score</span>
              <AtsScoreBadge score={job.atsScore} />
            </div>
            {job.cvHistory.length > 0 ? (
              <div>
                <div style={{ color: "#34D399", fontSize: "13px", marginBottom: "8px" }}>
                  ✓ CV Generated
                </div>
                {job.cvHistory[0].filePath && (
                  <a
                    href={`/api/cvs/view?path=${encodeURIComponent(job.cvHistory[0].filePath)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 12px",
                      background: "rgba(79, 142, 247, 0.15)",
                      border: "1px solid rgba(79, 142, 247, 0.3)",
                      borderRadius: "6px",
                      color: "#4F8EF7",
                      fontSize: "12px",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    <ExternalLink size={12} />
                    View CV
                  </a>
                )}
              </div>
            ) : (
              <div style={{ color: "#8888A0", fontSize: "13px" }}>No CV generated yet</div>
            )}
          </div>
        </InfoCard>

        {/* Card 4: Interview Prep */}
        <InfoCard title="Interview Prep" icon={<Target size={16} />}>
          {interviewPrepLink ? (
            <a
              href={interviewPrepLink}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "12px",
                background: "rgba(245, 158, 11, 0.15)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                borderRadius: "8px",
                color: "#F59E0B",
                fontSize: "13px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              <TrendingUp size={16} />
              View Interview Prep Protocol
            </a>
          ) : (
            <div style={{ color: "#8888A0", fontSize: "13px" }}>No prep protocol available</div>
          )}
        </InfoCard>
      </div>

      {/* JD Link */}
      {job.jdLink && (
        <div
          style={{
            background: "#0D1220",
            border: "1px solid #1E2D45",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "32px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
            <ExternalLink size={16} color="#4F8EF7" />
            <span style={{ color: "#A0A0B0", fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>
              Job Posting
            </span>
          </div>
          <a
            href={job.jdLink}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "block",
              padding: "12px 16px",
              background: "rgba(79, 142, 247, 0.12)",
              border: "1px solid rgba(79, 142, 247, 0.25)",
              borderRadius: "8px",
              color: "#4F8EF7",
              fontSize: "13px",
              textDecoration: "none",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {job.jdLink}
          </a>
        </div>
      )}

      {/* Timeline Section */}
      {job.interviewNotes.length > 0 && (
        <div
          style={{
            background: "#0D1220",
            border: "1px solid #1E2D45",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "32px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-syne, Syne, sans-serif)",
              fontSize: "16px",
              fontWeight: 700,
              color: "#F0F0F5",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              justifyContent: "space-between",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Calendar size={18} color="#A0A0B0" />
              Activity Timeline
            </span>
            {job.interviewNotes.length > 3 && (
              <button
                onClick={() => setShowAllNotes((v) => !v)}
                style={{
                  background: "transparent",
                  border: "1px solid #1E2D45",
                  borderRadius: "999px",
                  padding: "4px 10px",
                  fontSize: "11px",
                  color: "#A0A0B0",
                  cursor: "pointer",
                }}
              >
                {showAllNotes ? "Show less" : `Show all (${job.interviewNotes.length})`}
              </button>
            )}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {(showAllNotes ? job.interviewNotes : job.interviewNotes.slice(0, 3)).map((note, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  gap: "12px",
                  padding: "12px",
                  background: "#080C16",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    fontSize: "11px",
                    color: "#64748B",
                    fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {note.date}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: "#A0A0B0",
                    lineHeight: 1.5,
                  }}
                >
                  {note.excerpt}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes from GOALS.md (if any) */}
      {job.notes && (
        <div
          style={{
            background: "#0D1220",
            border: "1px solid #1E2D45",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h2
            style={{
              fontFamily: "var(--font-syne, Syne, sans-serif)",
              fontSize: "16px",
              fontWeight: 700,
              color: "#F0F0F5",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FileText size={18} color="#A0A0B0" />
            Notes
          </h2>
          <p
            style={{
              fontSize: "14px",
              color: "#A0A0B0",
              lineHeight: 1.6,
            }}
          >
            {job.notes}
          </p>
        </div>
      )}
    </div>
  );
}

function DetailRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "12px",
      }}
    >
      <span
        style={{
          color: "#8888A0",
          fontSize: "13px",
          fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          color: highlight ? "#F59E0B" : "#F0F0F5",
          fontSize: "13px",
          fontWeight: highlight ? 600 : 400,
          textAlign: "right",
          fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
        }}
      >
        {value}
      </span>
    </div>
  );
}
