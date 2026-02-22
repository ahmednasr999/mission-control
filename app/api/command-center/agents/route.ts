import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MEMORY_DIR = path.join(
  process.env.HOME || "/root",
  ".openclaw/workspace/memory"
);

interface AgentInfo {
  name: string;
  emoji: string;
  lastAction: string;
  timestamp: string | null;
}

const AGENTS: AgentInfo[] = [
  { name: "NASR", emoji: "🧠", lastAction: "No recent activity", timestamp: null },
  { name: "ADHAM", emoji: "📋", lastAction: "No recent activity", timestamp: null },
  { name: "HEIKAL", emoji: "🔍", lastAction: "No recent activity", timestamp: null },
  { name: "MAHER", emoji: "⚙️", lastAction: "No recent activity", timestamp: null },
  { name: "LOTFI", emoji: "📊", lastAction: "No recent activity", timestamp: null },
];

/**
 * Get the most recent YYYY-MM-DD.md files (up to last 7 days).
 */
function getRecentDailyFiles(): string[] {
  try {
    if (!fs.existsSync(MEMORY_DIR)) return [];
    const files = fs.readdirSync(MEMORY_DIR)
      .filter((f) => /^\d{4}-\d{2}-\d{2}\.md$/.test(f))
      .sort()
      .reverse()
      .slice(0, 7);
    return files.map((f) => path.join(MEMORY_DIR, f));
  } catch {
    return [];
  }
}

/**
 * Extract the last mention of an agent name from file content.
 * Returns { action, timestamp } or null.
 */
function extractAgentMention(
  content: string,
  agentName: string,
  fileDate: string
): { action: string; timestamp: string } | null {
  const lines = content.split("\n");
  let lastLine: string | null = null;
  let lastTimestamp: string | null = null;

  for (const line of lines) {
    if (line.toUpperCase().includes(agentName)) {
      lastLine = line.trim();
      // Try to extract a timestamp from the line or nearby context
      const timeMatch = line.match(/(\d{1,2}:\d{2}(?::\d{2})?(?:\s*(?:AM|PM))?)/i);
      if (timeMatch) {
        lastTimestamp = `${fileDate} ${timeMatch[1]}`;
      } else {
        lastTimestamp = fileDate;
      }
    }
  }

  if (!lastLine) return null;

  // Clean up the action text — strip markdown chars, agent name prefix, etc.
  let action = lastLine
    .replace(/^[#*\->\s]+/, "")          // strip leading markdown
    .replace(new RegExp(`\\b${agentName}\\b`, "gi"), "") // remove agent name itself
    .replace(/^[:—\-\s]+/, "")           // strip leading punctuation
    .trim();

  if (action.length > 80) action = action.slice(0, 77) + "…";
  if (!action) action = `Mentioned in ${fileDate} log`;

  return {
    action,
    timestamp: lastTimestamp || fileDate,
  };
}

export async function GET() {
  const recentFiles = getRecentDailyFiles();
  const agents: AgentInfo[] = AGENTS.map((a) => ({ ...a }));

  for (const filePath of recentFiles) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const fileDate = path.basename(filePath, ".md");

      for (const agent of agents) {
        // Only update if we haven't found activity yet
        if (agent.timestamp !== null) continue;
        const mention = extractAgentMention(content, agent.name, fileDate);
        if (mention) {
          agent.lastAction = mention.action;
          agent.timestamp = mention.timestamp;
        }
      }
    } catch {
      // skip unreadable files
    }
  }

  // Format timestamps to Cairo time display
  const formatted = agents.map((a) => ({
    ...a,
    timestamp: a.timestamp
      ? formatTimestamp(a.timestamp)
      : null,
  }));

  return NextResponse.json({ agents: formatted });
}

function formatTimestamp(raw: string): string {
  try {
    // raw is either "YYYY-MM-DD" or "YYYY-MM-DD HH:MM"
    const d = new Date(raw.length === 10 ? raw + "T00:00:00" : raw);
    if (isNaN(d.getTime())) return raw;
    return d.toLocaleDateString("en-GB", {
      timeZone: "Africa/Cairo",
      day: "numeric",
      month: "short",
    }) + (raw.length > 10 ? " " + d.toLocaleTimeString("en-GB", {
      timeZone: "Africa/Cairo",
      hour: "2-digit",
      minute: "2-digit",
    }) : "");
  } catch {
    return raw;
  }
}
