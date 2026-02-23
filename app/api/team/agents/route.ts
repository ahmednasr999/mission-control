import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

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
  "cv-optimizer": { name: "CV Optimizer", emoji: "📄", role: "ADHAM" },
  "job-hunter": { name: "Job Hunter", emoji: "🔍", role: "HEIKAL" },
  researcher: { name: "Research", emoji: "🔬", role: "MAHER" },
  "content-creator": { name: "Content / LinkedIn", emoji: "✍️", role: "LOTFI" },
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
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;

    // For "main" agent: look for keys starting with "agent:main:main"
    // For sub-agents: no dedicated session entries in sessions.json by agent ID
    // We need to find the most recent session file

    const agents: AgentInfo[] = [];

    for (const [agentId, meta] of Object.entries(AGENT_META)) {
      let lastActive: string | null = null;
      let sessionCount = 0;

      if (agentId === "main") {
        // Get all main session entries (not cron, not hook, not subagent)
        const mainKeys = Object.keys(sessions).filter(k => k === "agent:main:main");
        const mainEntry = sessions["agent:main:main"] as { updatedAt?: number; sessionFile?: string } | undefined;
        if (mainEntry && mainEntry.updatedAt) {
          lastActive = new Date(mainEntry.updatedAt).toISOString();
        }

        // Count session files (all .jsonl files in sessions dir)
        try {
          const files = fs.readdirSync(path.join(AGENTS_DIR, "main/sessions"));
          sessionCount = files.filter(f => f.endsWith(".jsonl")).length;
        } catch {
          sessionCount = 0;
        }
      } else {
        // Sub-agents don't have dedicated session directories
        // They show 0 sessions and null lastActive (sessions tracked via subagent keys)
        sessionCount = 0;
        lastActive = null;
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
