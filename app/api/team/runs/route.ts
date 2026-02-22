import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

const AGENTS_DIR = path.join(os.homedir(), ".openclaw/agents");
const SESSIONS_JSON = path.join(AGENTS_DIR, "main/sessions/sessions.json");
const SESSIONS_DIR = path.join(AGENTS_DIR, "main/sessions");
const MAX_HEAD_LINES = 50;
const MAX_TAIL_LINES = 10;

interface RunRecord {
  id: string;
  task: string;
  agent: string;
  model: string;
  startTime: string;
  endTime: string | null;
  duration: string | null;
  outputFile: string | null;
  status: "completed" | "running" | "failed";
}

function readSessionsJson(): Record<string, Record<string, unknown>> {
  try {
    const raw = fs.readFileSync(SESSIONS_JSON, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function getTextFromContent(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    for (const item of content) {
      if (item && typeof item === "object") {
        const obj = item as Record<string, unknown>;
        if (obj.type === "text" && typeof obj.text === "string") {
          return (obj.text as string).slice(0, 200);
        }
      }
    }
  }
  return "";
}

function readHeadLines(filePath: string, n: number): string[] {
  try {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, "utf-8");
    return content.split("\n").filter(l => l.trim()).slice(0, n);
  } catch {
    return [];
  }
}

function readTailLines(filePath: string, n: number): string[] {
  try {
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split("\n").filter(l => l.trim());
    return lines.slice(-n);
  } catch {
    return [];
  }
}

function formatDuration(ms: number): string {
  if (ms < 0) return "—";
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  return `${mins}m ${rem}s`;
}

function truncateTask(text: string, maxLen = 120): string {
  // Get first non-empty line, removing [label] prefixes
  const firstLine = text
    .split("\n")
    .map(l => l.replace(/\[.*?\]/g, "").trim())
    .find(l => l.length > 0) || text.slice(0, maxLen);
  return firstLine.length > maxLen ? firstLine.slice(0, maxLen) + "…" : firstLine;
}

function parseSubagentSession(
  subagentKey: string,
  entry: Record<string, unknown>
): RunRecord | null {
  try {
    const sessionId = entry.sessionId as string | undefined;
    if (!sessionId) return null;

    const sessionFile = path.join(SESSIONS_DIR, `${sessionId}.jsonl`);
    const updatedAt = entry.updatedAt as number | undefined;
    const modelOverride = (entry.modelOverride as string | undefined) || "";

    // Parse head lines for task and model info
    const headLines = readHeadLines(sessionFile, MAX_HEAD_LINES);
    const tailLines = readTailLines(sessionFile, MAX_TAIL_LINES);

    let startTime = "";
    let task = "Unknown task";
    let model = modelOverride;
    let endTimestamp: string | null = null;

    // Parse head for session start, model, and first user message
    for (const line of headLines) {
      try {
        const obj = JSON.parse(line);
        if (!startTime && obj.type === "session" && obj.timestamp) {
          startTime = obj.timestamp as string;
        }
        if (!model && obj.type === "model_change" && obj.modelId) {
          model = obj.modelId as string;
        }
        if (task === "Unknown task" && obj.type === "message" && obj.message) {
          const msg = obj.message as { role?: string; content?: unknown };
          if (msg.role === "user") {
            const text = getTextFromContent(msg.content);
            if (text) {
              task = truncateTask(text);
            }
          }
        }
      } catch {
        // skip malformed
      }
    }

    // Parse tail for end timestamp
    for (const line of [...tailLines].reverse()) {
      try {
        const obj = JSON.parse(line);
        if (obj.timestamp) {
          endTimestamp = obj.timestamp as string;
          break;
        }
      } catch {
        // skip
      }
    }

    // Calculate duration
    let duration: string | null = null;
    let endTime: string | null = endTimestamp;
    if (startTime && endTimestamp) {
      const ms = new Date(endTimestamp).getTime() - new Date(startTime).getTime();
      duration = formatDuration(ms);
    }

    // Determine status
    // If updatedAt matches endTimestamp closely → completed
    // If sessionFile doesn't exist → failed (missing)
    let status: "completed" | "running" | "failed" = "completed";
    if (!fs.existsSync(sessionFile)) {
      status = "failed";
      endTime = updatedAt ? new Date(updatedAt).toISOString() : null;
      startTime = startTime || (updatedAt ? new Date(updatedAt).toISOString() : "");
    } else if (endTimestamp) {
      const now = Date.now();
      const lastSeen = new Date(endTimestamp).getTime();
      // If last activity was within 5 minutes, consider running
      status = now - lastSeen < 5 * 60 * 1000 ? "running" : "completed";
    }

    // Extract label from subagentKey for agent display
    const agent = "subagent";

    return {
      id: subagentKey,
      task,
      agent,
      model: model || "unknown",
      startTime,
      endTime,
      duration,
      outputFile: null,
      status,
    };
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  try {
    const sessions = readSessionsJson();

    // Find all subagent keys
    const subagentKeys = Object.keys(sessions).filter(k =>
      k.startsWith("agent:main:subagent:")
    );

    // Parse each subagent session
    const runs: RunRecord[] = [];
    for (const key of subagentKeys) {
      const record = parseSubagentSession(key, sessions[key] as Record<string, unknown>);
      if (record) runs.push(record);
    }

    // Sort by startTime descending (most recent first)
    runs.sort((a, b) => {
      const ta = a.startTime ? new Date(a.startTime).getTime() : 0;
      const tb = b.startTime ? new Date(b.startTime).getTime() : 0;
      return tb - ta;
    });

    const total = runs.length;
    const page = runs.slice(offset, offset + limit);

    return NextResponse.json({
      runs: page,
      hasMore: offset + limit < total,
      total,
    });
  } catch {
    return NextResponse.json({ runs: [], hasMore: false, total: 0 });
  }
}
