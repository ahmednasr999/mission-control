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
import { ScrollArea } from "@/components/ui/scroll-area";

interface DashboardShellProps {
  children: React.ReactNode;
}

const SIDEBAR_WIDTH = 220;

export default function DashboardShell({ children }: DashboardShellProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // Start open on desktop

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // If mobile, close sidebar; if desktop, open sidebar
      setSidebarOpen(!mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = useCallback(() => setSidebarOpen((o) => !o), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <SidebarContext.Provider value={{ sidebarOpen, toggleSidebar, closeSidebar }}>
      <div className="flex h-screen overflow-hidden bg-[#080C16] relative">
        <div
          className={
            isMobile ? "fixed top-0 left-0 h-screen z-50" : "relative"
          }
          style={{
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

        {isMobile && sidebarOpen && (
          <div
            onClick={closeSidebar}
            className="fixed inset-0 bg-black/60 z-40"
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <Topbar />
          <ScrollArea className="flex-1 bg-[#080C16]">
            {children}
          </ScrollArea>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}
