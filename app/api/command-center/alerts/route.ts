import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const GOALS_PATH = path.join(
  process.env.HOME || "/root",
  ".openclaw/workspace/GOALS.md"
);

interface Alert {
  text: string;
  deadline: string;
  severity: "red" | "amber" | "yellow";
}

// DATA SOURCE: markdown (primary) — reads directly from GOALS.md
// No SQLite dependency; runs on every request.

/**
 * Parse GOALS.md for deadlines within 7 days (Cairo time).
 * Severity: red = < 24h, amber = < 48h, yellow = < 7 days.
 * Phase 2: Expanded from 48h to 7-day window.
 */
function parseAlerts(): Alert[] {
  try {
    if (!fs.existsSync(GOALS_PATH)) return [];
    const content = fs.readFileSync(GOALS_PATH, "utf-8");
    const alerts: Alert[] = [];

    const now = new Date();
    const cairoNow = new Date(
      now.toLocaleString("en-US", { timeZone: "Africa/Cairo" })
    );
    // Phase 2: Expanded from 48h to 7 days
    const in7Days = new Date(cairoNow.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Match table rows with pipe separators (Markdown tables)
    const tableRowRegex = /\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]+)\|([^|]*)\|/g;
    let match: RegExpExecArray | null;

    while ((match = tableRowRegex.exec(content)) !== null) {
      const cells = match.slice(1).map((c) => c.trim());
      const fullRow = cells.join(" | ");

      // Look for date patterns in all cells
      const datePatterns = [
        /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2}),?\s+(\d{4})\b/gi,
        /\b(\d{4})-(\d{2})-(\d{2})\b/g,
      ];

      for (const pattern of datePatterns) {
        const dateMatch = pattern.exec(fullRow);
        if (!dateMatch) continue;

        let deadline: Date | null = null;
        try {
          deadline = new Date(dateMatch[0]);
        } catch {
          continue;
        }
        if (!deadline || isNaN(deadline.getTime())) continue;

        const diffMs = deadline.getTime() - cairoNow.getTime();
        if (diffMs > 0 && deadline <= in7Days) {
          // Find descriptive text — use first non-empty, non-header cell
          const taskText =
            cells.find(
              (c) =>
                c.length > 2 &&
                !/^-+$/.test(c) &&
                !/^Company$/i.test(c) &&
                !/^Role$/i.test(c)
            ) || "Deadline";

          const hoursLeft = Math.round(diffMs / (1000 * 60 * 60));
          let severity: "red" | "amber" | "yellow" = "yellow";
          if (hoursLeft <= 24) severity = "red";
          else if (hoursLeft <= 48) severity = "amber";

          alerts.push({
            text: taskText,
            deadline: deadline.toLocaleDateString("en-GB", {
              timeZone: "Africa/Cairo",
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            severity,
          });
        }
      }
    }

    // Also scan checklist items with embedded dates
    const checklistRegex =
      /[-*]\s+\[[ xX]\]\s+(.+?)\s*[\(（]?(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{1,2})[,，]?\s+(\d{4})[\)）]?/gi;
    let clMatch: RegExpExecArray | null;
    while ((clMatch = checklistRegex.exec(content)) !== null) {
      try {
        const taskText = clMatch[1].trim();
        const dateStr = `${clMatch[2]} ${clMatch[3]}, ${clMatch[4]}`;
        const deadline = new Date(dateStr);
        if (isNaN(deadline.getTime())) continue;

        const diffMs = deadline.getTime() - cairoNow.getTime();
        if (diffMs > 0 && deadline <= in7Days) {
          const hoursLeft = Math.round(diffMs / (1000 * 60 * 60));
          let severity: "red" | "amber" | "yellow" = "yellow";
          if (hoursLeft <= 24) severity = "red";
          else if (hoursLeft <= 48) severity = "amber";

          alerts.push({
            text: taskText,
            deadline: deadline.toLocaleDateString("en-GB", {
              timeZone: "Africa/Cairo",
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            severity,
          });
        }
      } catch {
        // skip malformed
      }
    }

    // Deduplicate by text
    const seen = new Set<string>();
    return alerts.filter((a) => {
      const key = a.text + a.deadline;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch {
    return [];
  }
}

export async function GET() {
  const alerts = parseAlerts();
  return NextResponse.json({ alerts });
}
