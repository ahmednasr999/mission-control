"use client";

interface Job {
  company: string;
  role: string;
  status: string;
  atsScore: number | null;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Applied: { bg: "rgba(79, 142, 247, 0.15)", text: "#4F8EF7" },
  Interview: { bg: "rgba(124, 58, 237, 0.15)", text: "#A78BFA" },
  Offer: { bg: "rgba(5, 150, 105, 0.15)", text: "#34D399" },
  Rejected: { bg: "rgba(239, 68, 68, 0.12)", text: "#F87171" },
  Screening: { bg: "rgba(217, 119, 6, 0.15)", text: "#FBBF24" },
};

function normalizeStatus(s: string): string {
  const lower = (s || "").toLowerCase();
  if (lower.includes("interview")) return "Interview";
  if (lower.includes("offer")) return "Offer";
  if (lower.includes("reject")) return "Rejected";
  if (lower.includes("screen")) return "Screening";
  return "Applied";
}

function AtsScoreBadge({ score }: { score: number | null }) {
  if (score == null) return null;
  const color =
    score >= 85 ? "#34D399" : score >= 70 ? "#FBBF24" : "#F87171";
  return (
    <span
      style={{
        fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
        fontSize: "10px",
        color,
        background: `${color}20`,
        border: `1px solid ${color}40`,
        borderRadius: "4px",
        padding: "2px 6px",
        whiteSpace: "nowrap",
      }}
    >
      ATS {score}%
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const normalized = normalizeStatus(status);
  const colors = STATUS_COLORS[normalized] || {
    bg: "rgba(136, 136, 160, 0.15)",
    text: "#8888A0",
  };
  return (
    <span
      style={{
        fontSize: "10px",
        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
        fontWeight: 600,
        color: colors.text,
        background: colors.bg,
        borderRadius: "4px",
        padding: "2px 7px",
        whiteSpace: "nowrap",
      }}
    >
      {normalized}
    </span>
  );
}

interface PipelinePreviewProps {
  jobs: Job[];
  loading?: boolean;
}

export default function PipelinePreview({ jobs, loading }: PipelinePreviewProps) {
  return (
    <div
      style={{
        background: "#0D1220",
        border: "1px solid #1E2D45",
        borderRadius: "10px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px 14px",
          borderBottom: "1px solid #1E2D45",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
          Job Pipeline
        </span>
        <span
          style={{
            fontSize: "11px",
            color: "#A0A0B0",
            fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
          }}
        >
          TOP 4
        </span>
      </div>

      {/* Jobs list */}
      <div style={{ flex: 1 }}>
        {loading ? (
          <EmptyState message="Loading…" />
        ) : !jobs || jobs.length === 0 ? (
          <EmptyState message="No active applications yet" />
        ) : (
          jobs.slice(0, 4).map((job, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "11px 20px",
                borderBottom: i < Math.min(jobs.length, 4) - 1 ? "1px solid #1E2D45" : "none",
              }}
            >
              {/* Company initial avatar */}
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "6px",
                  background: "linear-gradient(135deg, #4F8EF720, #7C3AED20)",
                  border: "1px solid #1E2D45",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "#8888A0",
                  fontFamily: "var(--font-syne, Syne, sans-serif)",
                  flexShrink: 0,
                }}
              >
                {(job.company || "?")[0].toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                    fontSize: "13px",
                    color: "#F0F0F5",
                    fontWeight: 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={`${job.company} — ${job.role}`}
                >
                  {job.company}
                </div>
                <div
                  style={{
                    fontSize: "11px",
                    color: "#8888A0",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginTop: "1px",
                  }}
                >
                  {job.role}
                </div>
              </div>

              <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
                <StatusBadge status={job.status} />
                <AtsScoreBadge score={job.atsScore} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: "32px 20px",
        textAlign: "center",
        color: "#A0A0B0",
        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
        fontSize: "13px",
      }}
    >
      {message}
    </div>
  );
}
