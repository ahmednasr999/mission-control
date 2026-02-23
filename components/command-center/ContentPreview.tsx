"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface ContentStages {
  ideas: number;
  draft: number;
  review: number;
  published: number;
}

interface StageColumnProps {
  label: string;
  count: number;
  color: string;
  bg: string;
  delay?: number;
}

function StageColumn({ label, count, color, bg }: StageColumnProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Count bubble */}
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: isHovered ? bg.replace("0.12", "0.25") : bg,
          border: `1.5px solid ${count > 0 ? color : "#1E2D45"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-syne, Syne, sans-serif)",
          fontSize: "16px",
          fontWeight: 600,
          color: count > 0 ? color : "#A0A0B0",
          boxShadow: count > 0 ? `0 ${isHovered ? "8px" : "2px"} ${isHovered ? "20px" : "8px"} ${color}${isHovered ? "40" : "20"}` : "none",
          transform: isHovered ? "scale(1.15)" : "scale(1)",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          cursor: "pointer",
        }}
      >
        {count}
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          fontSize: isHovered ? "16px" : "15px",
          color: count > 0 ? (isHovered ? "#F0F0F5" : "#E0E0E5") : "#8888A0",
          fontWeight: 600,
          textAlign: "center",
          marginTop: "4px",
          transition: "all 0.2s ease",
        }}
      >
        {label}
      </div>
    </div>
  );
}

interface ContentPreviewProps {
  stages: ContentStages | null;
  loading?: boolean;
}

const STAGES = [
  { key: "ideas" as keyof ContentStages, label: "Ideas", color: "#8888A0", bg: "rgba(136, 136, 160, 0.12)" },
  { key: "draft" as keyof ContentStages, label: "Draft", color: "#D97706", bg: "rgba(217, 119, 6, 0.12)" },
  { key: "review" as keyof ContentStages, label: "Review", color: "#7C3AED", bg: "rgba(124, 58, 237, 0.12)" },
  { key: "published" as keyof ContentStages, label: "Published", color: "#059669", bg: "rgba(5, 150, 105, 0.12)" },
];

export default function ContentPreview({ stages, loading }: ContentPreviewProps) {
  const data = stages || { ideas: 0, draft: 0, review: 0, published: 0 };
  const total = data.ideas + data.draft + data.review + data.published;

  return (
    <Card className="bg-[#0D1220] border-[#1E2D45] rounded-[10px] overflow-hidden">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .arrow-fade {
          animation: fadeIn 0.4s ease forwards;
          opacity: 0;
        }
      `}</style>

      <CardHeader className="pb-2" style={{ padding: "12px 16px 10px", borderBottom: "1px solid #1E2D45" }}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-[#F0F0F5]" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
            Content Pipeline
          </CardTitle>
          {!loading && stages && (
            <span style={{ fontSize: "11px", color: "#A0A0B0", fontFamily: "var(--font-dm-mono, DM Mono, monospace)" }}>
              {total} items
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent style={{ padding: "20px 16px" }}>
        {loading ? (
          <div style={{ textAlign: "center", color: "#A0A0B0", fontSize: "13px", fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)" }}>
            Loading…
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between" }}>
              {STAGES.map((stage, i) => (
                <div key={stage.key} style={{ display: "flex", alignItems: "center", flex: 1 }}>
                  <StageColumn label={stage.label} count={data[stage.key]} color={stage.color} bg={stage.bg} />
                  {i < STAGES.length - 1 && (
                    <div className="arrow-fade" style={{ fontSize: "16px", color: "#1E2D45", flexShrink: 0, margin: "0 -8px", paddingBottom: "24px", animationDelay: `${i * 100 + 200}ms` }}>
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid #1E2D45", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "15px", color: "#8888A0", fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)", fontWeight: 500 }}>
                Total pieces
              </span>
              <span style={{ fontSize: "18px", fontWeight: 800, fontFamily: "var(--font-syne, Syne, sans-serif)", color: "#F0F0F5" }}>
                {total}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
