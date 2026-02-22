"use client";

import { useEffect, useState } from "react";

interface CVHistoryEntry {
  id: number;
  company: string;
  role: string;
  atsScore: number | null;
  date: string;
  outcome: string;
}

interface CVHistoryResponse {
  history: CVHistoryEntry[];
}

/** Format ISO date string as "21 Feb 2026" in Cairo timezone */
function formatDateCairo(dateStr: string): string {
  try {
    const date = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T12:00:00Z`);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Africa/Cairo",
    });
  } catch {
    return dateStr;
  }
}

function AtsCell({ score }: { score: number | null }) {
  if (score == null) {
    return (
      <span
        style={{
          fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
          fontSize: "12px",
          color: "#555570",
        }}
      >
        —
      </span>
    );
  }
  const color =
    score >= 85 ? "#34D399" : score >= 70 ? "#F59E0B" : "#F87171";
  return (
    <span
      style={{
        fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
        fontSize: "12px",
        color,
        fontWeight: 700,
      }}
    >
      {score}%
    </span>
  );
}

const OUTCOME_STYLES: Record<
  string,
  { color: string; bg: string; border: string }
> = {
  Submitted: { color: "#4F8EF7", bg: "rgba(79,142,247,0.12)", border: "rgba(79,142,247,0.3)" },
  Interview: { color: "#A78BFA", bg: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.3)" },
  Offered:   { color: "#34D399", bg: "rgba(5,150,105,0.12)",  border: "rgba(52,211,153,0.3)" },
  Rejected:  { color: "#F87171", bg: "rgba(239,68,68,0.10)",  border: "rgba(248,113,113,0.3)" },
  Pending:   { color: "#8888A0", bg: "rgba(136,136,160,0.10)", border: "rgba(136,136,160,0.25)" },
};

function OutcomeBadge({ outcome }: { outcome: string }) {
  const style = OUTCOME_STYLES[outcome] ?? OUTCOME_STYLES.Pending;
  return (
    <span
      style={{
        fontSize: "11px",
        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
        fontWeight: 600,
        color: style.color,
        background: style.bg,
        border: `1px solid ${style.border}`,
        borderRadius: "20px",
        padding: "3px 10px",
        whiteSpace: "nowrap",
      }}
    >
      {outcome}
    </span>
  );
}

export default function CVHistoryTable() {
  const [data, setData] = useState<CVHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/hr/cv-history")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <div
      style={{
        background: "#0D1220",
        border: "1px solid #1E2D45",
        borderRadius: "10px",
        overflow: "hidden",
        marginBottom: "20px",
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
            fontSize: "15px",
            fontWeight: 700,
            color: "#F0F0F5",
            letterSpacing: "-0.02em",
          }}
        >
          CV History
        </span>
        {!loading && data && (
          <span
            style={{
              fontSize: "11px",
              color: "#555570",
              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            }}
          >
            {data.history.length} entries
          </span>
        )}
      </div>

      {/* Body */}
      {loading ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "#555570",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            fontSize: "13px",
          }}
        >
          Loading CV history…
        </div>
      ) : error ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "#F87171",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            fontSize: "13px",
          }}
        >
          Failed to load CV history
        </div>
      ) : !data || data.history.length === 0 ? (
        <div
          style={{
            padding: "40px",
            textAlign: "center",
            color: "#555570",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            fontSize: "13px",
          }}
        >
          No CV submissions yet
        </div>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              fontSize: "13px",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#080C16",
                  borderBottom: "1px solid #1E2D45",
                }}
              >
                {["Company", "Role", "ATS Score", "Date", "Outcome"].map(
                  (header) => (
                    <th
                      key={header}
                      style={{
                        padding: "10px 16px",
                        textAlign: "left",
                        fontSize: "11px",
                        fontWeight: 600,
                        color: "#555570",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {data.history.map((entry, idx) => (
                <tr
                  key={entry.id}
                  style={{
                    background: idx % 2 === 0 ? "#0D1220" : "#080C16",
                    borderBottom:
                      idx < data.history.length - 1
                        ? "1px solid #1E2D4530"
                        : "none",
                  }}
                >
                  {/* Company */}
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#F0F0F5",
                      fontWeight: 600,
                    }}
                  >
                    {entry.company}
                  </td>

                  {/* Role */}
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#8888A0",
                      maxWidth: "260px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={entry.role}
                  >
                    {entry.role}
                  </td>

                  {/* ATS Score */}
                  <td style={{ padding: "12px 16px" }}>
                    <AtsCell score={entry.atsScore} />
                  </td>

                  {/* Date (Cairo TZ) */}
                  <td
                    style={{
                      padding: "12px 16px",
                      color: "#8888A0",
                      fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                      fontSize: "12px",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {formatDateCairo(entry.date)}
                  </td>

                  {/* Outcome */}
                  <td style={{ padding: "12px 16px" }}>
                    <OutcomeBadge outcome={entry.outcome} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
