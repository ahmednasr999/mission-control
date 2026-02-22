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

  return NextResponse.json({
    memoryFiles: memoryFiles || "0",
    memorySize: memorySizeRaw || "—",
    sessionFiles: sessionFiles || "0",
    agentCount: agentCountRaw || "0",
    dailyLogs: dailyLogs || "0",
    workspaceSize: workspaceSizeRaw || "—",
  });
}
