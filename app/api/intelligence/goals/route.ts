// DATA SOURCE: markdown (primary) — reads directly from GOALS.md
// No SQLite dependency; parses markdown on every request.
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

const GOALS_PATH = path.join(os.homedir(), ".openclaw/workspace/GOALS.md");

interface Objective {
  text: string;
  done: boolean;
}

interface Category {
  name: string;
  objectives: Objective[];
  progress: number;
}

interface Metric {
  goal: string;
  metric: string;
  current: string;
  target: string;
}

interface GoalsResponse {
  categories: Category[];
  metrics: Metric[];
}

function parseGoals(content: string): { categories: Category[]; metrics: Metric[] } {
  const categories: Category[] = [];
  const metrics: Metric[] = [];

  // Find the Q1 Strategic Objectives section
  const q1Idx = content.indexOf("🟡 Strategic Objectives");
  if (q1Idx !== -1) {
    // Find start and end of this section
    const sectionStart = content.indexOf("\n", q1Idx) + 1;
    // End at next ## heading
    const nextH2 = content.slice(sectionStart).search(/\n## /);
    const sectionEnd = nextH2 !== -1 ? sectionStart + nextH2 : content.length;
    const section = content.slice(sectionStart, sectionEnd);

    // Split into ### subsections
    const subSections = section.split(/\n###\s+/);
    for (const sub of subSections) {
      if (!sub.trim()) continue;
      const lines = sub.split("\n");
      const name = lines[0].trim();
      if (!name) continue;

      const objectives: Objective[] = [];
      for (const line of lines.slice(1)) {
        const checkedMatch = line.match(/^[-*]\s+\[([xX ])\]\s+(.+)/);
        if (checkedMatch) {
          objectives.push({
            text: checkedMatch[2].replace(/✅$/, "").trim(),
            done: checkedMatch[1].toLowerCase() === "x",
          });
        }
      }

      if (objectives.length > 0) {
        const doneCount = objectives.filter(o => o.done).length;
        const progress = Math.round((doneCount / objectives.length) * 100);
        categories.push({ name, objectives, progress });
      }
    }
  }

  // Parse Success Metrics table
  const metricsIdx = content.indexOf("📏 Success Metrics");
  if (metricsIdx !== -1) {
    const tableStart = content.indexOf("|", metricsIdx);
    if (tableStart !== -1) {
      const tableSection = content.slice(tableStart);
      const tableLines = tableSection.split("\n");
      let headerSeen = false;
      let separatorSeen = false;

      for (const line of tableLines) {
        const trimmed = line.trim();
        if (!trimmed.startsWith("|")) break;
        const cells = trimmed.split("|").map(c => c.trim()).filter(Boolean);
        if (!headerSeen) {
          headerSeen = true;
          continue;
        }
        if (!separatorSeen && cells.some(c => /^-+$/.test(c))) {
          separatorSeen = true;
          continue;
        }
        if (cells.length >= 4) {
          metrics.push({
            goal: cells[0],
            metric: cells[1],
            current: cells[2],
            target: cells[3],
          });
        }
      }
    }
  }

  return { categories, metrics };
}

export async function GET(): Promise<NextResponse<GoalsResponse>> {
  try {
    const content = fs.readFileSync(GOALS_PATH, "utf-8");
    const { categories, metrics } = parseGoals(content);
    return NextResponse.json({ categories, metrics });
  } catch {
    return NextResponse.json({ categories: [], metrics: [] });
  }
}
