"use client";

import { useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  priority?: string;
  category?: string;
  due_date?: string;
  subtasks?: string;
  blockers?: string;
  time_spent?: number;
  comments?: string;
  status: string;
  createdAt: string;
}

interface PipelineResponse {
  columns: {
    todo: Task[];
    inProgress: Task[];
    blocked: Task[];
    done: Task[];
  };
}

export default function OpsMetrics() {
  const [data, setData] = useState<PipelineResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ops/tasks")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#A0A0B0" }}>Loading metrics...</div>;
  }

  const todo = data?.columns.todo || [];
  const inProgress = data?.columns.inProgress || [];
  const blocked = data?.columns.blocked || [];
  const done = data?.columns.done || [];

  const total = todo.length + inProgress.length + blocked.length + done.length;
  
  // Priority breakdown
  const highPriority = [...todo, ...inProgress, ...blocked].filter(t => t.priority === "high").length;
  const mediumPriority = [...todo, ...inProgress, ...blocked].filter(t => t.priority === "medium").length;
  const lowPriority = [...todo, ...inProgress, ...blocked].filter(t => t.priority === "low").length;

  // Category breakdown
  const categories = [...todo, ...inProgress, ...blocked].reduce((acc, t) => {
    const cat = t.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Time spent
  const totalTimeSpent = [...todo, ...inProgress, ...blocked, ...done].reduce((sum, t) => sum + (t.time_spent || 0), 0);

  // Blockers
  const tasksWithBlockers = blocked.length;

  // Assignees
  const assignees = [...todo, ...inProgress, ...blocked].reduce((acc, t) => {
    const a = t.assignee || "Unassigned";
    acc[a] = (acc[a] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div>
      {/* Top Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <div style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px", padding: "20px", textAlign: "center" }}>
          <div style={{ fontSize: "32px", fontWeight: 700, color: "#4F8EF7" }}>{total}</div>
          <div style={{ fontSize: "12px", color: "#A0A0B0", textTransform: "uppercase" }}>Total Tasks</div>
        </div>
        <div style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px", padding: "20px", textAlign: "center" }}>
          <div style={{ fontSize: "32px", fontWeight: 700, color: "#F87171" }}>{tasksWithBlockers}</div>
          <div style={{ fontSize: "12px", color: "#A0A0B0", textTransform: "uppercase" }}>Blocked</div>
        </div>
        <div style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px", padding: "20px", textAlign: "center" }}>
          <div style={{ fontSize: "32px", fontWeight: 700, color: "#34D399" }}>{done.length}</div>
          <div style={{ fontSize: "12px", color: "#A0A0B0", textTransform: "uppercase" }}>Completed</div>
        </div>
        <div style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px", padding: "20px", textAlign: "center" }}>
          <div style={{ fontSize: "32px", fontWeight: 700, color: "#F59E0B" }}>{totalTimeSpent}m</div>
          <div style={{ fontSize: "12px", color: "#A0A0B0", textTransform: "uppercase" }}>Time Spent</div>
        </div>
      </div>

      {/* Priority & Category Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "24px" }}>
        {/* Priority Breakdown */}
        <div style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#F0F0F5", marginBottom: "16px" }}>Priority Breakdown</h3>
          {[
            { label: "High", count: highPriority, color: "#F87171" },
            { label: "Medium", count: mediumPriority, color: "#F59E0B" },
            { label: "Low", count: lowPriority, color: "#34D399" },
          ].map(p => (
            <div key={p.label} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <span style={{ color: "#A0A0B0" }}>{p.label}</span>
                <span style={{ color: "#F0F0F5" }}>{p.count}</span>
              </div>
              <div style={{ height: "6px", background: "#1E2D45", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${total > 0 ? (p.count / total) * 100 : 0}%`, background: p.color, borderRadius: "3px" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Category Breakdown */}
        <div style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#F0F0F5", marginBottom: "16px" }}>By Category</h3>
          {Object.entries(categories).map(([cat, count]) => (
            <div key={cat} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "8px" }}>
              <span style={{ color: "#A0A0B0" }}>{cat}</span>
              <span style={{ color: "#4F8EF7", fontWeight: 600 }}>{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Assignees & Progress */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
        {/* By Assignee */}
        <div style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#F0F0F5", marginBottom: "16px" }}>By Assignee</h3>
          {Object.entries(assignees).map(([a, count]) => (
            <div key={a} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "8px" }}>
              <span style={{ color: "#A0A0B0" }}>{a}</span>
              <span style={{ color: "#4F8EF7", fontWeight: 600 }}>{count}</span>
            </div>
          ))}
        </div>

        {/* Funnel */}
        <div style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px", padding: "20px" }}>
          <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#F0F0F5", marginBottom: "16px" }}>Pipeline Funnel</h3>
          {[
            { label: "Todo → In Progress", from: todo.length, to: inProgress.length },
            { label: "In Progress → Done", from: inProgress.length, to: done.length },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                <span style={{ color: "#A0A0B0" }}>{f.label}</span>
                <span style={{ color: "#F0F0F5" }}>{f.from > 0 ? Math.round((f.to / f.from) * 100) : 0}%</span>
              </div>
              <div style={{ height: "6px", background: "#1E2D45", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${f.from > 0 ? (f.to / f.from) * 100 : 0}%`, background: "linear-gradient(90deg, #4F8EF7, #34D399)", borderRadius: "3px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
