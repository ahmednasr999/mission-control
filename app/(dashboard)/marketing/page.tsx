import MarketingKanban from "@/components/marketing/MarketingKanban";
import MarketingArchive from "@/components/marketing/MarketingArchive";

export default function MarketingPage() {
  return (
    <div style={{ padding: "32px" }}>

      {/* Content kanban board */}
      <MarketingKanban />

      {/* Archive section */}
      <MarketingArchive />
    </div>
  );
}
