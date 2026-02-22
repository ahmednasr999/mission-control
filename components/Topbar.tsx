"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import SyncIndicator from "./SyncIndicator";
import { useSidebar } from "@/lib/sidebar-context";
import { Menu } from "lucide-react";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Command Center",
  "/hr": "HR",
  "/marketing": "Marketing",
  "/ops": "OPS",
  "/intelligence": "Intelligence",
  "/team": "Team",
  "/lab": "Lab",
  "/settings": "Settings",
};

function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Command Center";
  // find the best matching prefix
  const matched = Object.entries(ROUTE_TITLES)
    .filter(([route]) => route !== "/" && pathname.startsWith(route))
    .sort((a, b) => b[0].length - a[0].length)[0];
  return matched ? matched[1] : "Mission Control";
}

function useCairoClock() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString("en-GB", {
        timeZone: "Africa/Cairo",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      });
      setTime(formatted);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

export default function Topbar() {
  const pathname = usePathname();
  const title = getPageTitle(pathname);
  const time = useCairoClock();
  const { toggleSidebar } = useSidebar();

  return (
    <header
      style={{
        height: "56px",
        background: "#080C16",
        borderBottom: "1px solid #1E2D45",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px 0 20px",
        flexShrink: 0,
      }}
    >
      {/* Left: Hamburger (mobile) + Page title */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Hamburger button — only visible on mobile via CSS */}
        <button
          onClick={toggleSidebar}
          className="topbar-hamburger"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <h1
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "17px",
            fontWeight: 700,
            color: "#F0F0F5",
            letterSpacing: "-0.02em",
            margin: 0,
          }}
        >
          {title}
        </h1>
      </div>

      {/* Right: Clock + Sync indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Cairo clock */}
        {time && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "#555570",
                fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                letterSpacing: "0.02em",
              }}
            >
              CAI
            </span>
            <span
              style={{
                fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                fontSize: "13px",
                color: "#8888A0",
                letterSpacing: "0.05em",
              }}
            >
              {time}
            </span>
          </div>
        )}

        {/* Divider */}
        <div
          style={{
            width: "1px",
            height: "20px",
            background: "#1E2D45",
          }}
        />

        {/* Sync indicator */}
        <SyncIndicator />
      </div>
    </header>
  );
}
