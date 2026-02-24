"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ActivityEntry {
  date: string;
  file: string;
  content: string;
}

interface ContentDetail {
  id: number;
  title: string;
  pillar: string;
  stage: string;
  wordCount: number | null;
  scheduledDate: string | null;
  publishedDate: string | null;
  performance: string | null;
  notes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  filePath: string | null;
  activity: ActivityEntry[];
}

const STAGE_COLORS: Record<string, { bg: string; color: string; border: string }> = {
  ideas: { bg: "rgba(148, 163, 184, 0.15)", color: "#94A3B8", border: "#94A3B840" },
  draft: { bg: "rgba(59, 130, 246, 0.15)", color: "#3B82F6", border: "#3B82F640" },
  review: { bg: "rgba(245, 158, 11, 0.15)", color: "#F59E0B", border: "#F59E0B40" },
  published: { bg: "rgba(34, 197, 94, 0.15)", color: "#22C55E", border: "#22C55E40" },
};

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

function getStageLabel(stage: string): string {
  const labels: Record<string, string> = {
    ideas: "Ideas",
    draft: "Draft",
    review: "Review",
    scheduled: "Scheduled",
    published: "Published",
  };
  return labels[stage] || stage;
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px", flex: 1, minWidth: "200px" }}>
      <CardContent className="p-4">
        <div style={{ fontSize: "11px", fontWeight: 600, color: "#A0A0B0", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          {title}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
      <span style={{ fontSize: "12px", color: "#8888A0" }}>{label}</span>
      <span style={{ fontSize: "12px", color: "#F0F0F5", fontWeight: 500 }}>{value}</span>
    </div>
  );
}

export default function ContentDetailPage({ params }: { params: Promise<{ contentId: string }> }) {
  const router = useRouter();
  const [data, setData] = useState<ContentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [contentId, setContentId] = useState<string>("");

  useEffect(() => {
    params.then(p => {
      setContentId(p.contentId);
      fetch(`/api/marketing/content/${p.contentId}`)
        .then(r => r.json())
        .then(d => {
          setData(d);
          setLoading(false);
        })
        .catch(() => {
          setError(true);
          setLoading(false);
        });
    });
  }, [params]);

  const handleBack = () => {
    router.push("/marketing");
  };

  if (loading) {
    return (
      <div style={{ padding: "24px 32px", background: "#080C16", minHeight: "100vh" }}>
        <div style={{ color: "#A0A0B0", fontSize: "14px", textAlign: "center", paddingTop: "48px" }}>
          Loading content...
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: "24px 32px", background: "#080C16", minHeight: "100vh" }}>
        <button
          onClick={handleBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "none",
            border: "none",
            color: "#4F8EF7",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: "24px",
            padding: 0,
          }}
        >
          ← Back to Marketing
        </button>
        <div style={{ color: "#F87171", fontSize: "14px", textAlign: "center", paddingTop: "48px" }}>
          Failed to load content
        </div>
      </div>
    );
  }

  const stageColors = STAGE_COLORS[data.stage] || STAGE_COLORS.ideas;
  const pillarColor = getPillarColor(data.pillar);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const getNextAction = () => {
    const actions: Record<string, { label: string; color: string }> = {
      ideas: { label: "Move to Draft", color: "#3B82F6" },
      draft: { label: "Send to Review", color: "#F59E0B" },
      review: { label: "Schedule for Publishing", color: "#22D3EE" },
      published: { label: "Plan follow-up", color: "#8B5CF6" },
    };
    return actions[data.stage] || null;
  };

  const nextAction = getNextAction();

  return (
    <div style={{ padding: "24px 32px 40px", background: "#080C16", minHeight: "100vh" }}>
      <style>{`
        @media (max-width: 768px) {
          .info-cards-row {
            flex-direction: column !important;
          }
          .info-cards-row > * {
            min-width: 100% !important;
          }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <button
          onClick={handleBack}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "none",
            border: "none",
            color: "#4F8EF7",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: "16px",
            padding: 0,
          }}
        >
          ← MARKETING
        </button>

        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
          <h1
            style={{
              fontFamily: "var(--font-syne, Syne, sans-serif)",
              fontSize: "24px",
              fontWeight: 700,
              color: "#F0F0F5",
              flex: 1,
              lineHeight: 1.3,
            }}
          >
            {data.title}
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Badge
              style={{
                fontSize: "11px",
                background: stageColors.bg,
                color: stageColors.color,
                border: `1px solid ${stageColors.border}`,
                borderRadius: "4px",
                fontWeight: 600,
              }}
            >
              {getStageLabel(data.stage)}
            </Badge>
            {data.pillar && (
              <Badge
                style={{
                  fontSize: "11px",
                  background: `${pillarColor}18`,
                  color: pillarColor,
                  border: `1px solid ${pillarColor}40`,
                  borderRadius: "4px",
                }}
              >
                {data.pillar}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Info Cards */}
      <div className="info-cards-row" style={{ display: "flex", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
        <InfoCard title="Content Info">
          <InfoRow label="Word Count" value={data.wordCount?.toString() || "—"} />
          <InfoRow label="Pillar" value={data.pillar || "—"} />
          <InfoRow label="Stage" value={getStageLabel(data.stage)} />
          <InfoRow label="Created" value={formatDate(data.createdAt)} />
        </InfoCard>

        <InfoCard title="Schedule & Performance">
          <InfoRow label="Scheduled" value={formatDate(data.scheduledDate)} />
          <InfoRow label="Published" value={formatDate(data.publishedDate)} />
          <InfoRow label="Performance" value={data.performance || "—"} />
        </InfoCard>

        <InfoCard title="Dates">
          <InfoRow label="Created" value={formatDate(data.createdAt)} />
          <InfoRow label="Updated" value={formatDate(data.updatedAt)} />
          <InfoRow label="Published" value={formatDate(data.publishedDate)} />
        </InfoCard>
      </div>

      {/* Editorial Notes */}
      {(data.notes || data.performance) && (
        <Card style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px", marginBottom: "24px" }}>
          <CardContent className="p-4">
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#A0A0B0", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Editorial Notes
            </div>
            <div style={{ fontSize: "13px", color: "#E0E0E8", lineHeight: 1.6 }}>
              {data.notes || data.performance || "No notes available"}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Activity Timeline */}
      {data.activity && data.activity.length > 0 && (
        <Card style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px", marginBottom: "24px" }}>
          <CardContent className="p-4">
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#A0A0B0", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Activity Timeline
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {data.activity.map((entry, idx) => (
                <div key={idx} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "50%",
                      background: "#4F8EF7",
                      marginTop: "6px",
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "11px", color: "#8888A0", marginBottom: "2px" }}>
                      {entry.date} • {entry.file}
                    </div>
                    <div style={{ fontSize: "12px", color: "#D0D0D8" }}>
                      {entry.content}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Actions */}
      {nextAction && (
        <Card style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px" }}>
          <CardContent className="p-4">
            <div style={{ fontSize: "11px", fontWeight: 600, color: "#A0A0B0", marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Suggested Next Action
            </div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                background: `${nextAction.color}15`,
                border: `1px solid ${nextAction.color}40`,
                borderRadius: "6px",
                color: nextAction.color,
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              {nextAction.label}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
