import { NextResponse } from "next/server";
import { getGatewayCrons } from "@/lib/gateway-client";

interface CronInfo {
  id: string;
  name: string;
  schedule: string;
  lastRun: string | null;
  nextRun: string | null;
  enabled: boolean;
}

export async function GET(): Promise<NextResponse> {
  try {
    const crons = await getGatewayCrons();

    const formattedCrons: CronInfo[] = crons.map((cron) => ({
      id: cron.id || "unknown",
      name: cron.name || "Unnamed Cron",
      schedule: cron.schedule || "unknown",
      lastRun: cron.lastRun ? new Date(cron.lastRun).toISOString() : null,
      nextRun: cron.nextRun ? new Date(cron.nextRun).toISOString() : null,
      enabled: cron.enabled ?? true,
    }));

    return NextResponse.json({ crons: formattedCrons });
  } catch {
    return NextResponse.json({ crons: [] });
  }
}
