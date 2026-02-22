"use client";

import { useEffect, useState, useCallback } from "react";

type SyncStatus = "synced" | "syncing" | "error";

interface SyncState {
  status: SyncStatus;
  lastSync: string | null;
}

const STATUS_COLORS: Record<SyncStatus, string> = {
  synced: "#34D399",
  syncing: "#FBBF24",
  error: "#F87171",
};

const STATUS_LABELS: Record<SyncStatus, string> = {
  synced: "Synced",
  syncing: "Syncing…",
  error: "Sync error",
};

function formatLastSync(iso: string | null): string {
  if (!iso) return "Never";
  try {
    const date = new Date(iso);
    return date.toLocaleString("en-GB", {
      timeZone: "Africa/Cairo",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  } catch {
    return "Unknown";
  }
}

export default function SyncIndicator() {
  const [state, setState] = useState<SyncState>({
    status: "synced",
    lastSync: null,
  });
  const [showTooltip, setShowTooltip] = useState(false);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/sync/status");
      if (!res.ok) {
        setState((prev) => ({ ...prev, status: "error" }));
        return;
      }
      const data = await res.json();
      setState({ status: data.status, lastSync: data.lastSync });
    } catch {
      setState((prev) => ({ ...prev, status: "error" }));
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30_000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  const color = STATUS_COLORS[state.status];
  const label = STATUS_LABELS[state.status];

  return (
    <div
      style={{ position: "relative", display: "inline-flex", alignItems: "center" }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Dot wrapper */}
      <div
        style={{
          position: "relative",
          width: "10px",
          height: "10px",
          cursor: "default",
        }}
      >
        {/* Ping ring — only for synced/syncing */}
        {state.status !== "error" && (
          <span
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              backgroundColor: color,
              opacity: 0,
              animation: "sync-ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite",
            }}
          />
        )}
        {/* Core dot */}
        <span
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: "50%",
            backgroundColor: color,
            animation:
              state.status === "syncing"
                ? "sync-pulse 1s ease-in-out infinite"
                : "none",
          }}
        />
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div
          style={{
            position: "absolute",
            right: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "#0D1220",
            border: "1px solid #1E2D45",
            borderRadius: "8px",
            padding: "8px 12px",
            whiteSpace: "nowrap",
            zIndex: 100,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: color,
              marginBottom: "2px",
            }}
          >
            {label}
          </div>
          <div style={{ fontSize: "11px", color: "#8888A0" }}>
            Last sync: {formatLastSync(state.lastSync)}{" "}
            <span style={{ color: "#A0A0B0" }}>(Cairo)</span>
          </div>
        </div>
      )}
    </div>
  );
}
