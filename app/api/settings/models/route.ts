import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { homedir } from "os";
import path from "path";

export const dynamic = "force-dynamic";

const ROUTING_RULES = [
  { task: "Deep strategy, interview prep", model: "Claude Opus 4.6" },
  { task: "CV tailoring, drafting", model: "Claude Sonnet 4.6" },
  { task: "Quick lookups, formatting", model: "Claude Haiku 4.5" },
  { task: "Bulk processing, first drafts", model: "MiniMax M2.5-highspeed" },
  { task: "Long document analysis", model: "Kimi K2.5" },
];

const PROVIDER_LINKS: Record<string, string> = {
  moonshot: "https://platform.moonshot.ai/console/account",
  "minimax-portal": "https://platform.minimax.io/user-center/payment/coding-plan",
  anthropic: "https://console.anthropic.com/settings/billing",
};

// Cost overrides — source of truth is TOOLS.md
// Format: input/output per 1M tokens. note = special pricing description
const COST_OVERRIDES: Record<string, { input: number; output: number; note?: string }> = {
  "kimi-k2.5":     { input: 0.10, output: 3.00, note: "$0.10 cache hit / $0.60 miss / $3.00 output per 1M" },
  "MiniMax-M2.5":  { input: 0,    output: 0,    note: "Flat rate $40/mo (Coding Plan Plus)" },
  "MiniMax-M2.1":  { input: 0.30, output: 1.20, note: "Deprecated — remove from config" },
  "claude-opus-4-6":   { input: 5,  output: 25  },
  "claude-sonnet-4-6": { input: 3,  output: 15  },
  "claude-haiku-4-5":  { input: 1,  output: 5   },
};

// Models to hide (deprecated)
const HIDDEN_MODELS = new Set(["MiniMax-M2.1", "MiniMax-M2.1-highspeed"]);

export async function GET() {
  try {
    const modelsPath = path.join(homedir(), ".openclaw/agents/main/agent/models.json");
    const raw = readFileSync(modelsPath, "utf-8");
    const data = JSON.parse(raw);

    const providers = Object.entries(data.providers || {}).map(([providerKey, providerVal]: [string, any]) => {
      // Strip apiKey from provider
      const { apiKey: _apiKey, ...safeProvider } = providerVal;

      const models = (safeProvider.models || [])
        .filter((model: any) => !HIDDEN_MODELS.has(model.id))
        .map((model: any) => {
          const { apiKey: _mApiKey, ...safeModel } = model;
          const costOverride = COST_OVERRIDES[safeModel.id];
          return {
            id: safeModel.id,
            name: safeModel.name,
            contextWindow: safeModel.contextWindow,
            cost: costOverride ?? (safeModel.cost
              ? { input: safeModel.cost.input, output: safeModel.cost.output }
              : { input: 0, output: 0 }),
            capabilities: Array.isArray(safeModel.input) ? safeModel.input : ["text"],
            reasoning: safeModel.reasoning ?? false,
          };
        });

      return {
        name: providerKey,
        baseUrl: safeProvider.baseUrl,
        consoleLink: PROVIDER_LINKS[providerKey] || null,
        models,
      };
    });

    return NextResponse.json({ providers, routingRules: ROUTING_RULES });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Failed to load models", details: err.message, providers: [], routingRules: ROUTING_RULES },
      { status: 500 }
    );
  }
}
