"use client";

import { useState } from "react";
import FilterBar, { type FilterState } from "@/components/ops/FilterBar";
import OpsKanban from "@/components/ops/OpsKanban";
import OpsArchive from "@/components/ops/OpsArchive";

const DEFAULT_FILTERS: FilterState = {
  assignee: "All",
  priority: "All",
  category: "All",
};

export default function OpsPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  return (
    <div style={{ padding: "32px", maxWidth: "100%" }}>
      {/* Page header */}
      <div style={{ marginBottom: "20px" }}>
        <h2
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "28px",
            fontWeight: 700,
            color: "#F0F0F5",
            letterSpacing: "-0.03em",
            marginBottom: "6px",
            margin: 0,
          }}
        >
          OPS
        </h2>
        <p
          style={{
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            fontSize: "13px",
            color: "#555570",
            marginTop: "6px",
            marginBottom: 0,
          }}
        >
          Tasks, operations, and workflow tracking
        </p>
      </div>

      {/* Filter bar */}
      <FilterBar filters={filters} onChange={setFilters} />

      {/* Kanban board */}
      <OpsKanban filters={filters} />

      {/* Archive section */}
      <OpsArchive />
    </div>
  );
}
