"use client";

import { useState } from "react";
import AgentHierarchy from "@/components/team/AgentHierarchy";
import ChatLog from "@/components/team/ChatLog";
import RunHistory from "@/components/team/RunHistory";

const AGENT_META: Record<string, { name: string; emoji: string; role: string }> = {
  main: { name: "NASR", emoji: "🎯", role: "Strategic Consultant" },
  "cv-optimizer": { name: "ADHAM", emoji: "📄", role: "CV Optimization" },
  "job-hunter": { name: "HEIKAL", emoji: "🔍", role: "Job Hunting" },
  researcher: { name: "MAHER", emoji: "🔬", role: "Research" },
  "content-creator": { name: "LOTFI", emoji: "✍️", role: "Content Creation" },
};

export default function TeamPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const agentInfo = selectedAgent ? AGENT_META[selectedAgent] : null;

  return (
    <div style={{ padding: "32px", maxWidth: "100%" }}>
      {/* Page header */}
      <div style={{ marginBottom: "28px" }}>
        <h2
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "28px",
            fontWeight: 700,
            color: "#F0F0F5",
            letterSpacing: "-0.03em",
            margin: 0,
          }}
        >
          TEAM
        </h2>
        <p
          style={{
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            fontSize: "13px",
            color: "#555570",
            marginTop: "6px",
            marginBottom: 0,
          }}
        >
          Agent hierarchy, sessions, and sub-agent runs
        </p>
      </div>

      {/* 1. Agent Hierarchy Diagram */}
      <AgentHierarchy
        selectedAgent={selectedAgent}
        onSelectAgent={setSelectedAgent}
      />

      {/* 2. Chat Log Panel — only visible when an agent is selected */}
      {selectedAgent && agentInfo && (
        <ChatLog
          key={selectedAgent}
          agentId={selectedAgent}
          agentName={agentInfo.name}
          agentEmoji={agentInfo.emoji}
        />
      )}

      {/* 3. Sub-Agent Run History — always visible */}
      <RunHistory />
    </div>
  );
}
