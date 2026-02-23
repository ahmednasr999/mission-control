"use client";

import { useEffect, useState } from "react";
import type { ContentItem } from "@/lib/marketing-db";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface PipelineResponse {
  columns: {
    ideas: ContentItem[];
    draft: ContentItem[];
    review: ContentItem[];
    scheduled: ContentItem[];
    published: ContentItem[];
  };
}

export default function MarketingMetrics() {
  const [data, setData] = useState<PipelineResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/marketing/pipeline")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#A0A0B0" }}>
        Loading metrics...
      </div>
    );
  }

  const ideas = data?.columns.ideas.length || 0;
  const drafts = data?.columns.draft.length || 0;
  const reviews = data?.columns.review.length || 0;
  const scheduled = data?.columns.scheduled.length || 0;
  const published = data?.columns.published.length || 0;
  const total = ideas + drafts + reviews + scheduled + published;

  const metrics = [
    {
      label: "Total Content",
      value: total,
      color: "#4F8EF7",
      bg: "rgba(79, 142, 247, 0.15)",
    },
    {
      label: "Ideas",
      value: ideas,
      color: "#3B82F6",
      bg: "rgba(59, 130, 246, 0.15)",
    },
    {
      label: "In Draft",
      value: drafts,
      color: "#8B5CF6",
      bg: "rgba(139, 92, 246, 0.15)",
    },
    {
      label: "In Review",
      value: reviews,
      color: "#F59E0B",
      bg: "rgba(245, 158, 11, 0.15)",
    },
    {
      label: "Scheduled",
      value: scheduled,
      color: "#22D3EE",
      bg: "rgba(34, 211, 238, 0.15)",
    },
    {
      label: "Published",
      value: published,
      color: "#34D399",
      bg: "rgba(52, 211, 153, 0.15)",
    },
  ];

  const conversionRate = total > 0 ? Math.round((published / total) * 100) : 0;
  const publishRate = (drafts + reviews + scheduled) > 0 
    ? Math.round((published / (drafts + reviews + scheduled)) * 100) 
    : 0;

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "16px",
          marginBottom: "24px",
        }}
      >
        {metrics.map((m) => (
          <Card
            key={m.label}
            style={{
              background: "#0D1220",
              border: "1px solid #1E2D45",
              borderRadius: "10px",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "32px",
                fontWeight: 700,
                color: m.color,
                marginBottom: "8px",
              }}
            >
              {m.value}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#A0A0B0",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {m.label}
            </div>
          </Card>
        ))}
      </div>

      <Card
        style={{
          background: "#0D1220",
          border: "1px solid #1E2D45",
          borderRadius: "10px",
          padding: "24px",
          marginBottom: "24px",
        }}
      >
        <CardHeader className="pb-4" style={{ padding: 0, marginBottom: "20px" }}>
          <CardTitle className="text-sm font-semibold" style={{ fontSize: "14px", fontWeight: 600, color: "#F0F0F5" }}>
            Pipeline Conversion
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  marginBottom: "4px",
                }}
              >
                <span style={{ color: "#A0A0B0" }}>Ideas → Draft</span>
                <span style={{ color: "#F0F0F5" }}>{ideas > 0 ? Math.round((drafts / ideas) * 100) : 0}%</span>
              </div>
              <div
                style={{
                  height: "8px",
                  background: "#1E2D45",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${ideas > 0 ? (drafts / ideas) * 100 : 0}%`,
                    background: "linear-gradient(90deg, #3B82F6, #8B5CF6)",
                    borderRadius: "4px",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  marginBottom: "4px",
                }}
              >
                <span style={{ color: "#A0A0B0" }}>Draft → Review</span>
                <span style={{ color: "#F0F0F5" }}>{drafts > 0 ? Math.round((reviews / drafts) * 100) : 0}%</span>
              </div>
              <div
                style={{
                  height: "8px",
                  background: "#1E2D45",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${drafts > 0 ? (reviews / drafts) * 100 : 0}%`,
                    background: "linear-gradient(90deg, #8B5CF6, #F59E0B)",
                    borderRadius: "4px",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  marginBottom: "4px",
                }}
              >
                <span style={{ color: "#A0A0B0" }}>Review → Scheduled</span>
                <span style={{ color: "#F0F0F5" }}>{reviews > 0 ? Math.round((scheduled / reviews) * 100) : 0}%</span>
              </div>
              <div
                style={{
                  height: "8px",
                  background: "#1E2D45",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${reviews > 0 ? (scheduled / reviews) * 100 : 0}%`,
                    background: "linear-gradient(90deg, #F59E0B, #22D3EE)",
                    borderRadius: "4px",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>

            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "12px",
                  marginBottom: "4px",
                }}
              >
                <span style={{ color: "#A0A0B0" }}>Scheduled → Published</span>
                <span style={{ color: "#F0F0F5" }}>{scheduled > 0 ? Math.round((published / scheduled) * 100) : 0}%</span>
              </div>
              <div
                style={{
                  height: "8px",
                  background: "#1E2D45",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    width: `${scheduled > 0 ? (published / scheduled) * 100 : 0}%`,
                    background: "linear-gradient(90deg, #22D3EE, #34D399)",
                    borderRadius: "4px",
                    transition: "width 0.5s ease",
                  }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        <Card
          style={{
            background: "#0D1220",
            border: "1px solid #1E2D45",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#A0A0B0", marginBottom: "8px" }}>
            Total Conversion Rate
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#34D399" }}>
            {conversionRate}%
          </div>
          <div style={{ fontSize: "11px", color: "#A0A0B0", marginTop: "4px" }}>
            Ideas → Published
          </div>
        </Card>

        <Card
          style={{
            background: "#0D1220",
            border: "1px solid #1E2D45",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#A0A0B0", marginBottom: "8px" }}>
            Work in Progress
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#F59E0B" }}>
            {drafts + reviews + scheduled}
          </div>
          <div style={{ fontSize: "11px", color: "#A0A0B0", marginTop: "4px" }}>
            Draft + Review + Scheduled
          </div>
        </Card>

        <Card
          style={{
            background: "#0D1220",
            border: "1px solid #1E2D45",
            borderRadius: "10px",
            padding: "20px",
          }}
        >
          <div style={{ fontSize: "12px", color: "#A0A0B0", marginBottom: "8px" }}>
            Pipeline Velocity
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, color: "#4F8EF7" }}>
            {publishRate}%
          </div>
          <div style={{ fontSize: "11px", color: "#A0A0B0", marginTop: "4px" }}>
            Published / (Draft+Review+Scheduled)
          </div>
        </Card>
      </div>
    </div>
  );
}
