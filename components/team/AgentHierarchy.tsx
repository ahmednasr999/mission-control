"use client";

import { useEffect, useState } from "react";
import AgentCard from "./AgentCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface AgentInfo {
  id: string;
  name: string;
  emoji: string;
  role: string;
  lastActive: string | null;
  isActive: boolean;
  sessionCount: number;
}

interface AgentHierarchyProps {
  selectedAgent: string | null;
  onSelectAgent: (id: string | null) => void;
}

const SUB_AGENT_IDS = ["cv-optimizer", "job-hunter", "researcher", "content-creator"];

export default function AgentHierarchy({
  selectedAgent,
  onSelectAgent,
}: AgentHierarchyProps) {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/team/agents")
      .then(r => r.json())
      .then(d => setAgents(d.agents || []))
      .catch(() => setAgents([]))
      .finally(() => setLoading(false));
  }, []);

  const defaultAgents: AgentInfo[] = [
    { id: "main", name: "NASR", emoji: "🎯", role: "Strategic Consultant", lastActive: null, isActive: false, sessionCount: 0 },
    { id: "cv-optimizer", name: "ADHAM", emoji: "📄", role: "CV Optimization", lastActive: null, isActive: false, sessionCount: 0 },
    { id: "job-hunter", name: "HEIKAL", emoji: "🔍", role: "Job Hunting", lastActive: null, isActive: false, sessionCount: 0 },
    { id: "researcher", name: "MAHER", emoji: "🔬", role: "Research", lastActive: null, isActive: false, sessionCount: 0 },
    { id: "content-creator", name: "LOTFI", emoji: "✍️", role: "Content Creation", lastActive: null, isActive: false, sessionCount: 0 },
  ];

  const displayAgents = loading ? defaultAgents : (agents.length > 0 ? agents : defaultAgents);
  const mainAgent = displayAgents.find(a => a.id === "main") || defaultAgents[0];
  const subAgents = SUB_AGENT_IDS.map(
    id => displayAgents.find(a => a.id === id) || defaultAgents.find(a => a.id === id)!
  );

  function handleClick(id: string) {
    onSelectAgent(selectedAgent === id ? null : id);
  }

  return (
    <Card style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px", padding: "28px 24px", marginBottom: "20px" }}>
      <CardHeader className="pb-0" style={{ padding: 0, marginBottom: "24px" }}>
        <CardTitle
          className="text-sm font-semibold"
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "13px",
            fontWeight: 700,
            color: "#A0A0B0",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Agent Hierarchy
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "0" }}>
          <div style={{ width: "220px" }}>
            <AgentCard
              {...mainAgent}
              isMain
              isSelected={selectedAgent === "main"}
              onClick={() => handleClick("main")}
            />
          </div>
        </div>

        <div style={{ position: "relative", height: "48px", overflow: "visible" }}>
          <svg
            width="100%"
            height="48"
            style={{ display: "block", overflow: "visible" }}
            preserveAspectRatio="none"
          >
            <line
              x1="50%"
              y1="0"
              x2="50%"
              y2="20"
              stroke="#1E2D45"
              strokeWidth="1.5"
            />
            <line
              x1="12.5%"
              y1="20"
              x2="87.5%"
              y2="20"
              stroke="#1E2D45"
              strokeWidth="1.5"
            />
            {[12.5, 37.5, 62.5, 87.5].map((x, i) => (
              <line
                key={i}
                x1={`${x}%`}
                y1="20"
                x2={`${x}%`}
                y2="48"
                stroke="#1E2D45"
                strokeWidth="1.5"
              />
            ))}
          </svg>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "12px",
          }}
        >
          {subAgents.map(agent => (
            <AgentCard
              key={agent.id}
              {...agent}
              isMain={false}
              isSelected={selectedAgent === agent.id}
              onClick={() => handleClick(agent.id)}
            />
          ))}
        </div>

        <div
          style={{
            marginTop: "16px",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            fontSize: "11px",
            color: "#A0A0B0",
            textAlign: "center",
          }}
        >
          Click an agent to view their session history
        </div>
      </CardContent>
    </Card>
  );
}
