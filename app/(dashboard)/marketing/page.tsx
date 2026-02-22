import MarketingKanban from "@/components/marketing/MarketingKanban";
import MarketingArchive from "@/components/marketing/MarketingArchive";

export default function MarketingPage() {
  return (
    <div style={{ padding: "32px" }}>
      {/* Page header */}
      <div style={{ marginBottom: "24px" }}>
        <h2
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "28px",
            fontWeight: 700,
            color: "#F0F0F5",
            letterSpacing: "-0.03em",
            marginBottom: "6px",
          }}
        >
          Marketing
        </h2>
        <p
          style={{
            color: "#555570",
            fontSize: "13px",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          }}
        >
          Content pipeline, drafts, and publishing tracker
        </p>
      </div>

      {/* Content kanban board */}
      <MarketingKanban />

      {/* Archive section */}
      <MarketingArchive />
    </div>
  );
}
