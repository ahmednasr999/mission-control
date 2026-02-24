import { NextResponse } from "next/server";
import { execSync } from "child_process";
import fs from "fs";

interface DiskHealth {
  used: number;
  total: number;
  available: number;
  usagePercent: number;
  status: "healthy" | "warning" | "action" | "critical";
  lastCheck: string;
}

function getStatus(percent: number): DiskHealth["status"] {
  if (percent >= 85) return "critical";
  if (percent >= 75) return "action";
  if (percent >= 60) return "warning";
  return "healthy";
}

export async function GET() {
  try {
    // Get disk info
    const dfOutput = execSync("df -h /", { encoding: "utf-8" });
    const lines = dfOutput.trim().split("\n");
    const lastLine = lines[lines.length - 1];
    const parts = lastLine.split(/\s+/);
    
    const total = parseFloat(parts[1]);
    const used = parseFloat(parts[2]);
    const available = parseFloat(parts[3]);
    const usagePercent = parseInt(parts[4]);

    // Get last health check from log
    let lastLogEntry = "No checks recorded";
    try {
      if (fs.existsSync("/tmp/disk-health.log")) {
        const logContent = fs.readFileSync("/tmp/disk-health.log", "utf-8");
        const logLines = logContent.trim().split("\n");
        lastLogEntry = logLines[logLines.length - 1] || lastLogEntry;
      }
    } catch {
      // Log file might not exist
    }

    const health: DiskHealth = {
      used,
      total,
      available,
      usagePercent,
      status: getStatus(usagePercent),
      lastCheck: new Date().toISOString(),
    };

    return NextResponse.json({
      ...health,
      lastLogEntry,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get disk health" },
      { status: 500 }
    );
  }
}
