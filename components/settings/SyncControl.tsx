"use client";

/**
 * SyncControl — Phase 2 updates:
 * - Shows data source active status (markdown vs DB)
 * - Improved last sync timestamp display
 * - Source clarity section
 */

import { useState, useEffect, useCallback } from "react";

interface SyncStatus {
  status: string;
  lastSync: string;
  rowCounts?: Record<string, number>;
  files?: Array<{ name: string; rows: number; status: string; syncedAt: string }>;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("en-GB", {
      timeZone: "Africa/Cairo",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}

function DataSourceBadge({ source, active }: { source: string; active: boolean }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      gap: "8px",
      padding: "8px 14px",
      background: active ? "rgba(79,142,247,0.1)" : "rgba(255,255,255,0.02)",
      border: `1px solid ${active ? "rgba(79,142,247,0.35)" : "#1E2D45"}`,
      borderRadius: "8px",
      flex: 1,
      minWidth: 0,
    }}>
      <span style={{
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: active ? "#4F8EF7" : "#555570",
        flexShrink: 0,
        boxShadow: active ? "0 0 6px #4F8EF799" : "none",
      }} />
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          fontSize: "12px",
          fontWeight: 700,
          color: active ? "#F0F0F5" : "#555570",
          marginBottom: "1px",
        }}>{source}</div>
        <div style={{
          fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          fontSize: "10px",
          color: active ? "#4F8EF7" : "#555570",
        }}>
          {active ? "ACTIVE" : "SUPPLEMENTAL"}
        </div>
      </div>
    </div>
  );
}

export default function SyncControl() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [lastTrigger, setLastTrigger] = useState<string | null>(null);
  const [triggerMsg, setTriggerMsg] = useState<string | null>(null);

  const fetchStatus = useCallback(() => {
    fetch("/api/sync/status")
      .then((r) => r.json())
      .then(setSyncStatus)
      .catch(() => setSyncStatus(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleTrigger = async () => {
    setTriggering(true);
    setTriggerMsg(null);
    try {
      const res = await fetch("/api/settings/sync-trigger", { method: "POST" });
      const data = await res.json();
      setLastTrigger(new Date().toISOString());
      setTriggerMsg(data.message || "Sync triggered");
      fetchStatus();
    } catch {
      setTriggerMsg("Failed to trigger sync");
    } finally {
      setTimeout(() => setTriggering(false), 1500);
    }
  };

  const statusColor =
    syncStatus?.status === "synced"
      ? "#34D399"
      : syncStatus?.status === "syncing"
      ? "#FBBF24"
      : "#F87171";

  // Determine if DB has data (sync has occurred)
  const dbHasData = syncStatus?.rowCounts
    ? Object.values(syncStatus.rowCounts).some((v) => v > 0)
    : false;

  return (
    <div
      style={{
        background: "#0D1220",
        border: "1px solid #1E2D45",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid #1E2D45",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{
          fontFamily: "var(--font-syne, Syne, sans-serif)",
          fontSize: "16px",
          fontWeight: 700,
          color: "#F0F0F5",
        }}>
          Sync Engine
        </span>
        {!loading && syncStatus && (
          <span style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            fontSize: "12px",
            color: statusColor,
            textTransform: "capitalize",
          }}>
            <span style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: statusColor,
              boxShadow: `0 0 6px ${statusColor}99`,
              flexShrink: 0,
            }} />
            {syncStatus.status}
          </span>
        )}
      </div>

      <div style={{ padding: "20px" }}>
        {loading ? (
          <div style={{
            color: "#555570",
            fontSize: "13px",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            padding: "20px 0",
            textAlign: "center",
          }}>
            Loading sync status…
          </div>
        ) : (
          <>
            {/* Data source indicators — Phase 2 */}
            <div style={{ marginBottom: "16px" }}>
              <div style={{
                fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                fontSize: "10px",
                color: "#555570",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "8px",
              }}>
                Active Data Sources
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <DataSourceBadge source="Markdown (canonical)" active={true} />
                <DataSourceBadge source="SQLite DB (cache)" active={dbHasData} />
              </div>
              <div style={{
                marginTop: "8px",
                fontSize: "11px",
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                color: "#555570",
              }}>
                {dbHasData
                  ? "✅ DB in sync — markdown is canonical, DB provides enriched data"
                  : "⚠️ DB empty — markdown-only mode. Trigger a sync to populate DB."}
              </div>
            </div>

            {/* Last sync info */}
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "20px",
              flexWrap: "wrap",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{
                    fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                    fontSize: "10px",
                    color: "#555570",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    minWidth: "80px",
                  }}>
                    Last Sync
                  </span>
                  <span style={{
                    fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                    fontSize: "12px",
                    color: "#8888A0",
                  }}>
                    {syncStatus?.lastSync ? formatDate(syncStatus.lastSync) : "—"}
                  </span>
                </div>
                {lastTrigger && (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{
                      fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                      fontSize: "10px",
                      color: "#555570",
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      minWidth: "80px",
                    }}>
                      Triggered
                    </span>
                    <span style={{
                      fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                      fontSize: "12px",
                      color: "#34D399",
                    }}>
                      {formatDate(lastTrigger)} — {triggerMsg}
                    </span>
                  </div>
                )}
              </div>

              {/* Trigger Button */}
              <button
                onClick={handleTrigger}
                disabled={triggering}
                style={{
                  background: triggering
                    ? "rgba(79,142,247,0.15)"
                    : "linear-gradient(135deg, #4F8EF7, #7C3AED)",
                  border: "none",
                  borderRadius: "8px",
                  padding: "10px 20px",
                  fontFamily: "var(--font-syne, Syne, sans-serif)",
                  fontSize: "13px",
                  fontWeight: 700,
                  color: "#fff",
                  cursor: triggering ? "not-allowed" : "pointer",
                  opacity: triggering ? 0.7 : 1,
                  transition: "opacity 0.2s",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flexShrink: 0,
                }}
              >
                {triggering ? (
                  <>
                    <span style={{
                      display: "inline-block",
                      width: "10px",
                      height: "10px",
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }} />
                    Syncing…
                  </>
                ) : (
                  "⟳ Trigger Sync"
                )}
              </button>
            </div>

            {/* DB Row counts (if available) */}
            {syncStatus?.rowCounts && dbHasData && (
              <div style={{
                marginTop: "16px",
                paddingTop: "16px",
                borderTop: "1px solid #1E2D45",
              }}>
                <div style={{
                  fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                  fontSize: "10px",
                  color: "#555570",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  marginBottom: "8px",
                }}>
                  DB Row Counts
                </div>
                <div style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "6px",
                }}>
                  {Object.entries(syncStatus.rowCounts)
                    .filter(([, count]) => count > 0)
                    .map(([table, count]) => (
                      <span key={table} style={{
                        fontSize: "11px",
                        fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                        color: "#8888A0",
                        background: "rgba(136,136,160,0.08)",
                        border: "1px solid #1E2D45",
                        borderRadius: "4px",
                        padding: "2px 8px",
                        whiteSpace: "nowrap",
                      }}>
                        {table}: <span style={{ color: "#F0F0F5", fontWeight: 600 }}>{count}</span>
                      </span>
                    ))
                  }
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
