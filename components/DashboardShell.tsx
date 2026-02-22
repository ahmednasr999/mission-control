"use client";

/**
 * DashboardShell — Client wrapper for the dashboard layout.
 * Phase 2: Handles mobile sidebar toggle state.
 * - Desktop (≥768px): Sidebar always visible
 * - Mobile (<768px): Sidebar hidden behind hamburger toggle
 */

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import { SidebarContext } from "@/lib/sidebar-context";

// ---- Shell ----

interface DashboardShellProps {
  children: React.ReactNode;
}

export default function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false); // reset when going back to desktop
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
        {/* Sidebar — always visible on desktop, slide-in on mobile */}
        <div
          style={{
            position: isMobile ? "fixed" : "relative",
            top: 0,
            left: 0,
            height: "100vh",
            zIndex: isMobile ? 50 : "auto",
            transform: isMobile ? (sidebarOpen ? "translateX(0)" : "translateX(-100%)") : "none",
            transition: isMobile ? "transform 0.25s ease" : "none",
            flexShrink: 0,
          }}
        >
          <Sidebar />
        </div>

        {/* Mobile overlay backdrop */}
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

        {/* Main content area */}
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
