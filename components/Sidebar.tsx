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
import { Button } from "@/components/ui/button";

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
            <Link key={href} href={href} passHref legacyBehavior>
              <Button
                variant="ghost"
                className={`w-full justify-start gap-3 h-9 ${
                  active 
                    ? "bg-slate-800/50 text-blue-400 border-l-2 border-blue-500" 
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/30"
                }`}
                style={{
                  fontSize: "13px",
                  fontWeight: active ? 600 : 400,
                }}
              >
                <Icon
                  size={16}
                  style={{ flexShrink: 0 }}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span>{label}</span>
              </Button>
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
        <Link href="/settings" passHref legacyBehavior>
          <Button
            variant="ghost"
            className={`w-full justify-start gap-3 h-9 ${
              pathname === "/settings"
                ? "bg-slate-800/50 text-blue-400 border-l-2 border-blue-500"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/30"
            }`}
            style={{
              fontSize: "13px",
            }}
          >
            <Settings size={16} strokeWidth={2} />
            <span>Settings</span>
          </Button>
        </Link>
      </div>
    </aside>
  );
}
