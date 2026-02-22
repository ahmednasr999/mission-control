/**
 * app/api/sync/route.ts
 *
 * GET  /api/sync → Returns sync status (last sync time, file count, row counts)
 * POST /api/sync → Triggers manual full sync
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSyncStatus, syncAll, syncFile } from '../../../lib/sync/index';

// Force dynamic rendering — we need real-time DB data
export const dynamic = 'force-dynamic';

/**
 * GET /api/sync
 * Returns current sync status: last sync time, row counts per table, file sync history
 */
export async function GET(): Promise<NextResponse> {
  try {
    const status = getSyncStatus();

    return NextResponse.json({
      success: true,
      status: status.status,
      lastSync: status.lastFullSync,
      cronIntervalMs: status.cronIntervalMs,
      rowCounts: status.rowCounts,
      files: status.files,
    });
  } catch (err: any) {
    console.error('[api/sync] GET error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to get sync status' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sync
 * Triggers a manual full sync (or single-file sync if `file` is provided in body)
 *
 * Body (optional): { file?: string }
 * - If `file` is provided: sync only that file path
 * - Otherwise: full sync of all memory files
 */
export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    let body: { file?: string } = {};
    try {
      body = await req.json();
    } catch {
      // No body or invalid JSON — use defaults
    }

    let result: { totalRows?: number; filesProcessed?: number; errors?: string[]; rows?: number };

    if (body.file) {
      // Single-file sync
      const rows = await syncFile(body.file);
      result = { rows };
    } else {
      // Full sync
      const syncResult = await syncAll();
      result = syncResult;
    }

    // Get updated status after sync
    const status = getSyncStatus();

    return NextResponse.json({
      success: true,
      triggered: body.file ? 'file' : 'full',
      file: body.file || null,
      result,
      status: status.status,
      lastSync: status.lastFullSync,
      rowCounts: status.rowCounts,
      files: status.files,
    });
  } catch (err: any) {
    console.error('[api/sync] POST error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Sync failed' },
      { status: 500 }
    );
  }
}
