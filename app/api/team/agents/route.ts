import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { getGatewaySessions } from "@/lib/gateway-client";

const AGENTS_DIR = path.join(os.homedir(), ".openclaw/agents");
const SESSIONS_JSON = path.join(AGENTS_DIR, "main/sessions/sessions.json");

interface AgentInfo {
  id: string;
  name: string;
  emoji: string;
  role: string;
  lastActive: string | null;
  isActive: boolean;
  sessionCount: number;
}

const AGENT_META: Record<string, { name: string; emoji: string; role: string }> = {
  main: { name: "NASR", emoji: "🎯", role: "Strategic Consultant" },
  "cv-optimizer": { name: "CV Optimizer", emoji: "📄", role: "CV Optimization" },
  "job-hunter": { name: "Job Hunter", emoji: "🔍", role: "Job Hunting" },
  researcher: { name: "Researcher", emoji: "🔬", role: "Research" },
  "content-creator": { name: "Content Creator", emoji: "✍️", role: "Content Creation" },
};

const GATEWAY_AGENT_MAP: Record<string, string> = {
  main: "agent:main:main",
  "cv-optimizer": "agent:main:subagent:cv-optimizer",
  "job-hunter": "agent:main:subagent:job-hunter",
  researcher: "agent:main:subagent:researcher",
  "content-creator": "agent:main:subagent:content-creator",
};

function readSessionsJson(): Record<string, Record<string, unknown>> {
  try {
    const raw = fs.readFileSync(SESSIONS_JSON, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export async function GET(): Promise<NextResponse> {
  try {
    const sessions = readSessionsJson();
    const gatewaySessions = await getGatewaySessions();
    const gatewaySessionMap = new Map(gatewaySessions.map(s => [s.id, s]));
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    const agents: AgentInfo[] = [];

    for (const [agentId, meta] of Object.entries(AGENT_META)) {
      let lastActive: string | null = null;
      let sessionCount = 0;

      const gatewayKey = GATEWAY_AGENT_MAP[agentId];
      if (gatewayKey && gatewaySessionMap.has(gatewayKey)) {
        const gwSession = gatewaySessionMap.get(gatewayKey);
        if (gwSession?.lastActive) {
          lastActive = new Date(gwSession.lastActive).toISOString();
        }
        if (gwSession?.startedAt) {
          sessionCount = gatewaySessions.filter(s => 
            s.id.startsWith(gatewayKey.replace("agent:", ""))
          ).length || 1;
        }
      }

      if (agentId === "main" && !lastActive) {
        const mainEntry = sessions["agent:main:main"] as { updatedAt?: number; sessionFile?: string } | undefined;
        if (mainEntry && mainEntry.updatedAt) {
          lastActive = new Date(mainEntry.updatedAt).toISOString();
        }
        try {
          const files = fs.readdirSync(path.join(AGENTS_DIR, "main/sessions"));
          sessionCount = files.filter(f => f.endsWith(".jsonl")).length;
        } catch {
          sessionCount = 0;
        }
      } else if (agentId === "main" && sessionCount === 0) {
        try {
          const files = fs.readdirSync(path.join(AGENTS_DIR, "main/sessions"));
          sessionCount = files.filter(f => f.endsWith(".jsonl")).length;
        } catch {
          sessionCount = 0;
        }
      }

      const isActive = lastActive
        ? now - new Date(lastActive).getTime() < twentyFourHours
        : false;

      agents.push({
        id: agentId,
        name: meta.name,
        emoji: meta.emoji,
        role: meta.role,
        lastActive,
        isActive,
        sessionCount,
      });
    }

    return NextResponse.json({ agents });
  } catch {
    return NextResponse.json({ agents: [] });
  }
}
