"use client";

/**
 * SidebarContext — extracted to break the circular dependency:
 *   DashboardShell → Topbar → DashboardShell (was circular)
 * Both DashboardShell and Topbar now import from this file instead.
 */

import { createContext, useContext } from "react";

export interface SidebarContextValue {
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

export const SidebarContext = createContext<SidebarContextValue>({
  sidebarOpen: false,
  toggleSidebar: () => {},
  closeSidebar: () => {},
});

export function useSidebar() {
  return useContext(SidebarContext);
}
