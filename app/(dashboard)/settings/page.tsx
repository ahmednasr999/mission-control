"use client";

import ModelRouting from "@/components/settings/ModelRouting";
import GitStatus from "@/components/settings/GitStatus";
import SyncControl from "@/components/settings/SyncControl";
import MemoryIndex from "@/components/settings/MemoryIndex";
import WorkspaceStats from "@/components/settings/WorkspaceStats";

export default function SettingsPage() {
  return (
    <div
      style={{
        padding: "32px",
        background: "#080C16",
        minHeight: "100vh",
      }}
    >
      {/* Page Header */}
      <div style={{ marginBottom: "24px" }}>
        <h2
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "28px",
            fontWeight: 700,
            color: "#F0F0F5",
            letterSpacing: "-0.03em",
            marginBottom: "6px",
            margin: 0,
          }}
        >
          Settings
        </h2>
        <p
          style={{
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            fontSize: "13px",
            color: "#555570",
            margin: "6px 0 0",
          }}
        >
          System configuration, backups, and diagnostics
        </p>
      </div>

      {/* Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* 1. Model Routing — full width */}
        <ModelRouting />

        {/* 2. GitHub Backup + Sync Engine — side by side on wider screens */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "16px",
          }}
        >
          <GitStatus />
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <SyncControl />
            <MemoryIndex />
          </div>
        </div>

        {/* 5. Workspace Statistics — full width */}
        <WorkspaceStats />
      </div>
    </div>
  );
}
