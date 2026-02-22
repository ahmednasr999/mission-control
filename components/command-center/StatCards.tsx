"use client";

interface Stats {
  activeJobs: number;
  avgAts: number | null;
  contentDue: number;
  openTasks: number;
}

interface StatCardProps {
  value: string | number;
  label: string;
  color: string;
  glow: string;
}

function StatCard({ value, label, color, glow }: StatCardProps) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 0,
        background: "#0D1220",
        border: "1px solid #1E2D45",
        borderRadius: "10px",
        padding: "20px 20px 18px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Subtle glow blob */}
      <div
        style={{
          position: "absolute",
          top: "-20px",
          right: "-20px",
          width: "80px",
          height: "80px",
          borderRadius: "50%",
          background: glow,
          filter: "blur(30px)",
          opacity: 0.35,
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          fontFamily: "var(--font-syne, Syne, sans-serif)",
          fontSize: "28px",
          fontWeight: 700,
          background: color,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          lineHeight: 1.1,
          marginBottom: "6px",
          letterSpacing: "-0.03em",
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          fontSize: "11px",
          color: "#555570",
          fontWeight: 500,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
        }}
      >
        {label}
      </div>
    </div>
  );
}

interface StatCardsProps {
  stats: Stats | null;
  loading?: boolean;
}

export default function StatCards({ stats, loading }: StatCardsProps) {
  const cards = [
    {
      value: loading ? "—" : stats?.activeJobs ?? 0,
      label: "Active Applications",
      color: "linear-gradient(135deg, #4F8EF7, #60A5FA)",
      glow: "#4F8EF7",
    },
    {
      value: loading
        ? "—"
        : stats?.avgAts != null
        ? `${stats.avgAts}%`
        : "N/A",
      label: "Avg ATS Score",
      color: "linear-gradient(135deg, #7C3AED, #A78BFA)",
      glow: "#7C3AED",
    },
    {
      value: loading ? "—" : stats?.contentDue ?? 0,
      label: "Content Due",
      color: "linear-gradient(135deg, #D97706, #FBBF24)",
      glow: "#D97706",
    },
    {
      value: loading ? "—" : stats?.openTasks ?? 0,
      label: "Open Tasks",
      color: "linear-gradient(135deg, #059669, #34D399)",
      glow: "#059669",
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        gap: "16px",
        marginBottom: "20px",
      }}
    >
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
