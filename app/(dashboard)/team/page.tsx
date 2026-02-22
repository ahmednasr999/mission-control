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
