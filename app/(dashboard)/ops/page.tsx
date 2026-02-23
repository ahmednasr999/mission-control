"use client";

import { useState } from "react";
import FilterBar, { type FilterState } from "@/components/ops/FilterBar";
import OpsKanban from "@/components/ops/OpsKanban";
import OpsArchive from "@/components/ops/OpsArchive";
import OpsCalendar from "@/components/ops/OpsCalendar";
import OpsMetrics from "@/components/ops/OpsMetrics";

const DEFAULT_FILTERS: FilterState = {
  assignee: "All",
  priority: "All",
  category: "All",
  blockersOnly: false,
};

type Tab = "kanban" | "calendar" | "metrics";

export default function OpsPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [activeTab, setActiveTab] = useState<Tab>("kanban");

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "kanban", label: "Board", icon: "📋" },
    { key: "calendar", label: "Calendar", icon: "📅" },
    { key: "metrics", label: "Metrics", icon: "📊" },
  ];

  return (
    <>
      <style>{`
        @media (max-width: 600px) {
          .ops-page { padding: 16px !important; }
          .ops-filter-bar { overflow-x: auto; }
        }
      `}</style>
      <div className="ops-page" style={{ padding: "24px 32px 40px", maxWidth: "100%" }}>
        {/* Header */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{ fontFamily: "var(--font-syne, Syne, sans-serif)", fontSize: "20px", fontWeight: 700, color: "#F0F0F5", marginBottom: "8px" }}>
            OPS
          </h1>
          <p style={{ fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)", fontSize: "13px", color: "#A0A0B0" }}>
            Task management, tracking, and progress
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px", borderBottom: "1px solid #1E2D45", paddingBottom: "12px" }}>
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

        {/* Content */}
        {activeTab === "kanban" && (
          <>
            <FilterBar filters={filters} onChange={setFilters} />
            <OpsKanban filters={filters} />
            <div style={{ marginTop: "24px" }}>
              <OpsArchive />
            </div>
          </>
        )}

        {activeTab === "calendar" && <OpsCalendar />}

        {activeTab === "metrics" && <OpsMetrics />}
      </div>
    </>
  );
}
