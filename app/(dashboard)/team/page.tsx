"use client";

import { useState } from "react";
import AgentHierarchy from "@/components/team/AgentHierarchy";
import ChatLog from "@/components/team/ChatLog";
import RunHistory from "@/components/team/RunHistory";
import TeamStatus from "@/components/team/TeamStatus";

const AGENT_META: Record<string, { label: string; emoji: string; role: string }> = {
  main: { label: "NASR", emoji: "🎯", role: "Strategic Consultant" },
  "cv-optimizer": { label: "CV Optimizer", emoji: "📄", role: "ADHAM" },
  "job-hunter": { label: "Job Hunter", emoji: "🔍", role: "HEIKAL" },
  researcher: { label: "Research", emoji: "🔬", role: "MAHER" },
  "content-creator": { label: "Content / LinkedIn", emoji: "✍️", role: "LOTFI" },
};

export default function TeamPage() {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);

  const agentInfo = selectedAgent ? AGENT_META[selectedAgent] : null;

  return (
    <div style={{ padding: "32px", maxWidth: "100%" }}>
      <TeamStatus />
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
          agentName={agentInfo.label}
          agentEmoji={agentInfo.emoji}
        />
      )}

      {/* 3. Sub-Agent Run History — always visible */}
      <RunHistory />
    </div>
  );
}
