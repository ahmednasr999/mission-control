// DATA SOURCE: markdown (primary) — reads MEMORY.md directly
// No SQLite dependency for this route; real-time markdown parse.
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

const MEMORY_PATH = path.join(os.homedir(), ".openclaw/workspace/MEMORY.md");

interface Agent {
  name: string;
  role: string;
  status: string;
}

interface HighlightsResponse {
  priorities: string[];
  identity: string[];
  agents: Agent[];
}

function extractSection(content: string, startMarker: string, endMarker?: string): string {
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) return "";
  const afterStart = content.indexOf("\n", startIdx) + 1;
  if (endMarker) {
    const endIdx = content.indexOf(endMarker, afterStart);
    return endIdx !== -1 ? content.slice(afterStart, endIdx) : content.slice(afterStart);
  }
  // Find next ## heading
  const nextSection = content.slice(afterStart).search(/\n## /);
  return nextSection !== -1
    ? content.slice(afterStart, afterStart + nextSection)
    : content.slice(afterStart);
}

function parseBulletList(section: string): string[] {
  return section
    .split("\n")
    .map(l => l.trim())
    .filter(l => /^[\d\-*]/.test(l))
    .map(l => l.replace(/^\d+\.\s*/, "").replace(/^[-*]\s*/, "").trim())
    .filter(l => l.length > 0 && !l.startsWith("*(") && !l.startsWith("*Last"));
}

function parseAgentTable(section: string): Agent[] {
  const lines = section.split("\n");
  const agents: Agent[] = [];
  let inTable = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("|") && !trimmed.startsWith("| Agent") && !trimmed.startsWith("|---") && !trimmed.startsWith("| ---")) {
      const cells = trimmed.split("|").map(c => c.trim()).filter(Boolean);
      if (cells.length >= 3) {
        inTable = true;
        agents.push({
          name: cells[0],
          role: cells[1],
          status: cells[2],
        });
      }
    } else if (inTable && !trimmed.startsWith("|")) {
      break;
    }
  }
  return agents;
}

export async function GET(): Promise<NextResponse<HighlightsResponse>> {
  try {
    const content = fs.readFileSync(MEMORY_PATH, "utf-8");

    // 1. Current Strategic Priorities
    const prioritiesSection = extractSection(content, "## 🎯 Current Strategic Priorities");
    const priorities = parseBulletList(prioritiesSection);

    // 2. Who Ahmed Is
    const identitySection = extractSection(content, "## 🧠 Who Ahmed Is");
    const identity = parseBulletList(identitySection);

    // 3. AI Automation Ecosystem → agent table
    const agentsSection = extractSection(content, "## 🤖 AI Automation Ecosystem");
    const agents = parseAgentTable(agentsSection);

    return NextResponse.json({ priorities, identity, agents });
  } catch {
    return NextResponse.json({ priorities: [], identity: [], agents: [] });
  }
}
