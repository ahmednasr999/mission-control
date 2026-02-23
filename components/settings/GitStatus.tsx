"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Commit {
  hash: string;
  message: string;
  date: string;
}

interface GitData {
  remote: string | null;
  commits: Commit[];
  connected: boolean;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", {
      timeZone: "Africa/Cairo",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function GitStatus() {
  const [data, setData] = useState<GitData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings/git-status")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ remote: null, commits: [], connected: false }))
      .finally(() => setLoading(false));
  }, []);

  const latest = data?.commits?.[0];

  return (
    <Card className="bg-slate-900/60 border-slate-700/50 overflow-hidden">
      <CardHeader className="p-4 border-b border-slate-700/50 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold text-slate-100" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
          GitHub Backup
        </CardTitle>
        {!loading && (
          <Badge variant={data?.connected ? "default" : "destructive"} className="text-xs">
            <span
              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${data?.connected ? "bg-emerald-400" : "bg-red-400"}`}
              style={{ boxShadow: data?.connected ? "0 0 6px rgba(52,211,153,0.6)" : "0 0 6px rgba(248,113,113,0.6)" }}
            />
            {data?.connected ? "Connected" : "Not configured"}
          </Badge>
        )}
      </CardHeader>

      <CardContent className="p-5">
        {loading ? (
          <div className="text-slate-500 text-sm text-center py-5">Loading git status…</div>
        ) : (
          <>
            {/* Repo info */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <Card className="bg-white/[0.02] border-slate-700/60">
                <CardContent className="p-3">
                  <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Repository</div>
                  <div className="font-mono text-xs text-blue-400 break-all">{data?.remote || "—"}</div>
                </CardContent>
              </Card>

              <Card className="bg-white/[0.02] border-slate-700/60">
                <CardContent className="p-3">
                  <div className="font-mono text-[10px] text-slate-500 uppercase tracking-wider mb-1.5">Last Pushed</div>
                  {latest ? (
                    <div>
                      <div className="font-mono text-[11px] text-slate-100 mb-0.5">{formatDate(latest.date)}</div>
                      <div className="text-xs text-slate-400 truncate">{latest.message}</div>
                    </div>
                  ) : (
                    <span className="font-mono text-xs text-slate-500">No commits</span>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Recent Commits */}
            {data?.commits && data.commits.length > 0 && (
              <div>
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
                  Recent Commits
                </div>
                <div className="flex flex-col gap-1.5">
                  {data.commits.map((commit, i) => (
                    <div
                      key={commit.hash + i}
                      className="flex items-center gap-3 p-2 px-3 bg-white/[0.02] border border-slate-700/40 rounded-md"
                    >
                      <span className="font-mono text-[11px] text-blue-400 shrink-0 min-w-[58px]">{commit.hash}</span>
                      <span className="text-xs text-slate-100 flex-1 truncate">{commit.message}</span>
                      <span className="font-mono text-[10px] text-slate-500 shrink-0 whitespace-nowrap">{formatDate(commit.date)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!data?.connected && (
              <div className="text-center py-5 text-slate-500 text-sm">
                No git remote configured for this workspace.
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
