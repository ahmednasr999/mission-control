"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "◈" },
  { href: "/hr", label: "HR", icon: "◇" },
  { href: "/ops", label: "Tasks", icon: "▣" },
  { href: "/team/nasr", label: "Team", icon: "△" },
  { href: "/marketing", label: "Content", icon: "○" },
];

export default function MobileNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Only show on mobile (screen width < 768px)
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  if (!isMobile) return null;

  return (
    <>
      {/* Bottom Tab Bar */}
      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          height: "60px",
          background: "#0D1220",
          borderTop: "1px solid #1E2D45",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
          zIndex: 1000,
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {NAV_ITEMS.slice(0, 5).map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                textDecoration: "none",
                color: isActive ? "#4F8EF7" : "#6B7280",
                fontSize: "10px",
              }}
            >
              <span style={{ fontSize: "18px" }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
      {/* Spacer to prevent content from being hidden behind nav */}
      <div style={{ height: "70px" }} />
    </>
  );
}
