import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";
import { getGatewaySessions } from "@/lib/gateway-client";

const AGENTS_DIR = path.join(os.homedir(), ".openclaw/agents");
const SESSIONS_JSON = path.join(AGENTS_DIR, "main/sessions/sessions.json");
const MEMORY_DIR = path.join(os.homedir(), ".openclaw/memory");

interface AgentInfo {
  id: string;
  name: string;
  emoji: string;
  role: string;
  status: "active" | "inactive";
  sessionCount: number;
  lastActive: string | null;
  lastAction: string | null;
  sessions: SessionInfo[];
  subAgents?: SubAgentInfo[];
}

interface SessionInfo {
  sessionId: string;
  startTime: string;
  duration: number | null;
  status: "running" | "completed" | "failed";
}

interface SubAgentInfo {
  id: string;
  name: string;
  emoji: string;
  status: "active" | "inactive";
  lastRun: string | null;
}

const AGENT_META: Record<string, { name: string; emoji: string; role: string }> = {
  main: { name: "NASR", emoji: "🎯", role: "Strategic Consultant" },
  "cv-optimizer": { name: "CV Optimizer", emoji: "📄", role: "CV Optimization" },
  "job-hunter": { name: "Job Hunter", emoji: "🔍", role: "Job Hunting" },
  researcher: { name: "Researcher", emoji: "🔬", role: "Research" },
  "content-creator": { name: "Content Creator", emoji: "✍️", role: "Content Creation" },
};

const SUB_AGENTS = ["cv-optimizer", "job-hunter", "researcher", "content-creator"];

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

function getAgentSessions(agentId: string): SessionInfo[] {
  const sessions: SessionInfo[] = [];
  const agentDir = path.join(AGENTS_DIR, agentId, "sessions");
  
  try {
    if (fs.existsSync(agentDir)) {
      const files = fs.readdirSync(agentDir);
      const sessionFiles = files.filter(f => f.endsWith(".jsonl")).sort().reverse().slice(0, 10);
      
      for (const file of sessionFiles) {
        const sessionId = file.replace(".jsonl", "");
        const filePath = path.join(agentDir, file);
        const stats = fs.statSync(filePath);
        
        let duration: number | null = null;
        let status: "running" | "completed" | "failed" = "completed";
        
        try {
          const content = fs.readFileSync(filePath, "utf-8");
          const lines = content.trim().split("\n").filter(l => l);
          if (lines.length > 0) {
            const lastLine = JSON.parse(lines[lines.length - 1]);
            if (lastLine.timestamp && lines.length > 1) {
              const firstLine = JSON.parse(lines[0]);
              duration = new Date(lastLine.timestamp).getTime() - new Date(firstLine.timestamp).getTime();
            }
            if (lastLine.type === "error" || lastLine.level === "error") {
              status = "failed";
            }
          }
        } catch {
          // Ignore parse errors
        }
        
        sessions.push({
          sessionId,
          startTime: stats.mtime.toISOString(),
          duration,
          status,
        });
      }
    }
  } catch {
    // Agent directory doesn't exist
  }
  
  return sessions.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}

function getSubAgents(): SubAgentInfo[] {
  const now = Date.now();
  const twentyFourHours = 24 * 60 * 60 * 1000;
  const sessions = readSessionsJson();
  
  try {
    return SUB_AGENTS.map(id => {
      const meta = AGENT_META[id];
      const entry = sessions[`agent:main:subagent:${id}`] as { lastActive?: number; updatedAt?: number } | undefined;
      const subLastActive = entry?.lastActive || entry?.updatedAt;
      
      const isActive = subLastActive ? now - subLastActive < twentyFourHours : false;
      
      return {
        id,
        name: meta.name,
        emoji: meta.emoji,
        status: isActive ? "active" : "inactive",
        lastRun: subLastActive ? new Date(subLastActive).toISOString() : null,
      };
    });
  } catch {
    return SUB_AGENTS.map(id => ({
      id,
      name: AGENT_META[id].name,
      emoji: AGENT_META[id].emoji,
      status: "inactive" as const,
      lastRun: null,
    }));
  }
}

function getActivityTimeline(agentId: string): { action: string; timestamp: string }[] {
  const timeline: { action: string; timestamp: string }[] = [];
  const agentName = AGENT_META[agentId]?.name?.toLowerCase() || agentId.toLowerCase();
  
  try {
    if (fs.existsSync(MEMORY_DIR)) {
      const files = fs.readdirSync(MEMORY_DIR).filter(f => f.endsWith(".md"));
      
      for (const file of files) {
        try {
          const content = fs.readFileSync(path.join(MEMORY_DIR, file), "utf-8");
          const lines = content.split("\n");
          
          for (const line of lines) {
            if (line.toLowerCase().includes(agentName)) {
              const dateMatch = line.match(/(\d{4}-\d{2}-\d{2})/);
              const timestamp = dateMatch ? dateMatch[1] : new Date().toISOString().split("T")[0];
              const action = line.replace(/^#+\s*/, "").trim().substring(0, 100);
              
              if (action && !timeline.find(t => t.action === action && t.timestamp === timestamp)) {
                timeline.push({ action, timestamp });
              }
            }
          }
        } catch {
          // Skip files that can't be read
        }
      }
    }
  } catch {
    // Memory directory doesn't exist
  }
  
  return timeline.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ agentId: string }> }
): Promise<NextResponse> {
  try {
    const { agentId } = await params;
    
    if (!AGENT_META[agentId]) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }
    
    const meta = AGENT_META[agentId];
    const sessions = readSessionsJson();
    const gatewaySessions = await getGatewaySessions();
    const now = Date.now();
    const twentyFourHours = 24 * 60 * 60 * 1000;
    
    let lastActive: string | null = null;
    let sessionCount = 0;
    let lastAction: string | null = null;
    
    const gatewayKey = GATEWAY_AGENT_MAP[agentId];
    if (gatewayKey) {
      const gwSession = gatewaySessions.find(s => s.id === gatewayKey);
      if (gwSession?.lastActive) {
        lastActive = new Date(gwSession.lastActive).toISOString();
      }
    }
    
    if (agentId === "main") {
      const mainEntry = sessions["agent:main:main"] as { updatedAt?: number; sessionFile?: string; lastAction?: string } | undefined;
      if (mainEntry?.updatedAt) {
        lastActive = new Date(mainEntry.updatedAt).toISOString();
      }
      if (mainEntry?.lastAction) {
        lastAction = mainEntry.lastAction;
      }
      try {
        const agentDir = path.join(AGENTS_DIR, "main/sessions");
        if (fs.existsSync(agentDir)) {
          sessionCount = fs.readdirSync(agentDir).filter(f => f.endsWith(".jsonl")).length;
        }
      } catch {
        sessionCount = 0;
      }
    } else {
      const subEntry = sessions[`agent:main:subagent:${agentId}`] as { updatedAt?: number; lastAction?: string } | undefined;
      if (subEntry?.updatedAt) {
        lastActive = new Date(subEntry.updatedAt).toISOString();
      }
      if (subEntry?.lastAction) {
        lastAction = subEntry.lastAction;
      }
      try {
        const agentDir = path.join(AGENTS_DIR, agentId, "sessions");
        if (fs.existsSync(agentDir)) {
          sessionCount = fs.readdirSync(agentDir).filter(f => f.endsWith(".jsonl")).length;
        }
      } catch {
        sessionCount = 0;
      }
    }
    
    const isActive = lastActive ? now - new Date(lastActive).getTime() < twentyFourHours : false;
    const agentSessions = getAgentSessions(agentId);
    const timeline = getActivityTimeline(agentId);
    
    const response: AgentInfo = {
      id: agentId,
      name: meta.name,
      emoji: meta.emoji,
      role: meta.role,
      status: isActive ? "active" : "inactive",
      sessionCount,
      lastActive,
      lastAction,
      sessions: agentSessions,
    };
    
    if (agentId === "main") {
      response.subAgents = getSubAgents();
    }
    
    return NextResponse.json({ agent: response, timeline });
  } catch {
    return NextResponse.json({ error: "Failed to fetch agent" }, { status: 500 });
  }
}
