// DATA SOURCE: filesystem — reads workspace directory stats via shell commands
// No SQLite dependency; uses du/find/ls for real-time stats.
// Phase 2: Added file growth trend (file count over last 7 days).
import { NextResponse } from "next/server";
import { execSync } from "child_process";

export const dynamic = "force-dynamic";

function run(cmd: string): string {
  try {
    return execSync(cmd, { timeout: 15000, encoding: "utf-8", shell: "/bin/bash" }).trim();
  } catch {
    return "";
  }
}

export async function GET() {
  const home = process.env.HOME || "/root";
  const workspace = `${home}/.openclaw/workspace`;
  const memory = `${workspace}/memory`;
  const sessions = `${home}/.openclaw/agents/main/sessions`;
  const agents = `${home}/.openclaw/agents`;

  const year = new Date().getFullYear();

  const memoryFiles = run(`find "${memory}" -name "*.md" 2>/dev/null | wc -l`);
  const memorySizeRaw = run(`du -sh "${memory}" 2>/dev/null | cut -f1`);
  const sessionFiles = run(`find "${sessions}" -name "*.jsonl" 2>/dev/null | wc -l`);
  const agentCountRaw = run(`ls -d "${agents}/*/" 2>/dev/null | wc -l`);
  const dailyLogs = run(`find "${memory}" -name "${year}-*.md" 2>/dev/null | wc -l`);
  const workspaceSizeRaw = run(`du -sh "${workspace}" 2>/dev/null | cut -f1`);

  // Phase 2: File growth trend — count files added each day over last 7 days
  const fileGrowthTrend: string[] = [];
  try {
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      // Count files modified on this date (approximate: use find -newermt)
      const countCmd = i === 0
        ? `find "${memory}" -name "*.md" -newer "${memory}" 2>/dev/null | wc -l`
        : `find "${memory}" -name "*.md" -newermt "${dateStr} 00:00:00" -not -newermt "${dateStr} 23:59:59" 2>/dev/null | wc -l`;
      const count = run(countCmd) || "0";
      fileGrowthTrend.push(`${dateStr.slice(5)}:${count.trim()}`);
    }
  } catch {
    // leave empty
  }

  return NextResponse.json({
    memoryFiles: memoryFiles || "0",
    memorySize: memorySizeRaw || "—",
    sessionFiles: sessionFiles || "0",
    agentCount: agentCountRaw || "0",
    dailyLogs: dailyLogs || "0",
    workspaceSize: workspaceSizeRaw || "—",
    fileGrowthTrend,
  });
}
