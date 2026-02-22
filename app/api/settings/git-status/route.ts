import { NextResponse } from "next/server";
import { execSync } from "child_process";

export const dynamic = "force-dynamic";

function run(cmd: string, cwd: string): string {
  try {
    return execSync(cmd, { cwd, timeout: 10000, encoding: "utf-8" }).trim();
  } catch {
    return "";
  }
}

export async function GET() {
  const repoDir = `${process.env.HOME || "/root"}/.openclaw/workspace`;

  const remote = run("git remote get-url origin", repoDir) || null;
  const connected = !!remote;

  const logRaw = run('git log -5 --format="%H|%s|%ai"', repoDir);
  const commits = logRaw
    ? logRaw
        .split("\n")
        .filter(Boolean)
        .map((line) => {
          const [hash, message, date] = line.split("|");
          return { hash: hash?.slice(0, 8), message, date };
        })
    : [];

  return NextResponse.json({ remote, commits, connected });
}
