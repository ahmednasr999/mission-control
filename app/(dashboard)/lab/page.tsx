"use client";

import IdeasPanel from "@/components/lab/IdeasPanel";
import ToolsRadar from "@/components/lab/ToolsRadar";
import InsightsPanel from "@/components/lab/InsightsPanel";
import LessonsLog from "@/components/lab/LessonsLog";

export default function LabPage() {
  return (
    <div
      style={{
        padding: "24px 28px",
        minHeight: "100vh",
        background: "#080C16",
        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
      }}
    >
      {/* Two-column layout */}
      <div
        style={{
          display: "flex",
          gap: "20px",
          alignItems: "flex-start",
        }}
      >
        {/* LEFT COLUMN — 55% */}
        <div
          style={{
            flex: "0 0 55%",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {/* 1. Ideas & Recommendations */}
          <IdeasPanel />

          {/* 2. Tools Radar */}
          <ToolsRadar />
        </div>

        {/* RIGHT COLUMN — 45% */}
        <div
          style={{
            flex: "0 0 calc(45% - 20px)",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {/* 3. What's Working / What Went Wrong */}
          <InsightsPanel />

          {/* 4. Lessons Learned Log */}
          <LessonsLog />
        </div>
      </div>
    </div>
  );
}
