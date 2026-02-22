"use client";

/**
 * DashboardShell — Client wrapper for the dashboard layout.
 * Phase 2: Collapsible sidebar on all screen sizes.
 * - Hamburger always visible
 * - Sidebar collapsed by default, toggle to open
 * - Content stretches to fill available space when sidebar is hidden
 */

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { SidebarContext } from "@/lib/sidebar-context";

// ---- Shell ----

interface DashboardShellProps {
  children: React.ReactNode;
}

const SIDEBAR_WIDTH = 220;

export default function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = useCallback(() => setSidebarOpen((o) => !o), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <SidebarContext.Provider value={{ sidebarOpen, toggleSidebar, closeSidebar }}>
      <div
        style={{
          display: "flex",
          height: "100vh",
          overflow: "hidden",
          background: "#080C16",
          position: "relative",
        }}
      >
        {/* Sidebar — collapsible on all screen sizes */}
        <div
          style={{
            position: isMobile ? "fixed" : "relative",
            top: 0,
            left: 0,
            height: "100vh",
            width: sidebarOpen ? SIDEBAR_WIDTH : 0,
            zIndex: isMobile ? 50 : "auto",
            transition: "width 0.25s ease",
            flexShrink: 0,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: SIDEBAR_WIDTH,
              height: "100vh",
              transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
              transition: "transform 0.25s ease",
            }}
          >
            <Sidebar />
          </div>
        </div>

        {/* Overlay backdrop — mobile only */}
        {isMobile && sidebarOpen && (
          <div
            onClick={closeSidebar}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0, 0, 0, 0.6)",
              zIndex: 40,
            }}
          />
        )}

        {/* Main content area — stretches to fill when sidebar hidden */}
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
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
