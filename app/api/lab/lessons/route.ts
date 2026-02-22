import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

const WORKSPACE = path.join(os.homedir(), ".openclaw/workspace");
const LESSONS_PATH = path.join(WORKSPACE, "memory/lessons-learned.md");
const MEMORY_PATH = path.join(WORKSPACE, "MEMORY.md");

interface LessonEntry {
  date: string;
  missed: string[];
  why: string[];
  fix: string[];
  source: "file" | "memory";
}

function parseLessonsFile(content: string): LessonEntry[] {
  const entries: LessonEntry[] = [];

  // Split by ## date headings
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

    // Parse What I Missed
    const missed = extractSubSection(sectionText, "### What I Missed");
    // Parse Why
    const why = extractSubSection(sectionText, "### Why");
    // Parse Fix
    const fix = extractSubSection(sectionText, "### Fix");

    if (missed.length > 0 || why.length > 0 || fix.length > 0) {
      entries.push({ date, missed, why, fix, source: "file" });
    }
  }

  return entries.reverse(); // Most recent first
}

function extractSubSection(sectionText: string, heading: string): string[] {
  const idx = sectionText.indexOf(heading);
  if (idx === -1) return [];

  const afterHeading = sectionText.indexOf("\n", idx) + 1;
  const nextSubIdx = sectionText.slice(afterHeading).search(/\n###/);
  const block = nextSubIdx !== -1
    ? sectionText.slice(afterHeading, afterHeading + nextSubIdx)
    : sectionText.slice(afterHeading);

  return block
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.match(/^(\d+\.|-)/) && !l.startsWith("```"))
    .map(l => l.replace(/^(\d+\.|-)[\s]*/, "").trim())
    .filter(l => l.length > 0);
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

function parseMemoryLessonsAsEntries(section: string): LessonEntry[] {
  return section
    .split("\n")
    .map(l => l.trim())
    .filter(l => l.startsWith("- ") && l.includes(":"))
    .map(l => {
      const clean = l.replace(/^- /, "").trim();
      const dateMatch = clean.match(/^(\d{4}-\d{2}-\d{2}):\s*/);
      const date = dateMatch ? dateMatch[1] : "2026";
      const afterDate = dateMatch ? clean.slice(dateMatch[0].length) : clean;

      const fixMatch = afterDate.match(/\n?\s*Fix:\s*(.+)/i);
      const mainText = fixMatch ? afterDate.slice(0, afterDate.indexOf("Fix:")).trim() : afterDate.trim();
      const fixText = fixMatch ? fixMatch[1].trim() : "";

      return {
        date,
        missed: [mainText],
        why: [],
        fix: fixText ? [fixText] : [],
        source: "memory" as const,
      };
    })
    .filter(e => e.missed[0].length > 0);
}

export async function GET() {
  const entries: LessonEntry[] = [];

  // 1. Parse lessons-learned.md
  try {
    const content = fs.readFileSync(LESSONS_PATH, "utf-8");
    entries.push(...parseLessonsFile(content));
  } catch {
    // ignore
  }

  // 2. Parse MEMORY.md lessons section
  try {
    const memContent = fs.readFileSync(MEMORY_PATH, "utf-8");
    const lessonsSection = extractSection(memContent, "## 📚 Lessons Learned");
    const memEntries = parseMemoryLessonsAsEntries(lessonsSection);
    entries.push(...memEntries);
  } catch {
    // ignore
  }

  // Sort by date descending
  entries.sort((a, b) => b.date.localeCompare(a.date));

  return NextResponse.json({ entries });
}
