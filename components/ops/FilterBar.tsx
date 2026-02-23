"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// ---- Types ----

export type AssigneeFilter =
  | "All"
  | "Ahmed"
  | "NASR"
  | "ADHAM"
  | "HEIKAL"
  | "MAHER"
  | "LOTFI"
  | "Unassigned";

export type PriorityFilter = "All" | "high" | "medium" | "low";

export type CategoryFilter =
  | "All"
  | "Job Search"
  | "Content"
  | "Networking"
  | "Applications"
  | "Interviews"
  | "Task"
  | "System";

export interface FilterState {
  assignee: AssigneeFilter;
  priority: PriorityFilter;
  category: CategoryFilter;
  /** Phase 2: Show only tasks with blockers set */
  blockersOnly: boolean;
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

// ---- Pill button ----

interface PillProps {
  label: string;
  active: boolean;
  onClick: () => void;
  color?: string;
}

function Pill({ label, active, onClick, color }: PillProps) {
  const [hovered, setHovered] = useState(false);
  const accentColor = color || "#4F8EF7";

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: active
          ? `${accentColor}20`
          : hovered
          ? "rgba(255,255,255,0.04)"
          : "transparent",
        border: active
          ? `1px solid ${accentColor}60`
          : "1px solid #1E2D45",
        borderRadius: "20px",
        padding: "4px 12px",
        cursor: "pointer",
        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
        fontSize: "12px",
        fontWeight: active ? 700 : 500,
        color: active ? accentColor : "#8888A0",
        transition: "all 0.12s ease",
        whiteSpace: "nowrap",
        boxShadow: active ? `0 0 8px ${accentColor}25` : "none",
      }}
    >
      {label}
    </button>
  );
}

// ---- Dropdown ----

interface DropdownProps {
  value: string;
  options: string[];
  onChange: (val: string) => void;
}

function Dropdown({ value, options, onChange }: DropdownProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        background: "#0D1220",
        border: "1px solid #1E2D45",
        borderRadius: "20px",
        padding: "4px 10px 4px 12px",
        color: value === "All" ? "#8888A0" : "#F0F0F5",
        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
        fontSize: "12px",
        fontWeight: 500,
        cursor: "pointer",
        outline: "none",
        appearance: "auto",
      }}
    >
      {options.map((opt) => (
        <option key={opt} value={opt} style={{ background: "#0D1220", color: "#F0F0F5" }}>
          {opt}
        </option>
      ))}
    </select>
  );
}

// ---- Main FilterBar ----

const ASSIGNEES: AssigneeFilter[] = [
  "All",
  "Ahmed",
  "NASR",
  "ADHAM",
  "HEIKAL",
  "MAHER",
  "LOTFI",
  "Unassigned",
];

const PRIORITIES: { label: string; value: PriorityFilter; color: string }[] = [
  { label: "All", value: "All", color: "#4F8EF7" },
  { label: "🔴 High", value: "high", color: "#F87171" },
  { label: "🟡 Medium", value: "medium", color: "#FBBF24" },
  { label: "🟢 Low", value: "low", color: "#34D399" },
];

const CATEGORIES: CategoryFilter[] = [
  "All",
  "Job Search",
  "Content",
  "Networking",
  "Applications",
  "Interviews",
  "Task",
  "System",
];

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  return (
    <Card className="mb-4" style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px", padding: "12px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
        <span
          style={{
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            fontSize: "11px",
            fontWeight: 600,
            color: "#A0A0B0",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            minWidth: "64px",
          }}
        >
          Assignee
        </span>
        {ASSIGNEES.map((a) => (
          <Pill
            key={a}
            label={a}
            active={filters.assignee === a}
            onClick={() => onChange({ ...filters, assignee: a })}
          />
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap", marginTop: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span
            style={{
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              fontSize: "11px",
              fontWeight: 600,
              color: "#A0A0B0",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              minWidth: "64px",
            }}
          >
            Priority
          </span>
          {PRIORITIES.map((p) => (
            <Pill
              key={p.value}
              label={p.label}
              active={filters.priority === p.value}
              onClick={() => onChange({ ...filters, priority: p.value })}
              color={p.color}
            />
          ))}
        </div>

        <div
          style={{
            width: "1px",
            height: "24px",
            background: "#1E2D45",
            flexShrink: 0,
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              fontSize: "11px",
              fontWeight: 600,
              color: "#A0A0B0",
              letterSpacing: "0.05em",
              textTransform: "uppercase",
            }}
          >
            Category
          </span>
          <Dropdown
            value={filters.category}
            options={CATEGORIES}
            onChange={(val) => onChange({ ...filters, category: val as CategoryFilter })}
          />
        </div>

        <div style={{ width: "1px", height: "24px", background: "#1E2D45", flexShrink: 0 }} />

        <Pill
          label="🚫 Blockers Only"
          active={filters.blockersOnly}
          onClick={() => onChange({ ...filters, blockersOnly: !filters.blockersOnly })}
          color="#FB923C"
        />
      </div>
    </Card>
  );
}
