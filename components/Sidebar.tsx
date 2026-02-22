"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Briefcase,
  TrendingUp,
  Layers,
  Search,
  Users,
  FlaskConical,
  Settings,
} from "lucide-react";

const navItems = [
  { label: "Command Center", icon: LayoutGrid, href: "/" },
  { label: "HR", icon: Briefcase, href: "/hr" },
  { label: "Marketing", icon: TrendingUp, href: "/marketing" },
  { label: "OPS", icon: Layers, href: "/ops" },
  { label: "Intelligence", icon: Search, href: "/intelligence" },
  { label: "Team", icon: Users, href: "/team" },
  { label: "Lab", icon: FlaskConical, href: "/lab" },
];

export default function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      style={{
        width: "220px",
        minWidth: "220px",
        height: "100vh",
        background: "#080C16",
        borderRight: "1px solid #1E2D45",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Logo / Brand */}
      <div
        style={{
          padding: "20px 20px 16px",
          borderBottom: "1px solid #1E2D45",
          flexShrink: 0,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "8px",
              background: "linear-gradient(135deg, #4F8EF7, #7C3AED)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
            }}
          >
            🎯
          </div>
          <span
            style={{
              fontFamily: "var(--font-syne, Syne, sans-serif)",
              fontSize: "15px",
              fontWeight: 700,
              color: "#F0F0F5",
              letterSpacing: "-0.02em",
            }}
          >
            Mission Control
          </span>
        </div>
      </div>

      {/* Nav items */}
      <nav
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 10px",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#A0A0B0",
            padding: "0 8px",
            marginBottom: "8px",
          }}
        >
          Navigation
        </div>
        {navItems.map(({ label, icon: Icon, href }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 12px",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: active ? 600 : 400,
                color: active ? "#4F8EF7" : "#8888A0",
                textDecoration: "none",
                transition: "all 0.15s ease",
                background: active ? "rgba(79, 142, 247, 0.12)" : "transparent",
                borderLeft: active ? "2px solid #4F8EF7" : "2px solid transparent",
                marginLeft: "-2px",
                marginBottom: "2px",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background =
                    "rgba(255, 255, 255, 0.04)";
                  (e.currentTarget as HTMLElement).style.color = "#F0F0F5";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#8888A0";
                }
              }}
            >
              <Icon
                size={16}
                style={{ flexShrink: 0 }}
                strokeWidth={active ? 2.5 : 2}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom settings */}
      <div
        style={{
          padding: "10px",
          borderTop: "1px solid #1E2D45",
          flexShrink: 0,
        }}
      >
        <Link
          href="/settings"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "8px 12px",
            borderRadius: "8px",
            fontSize: "13px",
            color:
              pathname === "/settings" ? "#4F8EF7" : "#8888A0",
            textDecoration: "none",
            transition: "all 0.15s ease",
            background:
              pathname === "/settings"
                ? "rgba(79, 142, 247, 0.12)"
                : "transparent",
          }}
          onMouseEnter={(e) => {
            if (pathname !== "/settings") {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(255, 255, 255, 0.04)";
              (e.currentTarget as HTMLElement).style.color = "#F0F0F5";
            }
          }}
          onMouseLeave={(e) => {
            if (pathname !== "/settings") {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "#8888A0";
            }
          }}
        >
          <Settings size={16} strokeWidth={2} />
          <span>Settings</span>
        </Link>
      </div>
    </aside>
  );
}
