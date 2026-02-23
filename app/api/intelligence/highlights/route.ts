// DATA SOURCE: SQLite DB (primary) — synced from MEMORY.md
// Canonical source: MEMORY.md → synced to DB every 15s
import { NextResponse } from "next/server";
import { getMemoryHighlights } from "@/lib/command-center-db";

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

export async function GET(): Promise<NextResponse<HighlightsResponse>> {
  try {
    const highlights = getMemoryHighlights();
    
    const priorities: string[] = [];
    const identity: string[] = [];
    const agents: Agent[] = [];

    for (const h of highlights) {
      const section = (h.category || h.title || "") as string;
      const content = (h.content || "") as string;
      
      if (section.includes("Current Strategic Priorities") || section.includes("🎯")) {
        // Parse bullet list
        const lines = content.split("\n").filter(l => /^[\d\-*]/.test(l.trim()));
        priorities.push(...lines.map(l => l.replace(/^[\d\-*]\s*/, "").replace(/^[-*]\s*/, "").trim()).filter(Boolean));
      } else if (section.includes("Who Ahmed Is") || section.includes("🧠")) {
        const lines = content.split("\n").filter(l => /^[\d\-*]/.test(l.trim()));
        identity.push(...lines.map(l => l.replace(/^[\d\-*]\s*/, "").replace(/^[-*]\s*/, "").trim()).filter(Boolean));
      } else if (section.includes("AI Automation Ecosystem") || section.includes("🤖")) {
        // Parse agent table
        const lines = content.split("\n").filter(l => l.includes("|"));
        for (const line of lines) {
          const cells = line.split("|").map(c => c.trim()).filter(Boolean);
          if (cells.length >= 3 && !cells[0].includes("Agent") && !cells[0].includes("---")) {
            agents.push({ name: cells[0], role: cells[1], status: cells[2] });
          }
        }
      }
    }

    return NextResponse.json({ priorities, identity, agents });
  } catch {
    return NextResponse.json({ priorities: [], identity: [], agents: [] });
  }
}
