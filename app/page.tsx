import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";

export default function CommandCenterPage() {
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        background: "#080C16",
      }}
    >
      <Sidebar />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minWidth: 0,
        }}
      >
        <Topbar />
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            background: "#080C16",
            padding: "32px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "flex-start",
          }}
        >
          <div>
            <h2
              style={{
                fontFamily: "var(--font-syne, Syne, sans-serif)",
                fontSize: "28px",
                fontWeight: 700,
                color: "#F0F0F5",
                letterSpacing: "-0.03em",
                marginBottom: "8px",
              }}
            >
              Command Center
            </h2>
            <p style={{ color: "#555570", fontSize: "14px" }}>
              Mission overview and quick actions will appear here.
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
