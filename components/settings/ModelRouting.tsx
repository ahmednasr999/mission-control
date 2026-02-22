"use client";

import { useState, useEffect } from "react";

interface ModelInfo {
  id: string;
  name: string;
  contextWindow: number;
  cost: { input: number; output: number };
  capabilities: string[];
  reasoning: boolean;
}

interface Provider {
  name: string;
  baseUrl: string;
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

function formatCost(cost: { input: number; output: number }): string {
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
    <div
      style={{
        background: "#0D1220",
        border: "1px solid #1E2D45",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid #1E2D45",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "16px",
            fontWeight: 700,
            color: "#F0F0F5",
          }}
        >
          Model Routing
        </span>
        <span
          style={{
            fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            fontSize: "10px",
            fontWeight: 600,
            color: "#8888A0",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid #1E2D45",
            borderRadius: "4px",
            padding: "3px 8px",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          Read-Only
        </span>
      </div>

      <div style={{ padding: "20px" }}>
        {loading ? (
          <div
            style={{
              color: "#A0A0B0",
              fontSize: "13px",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              padding: "20px 0",
              textAlign: "center",
            }}
          >
            Loading model config…
          </div>
        ) : (
          <>
            {/* Model Table */}
            <div style={{ overflowX: "auto", marginBottom: "24px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "600px" }}>
                <thead>
                  <tr>
                    {["Provider", "Model", "Context Window", "Cost (in/out per 1M)", "Capabilities"].map((h) => (
                      <th
                        key={h}
                        style={{
                          textAlign: "left",
                          padding: "8px 12px",
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
                  {data?.providers.flatMap((provider) =>
                    provider.models.map((model, mi) => (
                      <tr
                        key={`${provider.name}-${model.id}`}
                        style={{
                          borderBottom: "1px solid rgba(30,45,69,0.4)",
                        }}
                      >
                        <td style={{ padding: "10px 12px" }}>
                          {mi === 0 ? (
                            <span
                              style={{
                                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                                fontSize: "12px",
                                fontWeight: 600,
                                color: PROVIDER_COLORS[provider.name] || "#8888A0",
                              }}
                            >
                              {providerLabel(provider.name)}
                            </span>
                          ) : (
                            <span style={{ color: "#333" }}>↳</span>
                          )}
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span
                            style={{
                              fontFamily: "var(--font-syne, Syne, sans-serif)",
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "#F0F0F5",
                            }}
                          >
                            {model.name}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span
                            style={{
                              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                              fontSize: "12px",
                              color: "#8888A0",
                            }}
                          >
                            {formatContext(model.contextWindow)}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span
                            style={{
                              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                              fontSize: "12px",
                              color:
                                model.cost.input === 0 && model.cost.output === 0
                                  ? "#34D399"
                                  : "#FBBF24",
                              fontWeight: 600,
                            }}
                          >
                            {formatCost(model.cost)}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                            {model.capabilities.map((cap) => (
                              <span
                                key={cap}
                                style={{
                                  background: "rgba(79,142,247,0.12)",
                                  border: "1px solid rgba(79,142,247,0.25)",
                                  borderRadius: "4px",
                                  padding: "2px 7px",
                                  fontSize: "10px",
                                  color: "#4F8EF7",
                                  fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                                  textTransform: "capitalize",
                                }}
                              >
                                {cap}
                              </span>
                            ))}
                            {model.reasoning && (
                              <span
                                style={{
                                  background: "rgba(124,58,237,0.12)",
                                  border: "1px solid rgba(124,58,237,0.25)",
                                  borderRadius: "4px",
                                  padding: "2px 7px",
                                  fontSize: "10px",
                                  color: "#A78BFA",
                                  fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                                }}
                              >
                                reasoning
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Routing Rules */}
            <div>
              <div
                style={{
                  fontFamily: "var(--font-syne, Syne, sans-serif)",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#8888A0",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "12px",
                }}
              >
                Routing Rules
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(data?.routingRules || []).map((rule, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid #1E2D45",
                      borderRadius: "6px",
                      padding: "9px 14px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                        fontSize: "13px",
                        color: "#8888A0",
                        flex: 1,
                      }}
                    >
                      {rule.task}
                    </span>
                    <span
                      style={{
                        color: "#A0A0B0",
                        fontSize: "14px",
                        flexShrink: 0,
                      }}
                    >
                      →
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-syne, Syne, sans-serif)",
                        fontSize: "12px",
                        fontWeight: 700,
                        background: "linear-gradient(135deg, #4F8EF7, #7C3AED)",
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                        flexShrink: 0,
                        minWidth: "90px",
                        textAlign: "right",
                      }}
                    >
                      {rule.model}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
