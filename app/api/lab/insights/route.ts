import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

const WORKSPACE = path.join(os.homedir(), ".openclaw/workspace");
const MEMORY_PATH = path.join(WORKSPACE, "MEMORY.md");

interface Win {
  text: string;
  date?: string;
}

interface Mistake {
  date: string;
  text: string;
  fix?: string;
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

function parseWins(section: string): Win[] {
  const wins: Win[] = [];
  const lines = section.split("\n").map(l => l.trim()).filter(l => l.startsWith("- "));

  for (const line of lines) {
    const clean = line.replace(/^- /, "").trim();
    if (!clean) continue;

    // Try extract trailing date like "(Feb 21, 2026)"
    const dateMatch = clean.match(/\(([A-Za-z]+ \d{1,2},?\s*\d{4})\)\s*$/);
    const text = dateMatch ? clean.slice(0, clean.lastIndexOf(dateMatch[0])).trim() : clean;
    wins.push({
      text: text.replace(/✅$/, "").trim(),
      date: dateMatch ? dateMatch[1] : undefined,
    });
  }

  // Return most recent first (reversed, since file has oldest at top)
  return wins.filter(w => w.text.length > 0).reverse().slice(0, 10);
}

function parseLessons(section: string): Mistake[] {
  const mistakes: Mistake[] = [];
  const lines = section.split("\n").map(l => l.trim()).filter(l => l.startsWith("- "));

  for (const line of lines) {
    const clean = line.replace(/^- /, "").trim();
    if (!clean) continue;

    const dateMatch = clean.match(/^(\d{4}-\d{2}-\d{2}):\s*/);
    const date = dateMatch ? dateMatch[1] : "";
    const afterDate = dateMatch ? clean.slice(dateMatch[0].length) : clean;

    // Extract Fix if present (after "Fix:" or "\n  Fix:")
    const fixMatch = afterDate.match(/Fix:\s*(.+?)(?:\n|$)/i);
    const mainText = fixMatch
      ? afterDate.slice(0, afterDate.indexOf("Fix:")).trim()
      : afterDate.trim();

    mistakes.push({
      date,
      text: mainText.replace(/\s*\n\s*/g, " ").trim(),
      fix: fixMatch ? fixMatch[1].trim() : undefined,
    });
  }

  // Most recent first
  return mistakes.filter(m => m.text.length > 0).reverse().slice(0, 10);
}

export async function GET() {
  try {
    const content = fs.readFileSync(MEMORY_PATH, "utf-8");

    const winsSection = extractSection(content, "## ✅ Completed Milestones");
    const lessonsSection = extractSection(content, "## 📚 Lessons Learned");

    const wins = parseWins(winsSection);
    const mistakes = parseLessons(lessonsSection);

    return NextResponse.json({ wins, mistakes });
  } catch {
    return NextResponse.json({ wins: [], mistakes: [] });
  }
}
