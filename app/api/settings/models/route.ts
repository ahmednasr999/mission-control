import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { homedir } from "os";
import path from "path";

export const dynamic = "force-dynamic";

const ROUTING_RULES = [
  { task: "Deep strategy, interview prep", model: "Opus 4.6" },
  { task: "CV tailoring, drafting", model: "Sonnet 4.6" },
  { task: "Quick lookups, formatting", model: "Haiku 4.5" },
  { task: "Bulk processing, first drafts", model: "MiniMax M2.5" },
  { task: "Long document analysis", model: "Kimi K2.5" },
];

export async function GET() {
  try {
    const modelsPath = path.join(homedir(), ".openclaw/agents/main/agent/models.json");
    const raw = readFileSync(modelsPath, "utf-8");
    const data = JSON.parse(raw);

    const providers = Object.entries(data.providers || {}).map(([providerKey, providerVal]: [string, any]) => {
      // Strip apiKey from provider
      const { apiKey: _apiKey, ...safeProvider } = providerVal;

      const models = (safeProvider.models || []).map((model: any) => {
        // Strip any apiKey from model level (just in case)
        const { apiKey: _mApiKey, ...safeModel } = model;
        return {
          id: safeModel.id,
          name: safeModel.name,
          contextWindow: safeModel.contextWindow,
          cost: safeModel.cost
            ? {
                input: safeModel.cost.input,
                output: safeModel.cost.output,
              }
            : { input: 0, output: 0 },
          capabilities: Array.isArray(safeModel.input) ? safeModel.input : ["text"],
          reasoning: safeModel.reasoning ?? false,
        };
      });

      return {
        name: providerKey,
        baseUrl: safeProvider.baseUrl,
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
