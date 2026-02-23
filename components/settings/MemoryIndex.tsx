"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ReindexResult {
  success: boolean;
  output?: string;
  error?: string;
}

export default function MemoryIndex() {
  const [indexing, setIndexing] = useState(false);
  const [result, setResult] = useState<ReindexResult | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);

  const handleReindex = async () => {
    setIndexing(true);
    setResult(null);
    try {
      const res = await fetch("/api/settings/reindex", { method: "POST" });
      const data: ReindexResult = await res.json();
      setResult(data);
      setTimestamp(new Date().toISOString());
    } catch {
      setResult({ success: false, error: "Request failed" });
    } finally {
      setIndexing(false);
    }
  };

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

  return (
    <Card className="bg-slate-900/60 border-slate-700/50 overflow-hidden">
      <CardHeader className="p-4 border-b border-slate-700/50">
        <CardTitle className="text-base font-bold text-slate-100" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
          Memory Index
        </CardTitle>
      </CardHeader>

      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-5 flex-wrap">
          {/* Status area */}
          <div className="flex-1 flex flex-col gap-2">
            <p className="text-sm text-slate-400 m-0 leading-relaxed">
              Re-indexes the memory vector store so recent files are searchable via{" "}
              <code className="font-mono text-[11px] bg-blue-500/10 border border-blue-500/20 rounded px-1.5 py-0.5 text-blue-400">
                openclaw memory search
              </code>
              .
            </p>

            {result && timestamp && (
              <div
                className={`rounded-md p-2.5 px-3.5 mt-1 border ${
                  result.success
                    ? "bg-emerald-500/[0.06] border-emerald-500/20"
                    : "bg-red-500/[0.06] border-red-500/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm">{result.success ? "✅" : "❌"}</span>
                  <span className={`text-xs font-semibold ${result.success ? "text-emerald-400" : "text-red-400"}`}>
                    {result.success ? "Re-index complete" : "Re-index failed"}
                  </span>
                  <span className="font-mono text-[10px] text-slate-500 ml-auto">
                    {formatDate(timestamp)}
                  </span>
                </div>
                {(result.output || result.error) && (
                  <pre className={`font-mono text-[11px] m-0 whitespace-pre-wrap break-all max-h-[120px] overflow-y-auto ${
                    result.success ? "text-slate-400" : "text-red-400"
                  }`}>
                    {result.output || result.error}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* Button */}
          <Button
            onClick={handleReindex}
            disabled={indexing}
            className="shrink-0 self-start"
            style={{
              background: indexing
                ? "rgba(79,142,247,0.15)"
                : "linear-gradient(135deg, #4F8EF7, #7C3AED)",
            }}
          >
            {indexing ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Indexing…
              </>
            ) : (
              <>🔄 Re-index Memory</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
