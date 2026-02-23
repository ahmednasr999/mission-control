"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface Task {
  id: string;
  title: string;
  assignee?: string;
  priority?: string;
  category?: string;
  due_date?: string;
  time_spent?: number;
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
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-slate-500 text-sm">Loading metrics...</div>;
  }

  const todo = data?.columns.todo || [];
  const inProgress = data?.columns.inProgress || [];
  const blocked = data?.columns.blocked || [];
  const done = data?.columns.done || [];
  const total = todo.length + inProgress.length + blocked.length + done.length;

  const highPriority = [...todo, ...inProgress, ...blocked].filter(t => t.priority === "high").length;
  const mediumPriority = [...todo, ...inProgress, ...blocked].filter(t => t.priority === "medium").length;
  const lowPriority = [...todo, ...inProgress, ...blocked].filter(t => t.priority === "low").length;
  const totalTimeSpent = [...todo, ...inProgress, ...blocked, ...done].reduce((sum, t) => sum + (t.time_spent || 0), 0);

  const categories = [...todo, ...inProgress, ...blocked].reduce((acc, t) => {
    const cat = t.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const assignees = [...todo, ...inProgress, ...blocked].reduce((acc, t) => {
    const a = t.assignee || "Unassigned";
    acc[a] = (acc[a] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statItems = [
    { label: "Total Tasks", value: total, color: "text-blue-400" },
    { label: "Blocked", value: blocked.length, color: "text-red-400" },
    { label: "Completed", value: done.length, color: "text-emerald-400" },
    { label: "Time Spent", value: `${totalTimeSpent}m`, color: "text-amber-400" },
  ];

  return (
    <div>
      {/* Top Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {statItems.map((s) => (
          <Card key={s.label} className="bg-slate-900/60 border-slate-700/50 text-center">
            <CardContent className="p-5">
              <div className={`text-3xl font-bold font-mono ${s.color}`}>{s.value}</div>
              <div className="text-xs text-slate-500 uppercase tracking-wide mt-1">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Priority & Category Grid */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <Card className="bg-slate-900/60 border-slate-700/50">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-200">Priority Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            {[
              { label: "High", count: highPriority, color: "bg-red-400" },
              { label: "Medium", count: mediumPriority, color: "bg-amber-400" },
              { label: "Low", count: lowPriority, color: "bg-emerald-400" },
            ].map((p) => (
              <div key={p.label} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{p.label}</span>
                  <span className="text-slate-200">{p.count}</span>
                </div>
                <Progress value={total > 0 ? (p.count / total) * 100 : 0} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-700/50">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-200">By Category</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            {Object.entries(categories).map(([cat, count]) => (
              <div key={cat} className="flex justify-between text-xs mb-2">
                <span className="text-slate-400">{cat}</span>
                <span className="text-blue-400 font-semibold">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Assignees & Pipeline Funnel */}
      <div className="grid grid-cols-2 gap-6">
        <Card className="bg-slate-900/60 border-slate-700/50">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-200">By Assignee</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            {Object.entries(assignees).map(([a, count]) => (
              <div key={a} className="flex justify-between text-xs mb-2">
                <span className="text-slate-400">{a}</span>
                <span className="text-blue-400 font-semibold">{count}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-700/50">
          <CardHeader className="p-5 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-200">Pipeline Funnel</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            {[
              { label: "Todo → In Progress", from: todo.length, to: inProgress.length },
              { label: "In Progress → Done", from: inProgress.length, to: done.length },
            ].map((f) => (
              <div key={f.label} className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{f.label}</span>
                  <span className="text-slate-200">{f.from > 0 ? Math.round((f.to / f.from) * 100) : 0}%</span>
                </div>
                <Progress value={f.from > 0 ? (f.to / f.from) * 100 : 0} className="h-1.5" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
