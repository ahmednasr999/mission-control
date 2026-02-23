"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsData {
  memoryFiles: string;
  memorySize: string;
  sessionFiles: string;
  agentCount: string;
  dailyLogs: string;
  workspaceSize: string;
  fileGrowthTrend?: string[];
}

function StatItem({ value, label, gradient }: { value: string; label: string; gradient: string }) {
  return (
    <Card className="bg-white/[0.02] border-slate-700/50">
      <CardContent className="p-4">
        <div
          className="text-2xl font-bold leading-tight tracking-tight"
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            background: gradient,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {value}
        </div>
        <div className="text-[11px] text-slate-500 uppercase tracking-wider font-medium mt-1.5">
          {label}
        </div>
      </CardContent>
    </Card>
  );
}

function FileGrowthChart({ trend }: { trend: string[] }) {
  if (!trend || trend.length === 0) {
    return <div className="text-[11px] text-slate-500">Trend: N/A</div>;
  }

  const parsed = trend.map((t) => {
    const [date, countStr] = t.split(":");
    return { date, count: parseInt(countStr || "0", 10) };
  });
  const maxVal = Math.max(...parsed.map((p) => p.count), 1);

  return (
    <div>
      <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-2">
        Memory File Activity (7 days)
      </div>
      <div className="flex items-end gap-1 h-10">
        {parsed.map(({ date, count }) => {
          const heightPct = maxVal > 0 ? (count / maxVal) * 100 : 0;
          return (
            <div key={date} title={`${date}: ${count} files`} className="flex-1 flex flex-col items-center gap-0.5 h-full justify-end">
              <div
                className="w-full rounded-sm transition-all duration-300"
                style={{
                  height: `${Math.max(heightPct, 4)}%`,
                  background: count > 0 ? "linear-gradient(180deg, #4F8EF7, #7C3AED)" : "rgba(136,136,160,0.15)",
                  minHeight: "3px",
                }}
              />
              <div className="text-[8px] font-mono text-slate-500 whitespace-nowrap">{date}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const STAT_CONFIGS = [
  { key: "memoryFiles" as keyof StatsData, label: "Memory Files", gradient: "linear-gradient(135deg, #4F8EF7, #60A5FA)" },
  { key: "memorySize" as keyof StatsData, label: "Memory Size", gradient: "linear-gradient(135deg, #7C3AED, #A78BFA)" },
  { key: "sessionFiles" as keyof StatsData, label: "Session Files", gradient: "linear-gradient(135deg, #059669, #34D399)" },
  { key: "agentCount" as keyof StatsData, label: "Active Agents", gradient: "linear-gradient(135deg, #D97706, #FBBF24)" },
  { key: "dailyLogs" as keyof StatsData, label: "Daily Logs (2026)", gradient: "linear-gradient(135deg, #EC4899, #F472B6)" },
  { key: "workspaceSize" as keyof StatsData, label: "Total Workspace", gradient: "linear-gradient(135deg, #0891B2, #22D3EE)" },
];

export default function WorkspaceStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings/stats")
      .then((r) => r.json())
      .then(setStats)
      .catch(() =>
        setStats({ memoryFiles: "—", memorySize: "—", sessionFiles: "—", agentCount: "—", dailyLogs: "—", workspaceSize: "—" })
      )
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="bg-slate-900/60 border-slate-700/50 overflow-hidden">
      <CardHeader className="p-4 border-b border-slate-700/50">
        <CardTitle className="text-base font-bold text-slate-100" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
          Workspace Statistics
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5">
        {loading ? (
          <div className="text-slate-500 text-sm text-center py-5">Gathering statistics…</div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-3 mb-5">
              {STAT_CONFIGS.map((cfg) => (
                <StatItem key={cfg.key} value={stats?.[cfg.key] as string ?? "—"} label={cfg.label} gradient={cfg.gradient} />
              ))}
            </div>

            {/* File growth trend chart */}
            {stats?.fileGrowthTrend && stats.fileGrowthTrend.length > 0 && (
              <div className="pt-4 border-t border-slate-700/50">
                <FileGrowthChart trend={stats.fileGrowthTrend} />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
