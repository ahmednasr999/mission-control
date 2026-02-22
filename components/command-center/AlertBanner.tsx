"use client";

interface Alert {
  text: string;
  deadline: string;
  severity: "red" | "amber" | "yellow";
}

interface AlertBannerProps {
  alerts: Alert[];
}

export default function AlertBanner({ alerts }: AlertBannerProps) {
  if (!alerts || alerts.length === 0) return null;

  const topAlert = alerts[0];

  // Color schemes per severity
  const colorSchemes = {
    red: {
      bg: "linear-gradient(135deg, rgba(220, 38, 38, 0.25), rgba(185, 28, 28, 0.15))",
      border: "rgba(220, 38, 38, 0.5)",
      dot: "#EF4444",
      text: "#FCA5A5",
      subtext: "#F87171",
      emoji: "🔴",
      label: "URGENT",
    },
    amber: {
      bg: "linear-gradient(135deg, rgba(217, 119, 6, 0.25), rgba(180, 83, 9, 0.15))",
      border: "rgba(217, 119, 6, 0.5)",
      dot: "#F59E0B",
      text: "#FCD34D",
      subtext: "#FDE68A",
      emoji: "🟠",
      label: "SOON",
    },
    yellow: {
      bg: "linear-gradient(135deg, rgba(202, 138, 4, 0.15), rgba(161, 98, 7, 0.1))",
      border: "rgba(202, 138, 4, 0.4)",
      dot: "#EAB308",
      text: "#FDE047",
      subtext: "#FEF08A",
      emoji: "🟡",
      label: "UPCOMING",
    },
  };

  const colors = colorSchemes[topAlert.severity];

  return (
    <div
      style={{
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: "8px",
        padding: "10px 16px",
        marginBottom: "16px",
        display: "flex",
        alignItems: "center",
        gap: "10px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Pulse dot */}
      <span style={{ position: "relative", display: "inline-flex" }}>
        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: colors.dot,
            display: "block",
            animation: topAlert.severity === "red" ? "pulse 1.5s ease-in-out infinite" : "none",
            flexShrink: 0,
          }}
        />
      </span>

      <div style={{ flex: 1, minWidth: 0 }}>
        <span
          style={{
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            fontSize: "13px",
            color: colors.text,
            fontWeight: 600,
          }}
        >
          {colors.emoji}&nbsp;
          {topAlert.text}
          <span
            style={{
              color: colors.subtext,
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
              color: colors.text,
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
          color: colors.text,
          opacity: 0.6,
          whiteSpace: "nowrap",
        }}
      >
        {colors.label}
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
