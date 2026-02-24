// DATA SOURCE: MEMORY.md (direct file read — DB table is unreliable)
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

function extractSection(content: string, heading: string): string {
  // Match any ## heading that contains the search string
  const lines = content.split("\n");
  let inSection = false;
  const result: string[] = [];

  for (const line of lines) {
    if (line.startsWith("## ") && line.includes(heading)) {
      inSection = true;
      continue;
    }
    // Stop at next ## heading
    if (inSection && line.startsWith("## ")) break;
    if (inSection) result.push(line);
  }

  return result.join("\n");
}

export async function GET(): Promise<NextResponse<HighlightsResponse>> {
  try {
    const raw = fs.readFileSync(MEMORY_PATH, "utf-8");

    // --- Priorities ---
    const prioritiesSection = extractSection(raw, "Current Strategic Priorities");
    const priorities = prioritiesSection
      .split("\n")
      .filter(l => /^[\d\-*]/.test(l.trim()))
      .map(l => l.replace(/^[\d.)\-*]\s*/, "").replace(/\*\*/g, "").trim())
      .filter(Boolean)
      .slice(0, 6);

    // --- Identity ---
    const identitySection = extractSection(raw, "Who Ahmed Is");
    const identity = identitySection
      .split("\n")
      .filter(l => /^[\-*]/.test(l.trim()))
      .map(l => l.replace(/^[-*]\s*/, "").replace(/\*\*/g, "").trim())
      .filter(Boolean)
      .slice(0, 6);

    // --- Agents ---
    const agentsSection = extractSection(raw, "AI Automation Ecosystem");
    const agentLines = agentsSection.split("\n").filter(l => l.includes("|"));
    const agents: Agent[] = [];
    for (const line of agentLines) {
      const cells = line.split("|").map(c => c.trim()).filter(Boolean);
      if (
        cells.length >= 3 &&
        !cells[0].includes("Agent") &&
        !cells[0].includes("---") &&
        !cells[0].includes("Role")
      ) {
        agents.push({ name: cells[0], role: cells[1], status: cells[2] });
      }
    }

    return NextResponse.json({ priorities, identity, agents });
  } catch {
    return NextResponse.json({ priorities: [], identity: [], agents: [] });
  }
}
