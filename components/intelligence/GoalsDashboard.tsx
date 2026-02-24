"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";

interface Objective {
  text: string;
  done: boolean;
}

interface Category {
  name: string;
  objectives: Objective[];
  progress: number;
}

interface Metric {
  goal: string;
  metric: string;
  current: string;
  target: string;
}

interface GoalsData {
  categories: Category[];
  metrics: Metric[];
}

function progressColor(progress: number): string {
  if (progress >= 75) return "linear-gradient(90deg, #059669, #34D399)";
  if (progress >= 40) return "linear-gradient(90deg, #D97706, #FBBF24)";
  return "linear-gradient(90deg, #DC2626, #F87171)";
}

function textProgressColor(progress: number): string {
  if (progress >= 75) return "#34D399";
  if (progress >= 40) return "#FBBF24";
  return "#F87171";
}

function ProgressBar({ progress }: { progress: number }) {
  const clamped = Math.max(0, Math.min(100, progress));
  return (
    <div
      style={{
        height: "6px",
        borderRadius: "3px",
        background: "#1E2D45",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${clamped}%`,
          background: progressColor(progress),
          borderRadius: "3px",
          transition: "width 0.5s ease",
        }}
      />
    </div>
  );
}

function CategoryCard({ category, categoryIndex }: { category: Category; categoryIndex: number }) {
  const [expanded, setExpanded] = useState(true);

  const generateGoalId = (catIdx: number, objText: string): number => {
    const hash = objText.split(" ").reduce((acc, word) => acc + word.charCodeAt(0), 0);
    return 100 + catIdx * 10 + (hash % 10);
  };

  return (
    <Card style={{ background: "#0D1220", borderColor: "#1E2D45", overflow: "hidden" }}>
      {/* Card header */}
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          padding: "14px 16px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: expanded ? "1px solid #1E2D45" : "none",
          transition: "border-color 0.1s",
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "8px" }}>
            <span
              style={{
                fontFamily: "var(--font-syne, Syne, sans-serif)",
                fontSize: "16px",
                fontWeight: 700,
                color: "#F0F0F5",
              }}
            >
              {category.name}
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span
                style={{
                  fontFamily: "var(--font-syne, Syne, sans-serif)",
                  fontSize: "16px",
                  fontWeight: 700,
                  color: textProgressColor(category.progress),
                }}
              >
                {category.progress}%
              </span>
              <span
                style={{
                  color: "#A0A0B0",
                  fontSize: "12px",
                  transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "transform 0.2s ease",
                  display: "inline-block",
                }}
              >
                ▾
              </span>
            </div>
          </div>
          <ProgressBar progress={category.progress} />
        </div>
      </div>

      {/* Objectives list */}
      {expanded && (
        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: "6px" }}>
          {category.objectives.map((obj, i) => {
            const goalId = generateGoalId(categoryIndex, obj.text);
            return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                padding: "6px 0",
                borderBottom: i < category.objectives.length - 1 ? "1px solid rgba(30,45,69,0.5)" : "none",
              }}
            >
              {/* Checkbox */}
              <div
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "4px",
                  border: obj.done ? "none" : "1px solid #1E2D45",
                  background: obj.done ? "linear-gradient(135deg, #4F8EF7, #7C3AED)" : "transparent",
                  flexShrink: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: "2px",
                }}
              >
                {obj.done && (
                  <span style={{ color: "#fff", fontSize: "10px", lineHeight: 1 }}>✓</span>
                )}
              </div>
              <span
                style={{
                  fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                  fontSize: "13px",
                  color: obj.done ? "#A0A0B0" : "#F0F0F5",
                  textDecoration: obj.done ? "line-through" : "none",
                  textDecorationColor: obj.done ? "#A0A0B0" : "none",
                  lineHeight: 1.5,
                  flex: 1,
                  cursor: "pointer",
                }}
              >
                {obj.text}
              </span>
              {obj.done && (
                <span style={{ color: "#34D399", fontSize: "12px", flexShrink: 0 }}>✓</span>
              )}
            </div>
          )})}
        </div>
      )}
    </Card>
  );
}

function MetricsTable({ metrics }: { metrics: Metric[] }) {
  if (metrics.length === 0) return null;

  return (
    <Card style={{ background: "#0D1220", borderColor: "#1E2D45", overflow: "hidden", marginTop: "20px" }}>
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #1E2D45",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "13px",
            fontWeight: 700,
            color: "#F0F0F5",
          }}
        >
          📏 Success Metrics
        </span>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "rgba(255,255,255,0.02)" }}>
              {["Goal", "Metric", "Current", "Target"].map(h => (
                <th
                  key={h}
                  style={{
                    textAlign: "left",
                    padding: "10px 16px",
                    fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                    fontSize: "10px",
                    fontWeight: 600,
                    color: "#A0A0B0",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    borderBottom: "1px solid #1E2D45",
                    whiteSpace: "nowrap",
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((m, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: i < metrics.length - 1 ? "1px solid rgba(30,45,69,0.4)" : "none",
                  transition: "background 0.1s ease",
                }}
              >
                <td
                  style={{
                    padding: "11px 16px",
                    fontFamily: "var(--font-syne, Syne, sans-serif)",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#F0F0F5",
                    whiteSpace: "nowrap",
                  }}
                >
                  {m.goal}
                </td>
                <td
                  style={{
                    padding: "11px 16px",
                    fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                    fontSize: "13px",
                    color: "#8888A0",
                  }}
                >
                  {m.metric}
                </td>
                <td
                  style={{
                    padding: "11px 16px",
                    fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                    fontSize: "12px",
                    color: "#FBBF24",
                  }}
                >
                  {m.current}
                </td>
                <td
                  style={{
                    padding: "11px 16px",
                    fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                    fontSize: "12px",
                    color: "#34D399",
                    fontWeight: 600,
                  }}
                >
                  {m.target}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default function GoalsDashboard() {
  const [data, setData] = useState<GoalsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/intelligence/goals")
      .then(r => r.json())
      .then(d => setData(d))
      .catch(() => setData({ categories: [], metrics: [] }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Section header */}
      <div style={{ marginBottom: "16px" }}>
        <h3
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "18px",
            fontWeight: 700,
            color: "#F0F0F5",
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          🟡 Strategic Objectives — Q1 2026
        </h3>
        <p
          style={{
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            fontSize: "13px",
            color: "#A0A0B0",
            margin: "4px 0 0",
          }}
        >
          Goal tracking from GOALS.md
        </p>
      </div>

      {loading ? (
        <Card style={{ background: "#0D1220", borderColor: "#1E2D45", padding: "24px", textAlign: "center" }}>
          <span style={{ color: "#A0A0B0", fontSize: "13px", fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)" }}>
            Loading goals…
          </span>
        </Card>
      ) : !data || data.categories.length === 0 ? (
        <Card style={{ background: "#0D1220", borderColor: "#1E2D45", padding: "24px", textAlign: "center" }}>
          <span style={{ color: "#A0A0B0", fontSize: "13px", fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)" }}>
            No goals data found
          </span>
        </Card>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: "12px",
            }}
          >
            {data.categories.map((cat, i) => (
              <CategoryCard key={i} category={cat} categoryIndex={i} />
            ))}
          </div>

          <MetricsTable metrics={data.metrics} />
        </>
      )}
    </div>
  );
}
