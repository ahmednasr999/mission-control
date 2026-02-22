"use client";

import { useState } from "react";
import FilterBar, { type FilterState } from "@/components/ops/FilterBar";
import OpsKanban from "@/components/ops/OpsKanban";
import OpsArchive from "@/components/ops/OpsArchive";

const DEFAULT_FILTERS: FilterState = {
  assignee: "All",
  priority: "All",
  category: "All",
  blockersOnly: false,
};

export default function OpsPage() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  return (
    <>
      <style>{`
        @media (max-width: 600px) {
          .ops-page { padding: 16px !important; }
          .ops-filter-bar { overflow-x: auto; }
        }
      `}</style>
      <div className="ops-page" style={{ padding: "32px", maxWidth: "100%" }}>
        {/* Filter bar */}
        <FilterBar filters={filters} onChange={setFilters} />

        {/* Kanban board */}
        <OpsKanban filters={filters} />

        {/* Archive section */}
        <OpsArchive />
      </div>
    </>
  );
}
