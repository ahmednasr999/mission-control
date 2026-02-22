import HRKanban from "@/components/hr/HRKanban";
import CVHistoryTable from "@/components/hr/CVHistoryTable";
import ArchiveSection from "@/components/hr/ArchiveSection";

export default function HRPage() {
  return (
    <div style={{ padding: "24px 32px 40px" }}>
      {/* Subtitle */}
      <p
        style={{
          fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          fontSize: "13px",
          color: "#555570",
          marginBottom: "24px",
          marginTop: "0",
        }}
      >
        Job pipeline, applications, and CV history
      </p>

      {/* Kanban Board */}
      <HRKanban />

      {/* CV History Table */}
      <CVHistoryTable />

      {/* Archive Section */}
      <ArchiveSection />
    </div>
  );
}
