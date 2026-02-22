"use client";

interface Goal {
  category: string;
  objective: string;
  progress: number;
  status: string;
}

function ProgressBar({ progress, status }: { progress: number; status: string }) {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  const barColor =
    status === "complete"
      ? "linear-gradient(90deg, #059669, #34D399)"
      : clampedProgress >= 60
      ? "linear-gradient(90deg, #4F8EF7, #7C3AED)"
      : clampedProgress >= 30
      ? "linear-gradient(90deg, #D97706, #FBBF24)"
      : "linear-gradient(90deg, #A0A0B0, #8888A0)";

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          height: "5px",
          borderRadius: "3px",
          background: "#1E2D45",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${clampedProgress}%`,
            background: barColor,
            borderRadius: "3px",
            transition: "width 0.5s ease",
          }}
        />
      </div>
    </div>
  );
}

interface GoalsProgressProps {
  goals: Goal[];
  loading?: boolean;
}

export default function GoalsProgress({ goals, loading }: GoalsProgressProps) {
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
          Q1 Goals
        </span>
        <span
          style={{
            fontSize: "11px",
            color: "#A0A0B0",
            fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
          }}
        >
          2026
        </span>
      </div>

      {/* Goals list */}
      <div style={{ padding: "16px 20px" }}>
        {loading ? (
          <div
            style={{
              textAlign: "center",
              color: "#A0A0B0",
              fontSize: "13px",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              padding: "16px 0",
            }}
          >
            Loading…
          </div>
        ) : !goals || goals.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#A0A0B0",
              fontSize: "13px",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              padding: "16px 0",
            }}
          >
            No goals data yet
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {goals.map((goal, i) => (
              <div key={i}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                    marginBottom: "5px",
                    gap: "8px",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: "10px",
                        fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                        color: "#A0A0B0",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        display: "block",
                        marginBottom: "2px",
                      }}
                    >
                      {goal.category}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                        fontSize: "12px",
                        color: "#8888A0",
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={goal.objective}
                    >
                      {goal.objective}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-syne, Syne, sans-serif)",
                      fontSize: "13px",
                      fontWeight: 700,
                      color:
                        goal.progress >= 80
                          ? "#34D399"
                          : goal.progress >= 40
                          ? "#4F8EF7"
                          : "#8888A0",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {goal.progress}%
                  </span>
                </div>
                <ProgressBar progress={goal.progress} status={goal.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
