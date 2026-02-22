import { NextResponse } from "next/server";
import { syncAll } from "@/lib/sync";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await syncAll();
    return NextResponse.json({
      success: true,
      message: `Synced ${result.filesProcessed} files, ${result.totalRows} rows`,
      timestamp: new Date().toISOString(),
      errors: result.errors.length > 0 ? result.errors : undefined,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
