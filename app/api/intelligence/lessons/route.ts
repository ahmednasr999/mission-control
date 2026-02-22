import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

const WORKSPACE = path.join(os.homedir(), ".openclaw/workspace");
const MEMORY_PATH = path.join(WORKSPACE, "MEMORY.md");
const LESSONS_PATH = path.join(WORKSPACE, "memory/lessons-learned.md");

interface Mistake {
  date: string;
  text: string;
  fix?: string;
}

interface Win {
  text: string;
  date?: string;
}

interface LessonsResponse {
  mistakes: Mistake[];
  wins: Win[];
}

function extractSection(content: string, startMarker: string): string {
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) return "";
  const afterStart = content.indexOf("\n", startIdx) + 1;
  const nextSection = content.slice(afterStart).search(/\n## /);
  return nextSection !== -1
    ? content.slice(afterStart, afterStart + nextSection)
    : content.slice(afterStart);
}

function parseLessonsFile(content: string): Mistake[] {
  const mistakes: Mistake[] = [];
  // Parse date sections like "## 2026-02-17"
  const dateSectionRegex = /^## (\d{4}-\d{2}-\d{2})/gm;
  const sections: { date: string; start: number }[] = [];

  let m: RegExpExecArray | null;
  while ((m = dateSectionRegex.exec(content)) !== null) {
    sections.push({ date: m[1], start: m.index });
  }

  for (let si = 0; si < sections.length; si++) {
    const { date, start } = sections[si];
    const end = si + 1 < sections.length ? sections[si + 1].start : content.length;
    const sectionText = content.slice(start, end);

    // Find "What I Missed" block
    const missedIdx = sectionText.indexOf("### What I Missed");
    if (missedIdx === -1) continue;
    const afterMissed = sectionText.indexOf("\n", missedIdx) + 1;
    const nextSubIdx = sectionText.slice(afterMissed).search(/\n###/);
    const missedBlock = nextSubIdx !== -1
      ? sectionText.slice(afterMissed, afterMissed + nextSubIdx)
      : sectionText.slice(afterMissed);

    // Find "Fix" block
    const fixIdx = sectionText.indexOf("### Fix");
    let fixes: string[] = [];
    if (fixIdx !== -1) {
      const afterFix = sectionText.indexOf("\n", fixIdx) + 1;
      const nextAfterFix = sectionText.slice(afterFix).search(/\n###/);
      const fixBlock = nextAfterFix !== -1
        ? sectionText.slice(afterFix, afterFix + nextAfterFix)
        : sectionText.slice(afterFix);
      fixes = fixBlock
        .split("\n")
        .map(l => l.trim())
        .filter(l => /^\d+\./.test(l))
        .map(l => l.replace(/^\d+\.\s*/, "").trim());
    }

    const items = missedBlock
      .split("\n")
      .map(l => l.trim())
      .filter(l => /^\d+\./.test(l))
      .map((l, idx) => l.replace(/^\d+\.\s*/, "").trim());

    items.forEach((text, idx) => {
      if (text) {
        mistakes.push({
          date,
          text,
          fix: fixes[idx] || undefined,
        });
      }
    });
  }

  return mistakes;
}

function parseMemoryLessons(section: string): Mistake[] {
  return section
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.startsWith("- ") && l.includes(":"))
    .map(l => {
      const clean = l.replace(/^- /, "");
      const dateMatch = clean.match(/^(\d{4}-\d{2}-\d{2}):\s*/);
      const date = dateMatch ? dateMatch[1] : "";
      const text = dateMatch ? clean.slice(dateMatch[0].length) : clean;
      // extract Fix if present
      const fixMatch = text.match(/Fix:\s*(.+)/i);
      const mainText = fixMatch ? text.slice(0, text.indexOf("Fix:")).trim() : text.trim();
      return {
        date,
        text: mainText.replace(/\s*\n\s*/g, " ").trim(),
        fix: fixMatch ? fixMatch[1].trim() : undefined,
      };
    })
    .filter(m => m.text.length > 0);
}

function parseWins(section: string): Win[] {
  return section
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.startsWith("- "))
    .map(l => {
      const clean = l.replace(/^- /, "");
      // Try extract trailing date like "(Feb 21, 2026)"
      const dateMatch = clean.match(/\(([A-Za-z]+ \d{1,2},?\s*\d{4})\)\s*$/);
      const text = dateMatch ? clean.slice(0, clean.lastIndexOf(dateMatch[0])).trim() : clean.trim();
      return {
        text: text.replace(/✅$/, "").trim(),
        date: dateMatch ? dateMatch[1] : undefined,
      };
    })
    .filter(w => w.text.length > 0);
}

export async function GET(): Promise<NextResponse<LessonsResponse>> {
  const mistakes: Mistake[] = [];
  const wins: Win[] = [];

  // 1. Parse lessons-learned.md
  try {
    const llContent = fs.readFileSync(LESSONS_PATH, "utf-8");
    const llMistakes = parseLessonsFile(llContent);
    mistakes.push(...llMistakes);
  } catch {
    // ignore
  }

  // 2. Parse MEMORY.md
  try {
    const memContent = fs.readFileSync(MEMORY_PATH, "utf-8");

    // "📚 Lessons Learned" section
    const lessonsSection = extractSection(memContent, "## 📚 Lessons Learned");
    const memMistakes = parseMemoryLessons(lessonsSection);
    mistakes.push(...memMistakes);

    // "✅ Completed Milestones" section
    const winsSection = extractSection(memContent, "## ✅ Completed Milestones");
    const parsedWins = parseWins(winsSection);
    wins.push(...parsedWins);
  } catch {
    // ignore
  }

  return NextResponse.json({ mistakes, wins });
}
