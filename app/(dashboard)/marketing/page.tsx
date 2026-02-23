"use client";

import { useState } from "react";
import MarketingKanban from "@/components/marketing/MarketingKanban";
import MarketingArchive from "@/components/marketing/MarketingArchive";
import MarketingCalendar from "@/components/marketing/MarketingCalendar";
import MarketingMetrics from "@/components/marketing/MarketingMetrics";

type Tab = "kanban" | "calendar" | "metrics";

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<Tab>("kanban");

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "kanban", label: "Pipeline", icon: "📋" },
    { key: "calendar", label: "Calendar", icon: "📅" },
    { key: "metrics", label: "Metrics", icon: "📊" },
  ];

  return (
    <div style={{ padding: "24px 32px 40px" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "20px",
            fontWeight: 700,
            color: "#F0F0F5",
            marginBottom: "8px",
          }}
        >
          Marketing
        </h1>
        <p
          style={{
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            fontSize: "13px",
            color: "#A0A0B0",
          }}
        >
          Content pipeline, scheduling, and performance
        </p>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "24px",
          borderBottom: "1px solid #1E2D45",
          paddingBottom: "12px",
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 16px",
              background: activeTab === tab.key ? "rgba(79, 142, 247, 0.15)" : "transparent",
              border: "none",
              borderRadius: "8px",
              color: activeTab === tab.key ? "#4F8EF7" : "#8888A0",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content based on active tab */}
      {activeTab === "kanban" && (
        <>
          <MarketingKanban />
          <div style={{ marginTop: "24px" }}>
            <MarketingArchive />
          </div>
        </>
      )}

      {activeTab === "calendar" && <MarketingCalendar />}

      {activeTab === "metrics" && <MarketingMetrics />}
    </div>
  );
}
