"use client";

interface Agent {
  name: string;
  emoji: string;
  lastAction: string;
  timestamp: string | null;
}

interface AgentActivityProps {
  agents: Agent[];
  loading?: boolean;
}

export default function AgentActivity({ agents, loading }: AgentActivityProps) {
  return (
    <div
      style={{
        background: "#0D1220",
        border: "1px solid #1E2D45",
        borderRadius: "10px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px 20px 14px",
          borderBottom: "1px solid #1E2D45",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "13px",
            fontWeight: 700,
            color: "#F0F0F5",
          }}
        >
          Agent Activity
        </span>
        <span
          style={{
            fontSize: "11px",
            color: "#555570",
            fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
          }}
        >
          CREW
        </span>
      </div>

      {/* Agents */}
      <div style={{ flex: 1 }}>
        {loading ? (
          <EmptyState message="Loading…" />
        ) : !agents || agents.length === 0 ? (
          <EmptyState message="No agents configured" />
        ) : (
          agents.map((agent, i) => {
            const hasActivity = agent.timestamp !== null;
            return (
              <div
                key={agent.name}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "12px 20px",
                  borderBottom:
                    i < agents.length - 1 ? "1px solid #1E2D45" : "none",
                }}
              >
                {/* Agent avatar */}
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "8px",
                    background: hasActivity
                      ? "linear-gradient(135deg, rgba(79, 142, 247, 0.2), rgba(124, 58, 237, 0.2))"
                      : "rgba(30, 45, 69, 0.5)",
                    border: `1px solid ${hasActivity ? "#1E2D45" : "#1E2D45"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "16px",
                    flexShrink: 0,
                  }}
                >
                  {agent.emoji}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      gap: "8px",
                      marginBottom: "2px",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--font-syne, Syne, sans-serif)",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: hasActivity ? "#F0F0F5" : "#555570",
                        letterSpacing: "0.03em",
                      }}
                    >
                      {agent.name}
                    </span>
                    {agent.timestamp && (
                      <span
                        style={{
                          fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                          fontSize: "10px",
                          color: "#555570",
                        }}
                      >
                        {agent.timestamp}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                      fontSize: "12px",
                      color: hasActivity ? "#8888A0" : "#555570",
                      lineHeight: "1.4",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={agent.lastAction}
                  >
                    {agent.lastAction}
                  </div>
                </div>

                {/* Active indicator */}
                <div
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: hasActivity ? "#34D399" : "#1E2D45",
                    marginTop: "4px",
                    flexShrink: 0,
                  }}
                />
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div
      style={{
        padding: "32px 20px",
        textAlign: "center",
        color: "#555570",
        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
        fontSize: "13px",
      }}
    >
      {message}
    </div>
  );
}
