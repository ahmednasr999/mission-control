"use client";

interface Alert {
  text: string;
  deadline: string;
  severity: "red" | "amber";
}

interface AlertBannerProps {
  alerts: Alert[];
}

export default function AlertBanner({ alerts }: AlertBannerProps) {
  if (!alerts || alerts.length === 0) return null;

  const topAlert = alerts[0];
  const isRed = topAlert.severity === "red";

  return (
    <div
      style={{
        background: isRed
          ? "linear-gradient(135deg, rgba(220, 38, 38, 0.25), rgba(185, 28, 28, 0.15))"
          : "linear-gradient(135deg, rgba(217, 119, 6, 0.25), rgba(180, 83, 9, 0.15))",
        border: `1px solid ${isRed ? "rgba(220, 38, 38, 0.5)" : "rgba(217, 119, 6, 0.5)"}`,
        borderRadius: "10px",
        padding: "12px 20px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Pulse dot */}
      <span style={{ position: "relative", display: "inline-flex" }}>
        <span
          style={{
            width: "10px",
            height: "10px",
            borderRadius: "50%",
            background: isRed ? "#EF4444" : "#F59E0B",
            display: "block",
            animation: "pulse 1.5s ease-in-out infinite",
            flexShrink: 0,
          }}
        />
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            fontSize: "13px",
            color: isRed ? "#FCA5A5" : "#FCD34D",
            fontWeight: 600,
          }}
        >
          {isRed ? "🔴" : "🟡"}&nbsp;
          {topAlert.text}
          <span
            style={{
              color: isRed ? "#F87171" : "#FDE68A",
              fontWeight: 400,
              marginLeft: "8px",
            }}
          >
            — due {topAlert.deadline}
          </span>
        </span>

        {alerts.length > 1 && (
          <span
            style={{
              marginLeft: "12px",
              fontSize: "11px",
              color: isRed ? "#FCA5A5" : "#FCD34D",
              opacity: 0.7,
            }}
          >
            +{alerts.length - 1} more deadline{alerts.length > 2 ? "s" : ""}
          </span>
        )}
      </div>

      <span
        style={{
          fontSize: "10px",
          fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
          color: isRed ? "#FCA5A5" : "#FCD34D",
          opacity: 0.6,
          whiteSpace: "nowrap",
        }}
      >
        URGENT
      </span>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}
