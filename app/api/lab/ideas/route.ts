import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

const WORKSPACE = path.join(os.homedir(), ".openclaw/workspace");
const SECOND_BRAIN_PATH = path.join(WORKSPACE, "memory/second_brain.md");

const AGENT_KEYWORDS: Record<string, string> = {
  ADHAM: "🎯",
  HEIKAL: "🔍",
  MAHER: "🔬",
  LOTFI: "✍️",
  NASR: "🧠",
};

function detectAgent(title: string, content: string): string | undefined {
  const combined = (title + " " + content).toUpperCase();
  for (const [name, emoji] of Object.entries(AGENT_KEYWORDS)) {
    if (combined.includes(name)) return `${emoji} ${name}`;
  }
  return undefined;
}

interface Section {
  title: string;
  content: string;
  agent?: string;
}

function parseSecondBrain(content: string): Section[] {
  const sections: Section[] = [];
  // Split by ## headings (not ### sub-headings)
  const lines = content.split("\n");
  let currentTitle = "";
  let currentLines: string[] = [];
  let inSection = false;

  for (const line of lines) {
    if (line.startsWith("## ") && !line.startsWith("### ")) {
      if (inSection && currentTitle) {
        const sectionContent = currentLines.join("\n").trim();
        if (sectionContent.length > 20) {
          sections.push({
            title: currentTitle,
            content: sectionContent,
            agent: detectAgent(currentTitle, sectionContent),
          });
        }
      }
      currentTitle = line.replace(/^## /, "").trim();
      currentLines = [];
      inSection = true;
    } else if (inSection) {
      currentLines.push(line);
    }
  }

  // Push the last section
  if (inSection && currentTitle) {
    const sectionContent = currentLines.join("\n").trim();
    if (sectionContent.length > 20) {
      sections.push({
        title: currentTitle,
        content: sectionContent,
        agent: detectAgent(currentTitle, sectionContent),
      });
    }
  }

  return sections;
}

export async function GET() {
  try {
    const content = fs.readFileSync(SECOND_BRAIN_PATH, "utf-8");
    const sections = parseSecondBrain(content);
    return NextResponse.json({ sections });
  } catch {
    return NextResponse.json({ sections: [] });
  }
}
