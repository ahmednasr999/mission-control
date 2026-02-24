"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ModelInfo {
  id: string;
  name: string;
  contextWindow: number;
  cost: { input: number; output: number; note?: string };
  capabilities: string[];
  reasoning: boolean;
}

interface Provider {
  name: string;
  baseUrl: string;
  consoleLink?: string | null;
  models: ModelInfo[];
}

interface RoutingRule {
  task: string;
  model: string;
}

interface ModelsData {
  providers: Provider[];
  routingRules: RoutingRule[];
}

function formatContext(n: number): string {
  if (n >= 1000) return `${Math.round(n / 1000)}K`;
  return `${n}`;
}

function formatCost(cost: { input: number; output: number; note?: string }): string {
  if (cost.note) return cost.note;
  if (cost.input === 0 && cost.output === 0) return "Free";
  return `$${cost.input}/$${cost.output}`;
}

function providerLabel(key: string): string {
  const map: Record<string, string> = {
    anthropic: "Anthropic",
    moonshot: "Moonshot (Kimi)",
    "minimax-portal": "MiniMax (Portal)",
    minimax: "MiniMax",
  };
  return map[key] || key;
}

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: "#4F8EF7",
  moonshot: "#34D399",
  "minimax-portal": "#A78BFA",
  minimax: "#FBBF24",
};

export default function ModelRouting() {
  const [data, setData] = useState<ModelsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings/models")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ providers: [], routingRules: [] }))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card className="bg-slate-900/60 border-slate-700/50 overflow-hidden">
      <CardHeader className="p-4 border-b border-slate-700/50 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold text-slate-100" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
          Model Routing
        </CardTitle>
        <Badge variant="outline" className="text-[10px] font-mono text-slate-400 border-slate-700 uppercase tracking-wider">
          Read-Only
        </Badge>
      </CardHeader>

      <CardContent className="p-5">
        {loading ? (
          <div className="text-slate-500 text-sm text-center py-5">Loading model config…</div>
        ) : (
          <>
            {/* Model Table */}
            <div className="overflow-x-auto mb-6">
              <Table className="min-w-[600px]">
                <TableHeader>
                  <TableRow className="border-slate-700/50">
                    {["Provider", "Model", "Context", "Cost (in/out)", "Capabilities"].map((h) => (
                      <TableHead key={h} className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.providers.flatMap((provider) =>
                    provider.models.map((model, mi) => (
                      <TableRow key={`${provider.name}-${model.id}`} className="border-slate-700/30">
                        <TableCell className="py-2.5">
                          {mi === 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold" style={{ color: PROVIDER_COLORS[provider.name] || "#8888A0" }}>
                                {providerLabel(provider.name)}
                              </span>
                              {provider.consoleLink && (
                                <a
                                  href={provider.consoleLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-500 hover:text-blue-400 transition-colors"
                                  title="Open console"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                </a>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-600">↳</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2.5">
                          <span className="text-xs font-bold text-slate-100" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
                            {model.name}
                          </span>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <span className="font-mono text-xs text-slate-400">{formatContext(model.contextWindow)}</span>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <span className={`font-mono text-xs font-semibold ${
                            model.cost.input === 0 && model.cost.output === 0 ? "text-emerald-400" : "text-amber-400"
                          }`}>
                            {formatCost(model.cost)}
                          </span>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <div className="flex gap-1 flex-wrap">
                            {model.capabilities.map((cap) => (
                              <Badge key={cap} variant="outline" className="text-[10px] text-blue-400 border-blue-500/25 bg-blue-500/10 capitalize">
                                {cap}
                              </Badge>
                            ))}
                            {model.reasoning && (
                              <Badge variant="outline" className="text-[10px] text-purple-400 border-purple-500/25 bg-purple-500/10">
                                reasoning
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Routing Rules */}
            <div>
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3" style={{ fontFamily: "var(--font-syne, Syne, sans-serif)" }}>
                Routing Rules
              </div>
              <div className="flex flex-col gap-2">
                {(data?.routingRules || []).map((rule, i) => (
                  <Card key={i} className="bg-white/[0.02] border-slate-700/50">
                    <CardContent className="p-2.5 px-3.5 flex items-center gap-3">
                      <span className="text-sm text-slate-400 flex-1">{rule.task}</span>
                      <span className="text-slate-500 text-sm shrink-0">→</span>
                      <span
                        className="text-xs font-bold shrink-0 min-w-[90px] text-right"
                        style={{
                          fontFamily: "var(--font-syne, Syne, sans-serif)",
                          background: "linear-gradient(135deg, #4F8EF7, #7C3AED)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor: "transparent",
                          backgroundClip: "text",
                        }}
                      >
                        {rule.model}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
