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
      {/* Sections */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* 1. Model Routing — full width */}
        <ModelRouting />

        {/* 2. GitHub Backup + Sync Engine — side by side on wider screens */}
        <div className="settings-2col" style={{ gap: "16px" }}>
          <style>{`
            .settings-2col { display: grid; grid-template-columns: 1fr 1fr; }
            @media (max-width: 768px) {
              .settings-2col { grid-template-columns: 1fr; }
            }
          `}</style>
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
