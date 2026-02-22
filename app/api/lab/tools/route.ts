// DATA SOURCE: hardcoded list (primary) + markdown scan (secondary)
// Hardcoded tools are in HARDCODED_ADOPT/TRIAL/REJECT arrays below.
// Secondary: scans /workspace/memory/second_brain.md for additional tools.
// No SQLite dependency.
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import os from "os";

const WORKSPACE = path.join(os.homedir(), ".openclaw/workspace");
const SECOND_BRAIN_PATH = path.join(WORKSPACE, "memory/second_brain.md");

interface Tool {
  name: string;
  description: string;
  category: string;
  /** Phase 2: evaluation date string e.g. "Feb 2026" */
  evaluatedAt?: string;
}

const HARDCODED_ADOPT: Tool[] = [
  { name: "Himalaya", description: "Email client — Gmail fully automated via CLI", category: "Communication", evaluatedAt: "Feb 2026" },
  { name: "GitHub CLI", description: "Version control & workspace backup (2 repos)", category: "DevOps", evaluatedAt: "Jan 2026" },
  { name: "Brave Search", description: "Primary web search — fast, privacy-first", category: "Research", evaluatedAt: "Feb 2026" },
  { name: "Memory System", description: "Markdown-based long-term memory with semantic search", category: "AI", evaluatedAt: "Feb 2026" },
  { name: "ATS Engine (ADHAM)", description: "5-step CV optimizer — 90+ ATS scores proven", category: "HR", evaluatedAt: "Feb 2026" },
  { name: "better-sqlite3", description: "Local SQLite — fast, zero-config persistent storage", category: "Database", evaluatedAt: "Feb 2026" },
];

const HARDCODED_TRIAL: Tool[] = [
  { name: "MCP Servers", description: "Model Context Protocol — testing for tool integration", category: "AI", evaluatedAt: "Feb 2026" },
  { name: "Notion API", description: "Evaluating as structured knowledge base alternative", category: "Productivity", evaluatedAt: "Jan 2026" },
  { name: "LinkedIn Automation", description: "LOTFI-driven post scheduling — 2-3x/week cadence", category: "Marketing", evaluatedAt: "Feb 2026" },
  { name: "Todoist", description: "Testing as task frontend for active-tasks.md", category: "Productivity", evaluatedAt: "Jan 2026" },
  { name: "Google Analytics", description: "Web profile tracking — early evaluation stage", category: "Analytics", evaluatedAt: "Feb 2026" },
];

const HARDCODED_REJECT: Tool[] = [
  { name: "M2.1 Models", description: "Deprecated — superseded by M2.5 at same cost tier", category: "AI", evaluatedAt: "Feb 2026" },
  { name: "airllm.md", description: "Removed — dense keywords polluted memory_search results", category: "AI", evaluatedAt: "Feb 2026" },
];

function scanForExtraTools(content: string): { adopt: Tool[]; trial: Tool[]; reject: Tool[] } {
  const adopt: Tool[] = [];
  const trial: Tool[] = [];
  const reject: Tool[] = [];

  // Look for tool patterns: "Adopt", "Trial", "Reject" near tool names
  const adoptPattern = /(?:adopt|✅|proven|in use)[:\s]+([A-Z][a-zA-Z\s\-]{2,30})/gi;
  const trialPattern = /(?:trial|testing|evaluating)[:\s]+([A-Z][a-zA-Z\s\-]{2,30})/gi;
  const rejectPattern = /(?:reject|deprecated|removed|avoid)[:\s]+([A-Z][a-zA-Z\s\-]{2,30})/gi;

  const allKnown = [
    ...HARDCODED_ADOPT.map(t => t.name.toLowerCase()),
    ...HARDCODED_TRIAL.map(t => t.name.toLowerCase()),
    ...HARDCODED_REJECT.map(t => t.name.toLowerCase()),
  ];

  let m: RegExpExecArray | null;

  while ((m = adoptPattern.exec(content)) !== null) {
    const name = m[1].trim();
    if (!allKnown.includes(name.toLowerCase()) && name.length > 3) {
      adopt.push({ name, description: "Found in second brain knowledge base", category: "Tool" });
      allKnown.push(name.toLowerCase());
    }
  }

  while ((m = trialPattern.exec(content)) !== null) {
    const name = m[1].trim();
    if (!allKnown.includes(name.toLowerCase()) && name.length > 3) {
      trial.push({ name, description: "Mentioned as under evaluation", category: "Tool" });
      allKnown.push(name.toLowerCase());
    }
  }

  while ((m = rejectPattern.exec(content)) !== null) {
    const name = m[1].trim();
    if (!allKnown.includes(name.toLowerCase()) && name.length > 3) {
      reject.push({ name, description: "Mentioned as rejected or deprecated", category: "Tool" });
      allKnown.push(name.toLowerCase());
    }
  }

  return { adopt, trial, reject };
}

export async function GET() {
  const adopt = [...HARDCODED_ADOPT];
  const trial = [...HARDCODED_TRIAL];
  const reject = [...HARDCODED_REJECT];

  try {
    const content = fs.readFileSync(SECOND_BRAIN_PATH, "utf-8");
    const extra = scanForExtraTools(content);
    adopt.push(...extra.adopt);
    trial.push(...extra.trial);
    reject.push(...extra.reject);
  } catch {
    // ignore — use hardcoded only
  }

  return NextResponse.json({ adopt, trial, reject });
}
