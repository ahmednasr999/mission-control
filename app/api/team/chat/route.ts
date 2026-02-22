import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

const AGENTS_DIR = path.join(os.homedir(), ".openclaw/agents");
const SESSIONS_JSON = path.join(AGENTS_DIR, "main/sessions/sessions.json");
const SESSIONS_DIR = path.join(AGENTS_DIR, "main/sessions");
const MAX_LINES = 1000;

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
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
    const parts: string[] = [];
    for (const item of content) {
      if (item && typeof item === "object") {
        const obj = item as Record<string, unknown>;
        if (obj.type === "text" && typeof obj.text === "string") {
          parts.push(obj.text);
        }
      }
    }
    return parts.join("\n");
  }
  return "";
}

async function parseJSONLMessages(filePath: string): Promise<ChatMessage[]> {
  const messages: ChatMessage[] = [];

  try {
    if (!fs.existsSync(filePath)) return messages;

    // Read last MAX_LINES lines for performance
    const fileContent = fs.readFileSync(filePath, "utf-8");
    const lines = fileContent.split("\n").filter(l => l.trim());
    const slicedLines = lines.slice(-MAX_LINES);

    for (const line of slicedLines) {
      try {
        const obj = JSON.parse(line);

        // Format: { type: "message", message: { role: "user"|"assistant", content: [...], ... }, timestamp: ISO }
        if (obj.type === "message" && obj.message) {
          const { role, content } = obj.message as { role?: string; content?: unknown };
          if (role === "user" || role === "assistant") {
            const textContent = getTextFromContent(content);
            if (textContent.trim()) {
              messages.push({
                role: role as "user" | "assistant",
                content: textContent,
                timestamp: obj.timestamp || "",
              });
            }
          }
        }
      } catch {
        // Skip malformed lines
      }
    }
  } catch {
    // Return empty on error
  }

  return messages;
}

function getMostRecentSessionFile(dir: string): string | null {
  try {
    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith(".jsonl"))
      .map(f => ({
        name: f,
        mtime: fs.statSync(path.join(dir, f)).mtimeMs,
      }))
      .sort((a, b) => b.mtime - a.mtime);

    return files.length > 0 ? path.join(dir, files[0].name) : null;
  } catch {
    return null;
  }
}

function getMainSessionFile(): string | null {
  // Use sessions.json to find the current main session file
  try {
    const sessions = readSessionsJson();
    const mainEntry = sessions["agent:main:main"] as { sessionFile?: string } | undefined;
    if (mainEntry?.sessionFile && fs.existsSync(mainEntry.sessionFile)) {
      return mainEntry.sessionFile;
    }
  } catch {
    // fall through
  }
  // Fallback: most recent .jsonl file
  return getMostRecentSessionFile(SESSIONS_DIR);
}

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const agentId = searchParams.get("agent") || "main";
  const offset = parseInt(searchParams.get("offset") || "0", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);

  try {
    let sessionFile: string | null = null;

    if (agentId === "main") {
      sessionFile = getMainSessionFile();
    } else {
      // Sub-agents: look in sessions.json for entries containing agentId
      // Sub-agent sessions for specific agents like cv-optimizer aren't tracked separately
      // They don't have their own session files — return empty
      sessionFile = null;
    }

    if (!sessionFile) {
      return NextResponse.json({
        messages: [],
        hasMore: false,
        total: 0,
      });
    }

    const allMessages = await parseJSONLMessages(sessionFile);

    // Return most recent messages (end of array), paginated in reverse
    // offset 0 = last 20 messages, offset 20 = previous 20, etc.
    const total = allMessages.length;
    const end = Math.max(0, total - offset);
    const start = Math.max(0, end - limit);
    const pageMessages = allMessages.slice(start, end).reverse();

    return NextResponse.json({
      messages: pageMessages,
      hasMore: start > 0,
      total,
    });
  } catch {
    return NextResponse.json({ messages: [], hasMore: false, total: 0 });
  }
}
