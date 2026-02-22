import DashboardShell from "@/components/DashboardShell";

// Phase 2: DashboardShell handles mobile sidebar state (client-side).
// Sidebar collapses to hamburger menu on screens < 768px.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
