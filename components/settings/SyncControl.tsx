"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface SyncStatus {
  status: string;
  lastSync: string;
  rowCounts?: Record<string, number>;
  files?: Array<{ name: string; rows: number; status: string; syncedAt: string }>;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      timeZone: "Africa/Cairo",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

function DataSourceBadge({ source, active }: { source: string; active: boolean }) {
  return (
    <div className={`flex items-center gap-2 p-2 px-3.5 rounded-lg flex-1 min-w-0 ${
      active ? "bg-blue-500/10 border border-blue-500/35" : "bg-white/[0.02] border border-slate-700/50"
    }`}>
      <span
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-blue-400" : "bg-slate-500"}`}
        style={{ boxShadow: active ? "0 0 6px #4F8EF799" : "none" }}
      />
      <div className="min-w-0">
        <div className={`text-sm font-bold mb-0.5 ${active ? "text-slate-100" : "text-slate-500"}`}>
          {source}
        </div>
        <div className={`text-[10px] ${active ? "text-blue-400" : "text-slate-500"}`}>
          {active ? "ACTIVE" : "SUPPLEMENTAL"}
        </div>
      </div>
    </div>
  );
}

export default function SyncControl() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [lastTrigger, setLastTrigger] = useState<string | null>(null);
  const [triggerMsg, setTriggerMsg] = useState<string | null>(null);

  const fetchStatus = useCallback(() => {
    fetch("/api/sync/status")
      .then((r) => r.json())
      .then(setSyncStatus)
      .catch(() => setSyncStatus(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleTrigger = async () => {
    setTriggering(true);
    setTriggerMsg(null);
    try {
      const res = await fetch("/api/settings/sync-trigger", { method: "POST" });
      const data = await res.json();
      setLastTrigger(new Date().toISOString());
      setTriggerMsg(data.message || "Sync triggered");
      fetchStatus();
    } catch {
      setTriggerMsg("Failed to trigger sync");
    } finally {
      setTimeout(() => setTriggering(false), 1500);
    }
  };

  const statusColor = syncStatus?.status === "synced" ? "text-emerald-400" : syncStatus?.status === "syncing" ? "text-amber-400" : "text-red-400";
  const dbHasData = syncStatus?.rowCounts ? Object.values(syncStatus.rowCounts).some((v) => v > 0) : false;

  return (
    <Card className="bg-slate-900/60 border-slate-700/50 overflow-hidden">
      <CardHeader className="p-4 border-b border-slate-700/50 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold text-slate-100" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
          Sync Engine
        </CardTitle>
        {!loading && syncStatus && (
          <Badge className={`text-xs ${statusColor}`}>
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                syncStatus.status === "synced" ? "bg-emerald-400" : syncStatus.status === "syncing" ? "bg-amber-400" : "bg-red-400"
              }`}
            />
            {syncStatus.status}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-5">
        {loading ? (
          <div className="text-slate-500 text-sm text-center py-5">Loading sync status…</div>
        ) : (
          <>
            {/* Data source indicators */}
            <div className="mb-4">
              <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-2">Active Data Sources</div>
              <div className="flex gap-2">
                <DataSourceBadge source="Markdown (canonical)" active={true} />
                <DataSourceBadge source="SQLite DB (cache)" active={dbHasData} />
              </div>
              <div className="mt-2 text-[11px] text-slate-400">
                {dbHasData
                  ? "✅ DB in sync — markdown is canonical, DB provides enriched data"
                  : "⚠️ DB empty — markdown-only mode. Trigger a sync to populate DB."}
              </div>
            </div>

            {/* Last sync info */}
            <div className="flex items-start justify-between gap-5 flex-wrap">
              <div className="flex flex-col gap-2 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider min-w-[80px]">Last Sync</span>
                  <span className="font-mono text-xs text-slate-400">{syncStatus?.lastSync ? formatDate(syncStatus.lastSync) : "—"}</span>
                </div>
                {lastTrigger && (
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider min-w-[80px]">Triggered</span>
                    <span className="font-mono text-xs text-emerald-400">{formatDate(lastTrigger)} — {triggerMsg}</span>
                  </div>
                )}
              </div>

              {/* Trigger Button */}
              <Button
                onClick={handleTrigger}
                disabled={triggering}
                className="shrink-0"
                style={{
                  background: triggering ? "rgba(79,142,247,0.15)" : "linear-gradient(135deg, #4F8EF7, #7C3AED)",
                }}
              >
                {triggering ? (
                  <>
                    <span className="animate-spin mr-2">⟳</span>
                    Syncing…
                  </>
                ) : (
                  "⟳ Trigger Sync"
                )}
              </Button>
            </div>

            {/* DB Row counts */}
            {syncStatus?.rowCounts && dbHasData && (
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-2">DB Row Counts</div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(syncStatus.rowCounts)
                    .filter(([, count]) => count > 0)
                    .map(([table, count]) => (
                      <span key={table} className="font-mono text-[11px] text-slate-400 bg-slate-800/30 border border-slate-700 rounded px-2 py-0.5 whitespace-nowrap">
                        {table}: <span className="text-slate-100 font-semibold">{count}</span>
                      </span>
                    ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
