"use client";

/**
 * QuickActionsBar — Sticky toolbar for common actions
 * Phase 2 UX enhancement: One-click access to add task, log job, content idea
 */

import { useState } from "react";
import { Plus, Briefcase, FileText, Search, Sparkles } from "lucide-react";

interface QuickActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  primary?: boolean;
}

function QuickActionButton({ icon, label, onClick, primary }: QuickActionButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: primary ? "8px 14px" : "8px 12px",
        background: primary 
          ? "linear-gradient(135deg, #4F8EF7, #7C3AED)" 
          : "rgba(79, 142, 247, 0.08)",
        border: primary ? "none" : "1px solid rgba(79, 142, 247, 0.3)",
        borderRadius: "8px",
        color: primary ? "#fff" : "#4F8EF7",
        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.15s ease",
        whiteSpace: "nowrap",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-1px)";
        e.currentTarget.style.boxShadow = primary 
          ? "0 4px 12px rgba(79, 142, 247, 0.4)" 
          : "0 2px 8px rgba(79, 142, 247, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export default function QuickActionsBar() {
  const [searchOpen, setSearchOpen] = useState(false);

  const actions = [
    { icon: <Plus size={14} />, label: "Add Task", primary: true },
    { icon: <Briefcase size={14} />, label: "Log Job" },
    { icon: <FileText size={14} />, label: "Content Idea" },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        padding: "12px 16px",
        marginBottom: "20px",
        background: "rgba(13, 18, 32, 0.6)",
        border: "1px solid rgba(79, 142, 247, 0.15)",
        borderRadius: "12px",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Left: Quick action buttons */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {actions.map((action, i) => (
          <QuickActionButton key={i} {...action} />
        ))}
      </div>

      {/* Right: Search */}
      <div style={{ position: "relative" }}>
        {searchOpen ? (
          <input
            type="text"
            placeholder="Search tasks, jobs, content..."
            autoFocus
            onBlur={() => setSearchOpen(false)}
            style={{
              width: "280px",
              padding: "8px 12px 8px 36px",
              background: "rgba(79, 142, 247, 0.08)",
              border: "1px solid rgba(79, 142, 247, 0.3)",
              borderRadius: "8px",
              color: "#F0F0F5",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              fontSize: "13px",
              outline: "none",
            }}
          />
        ) : (
          <QuickActionButton
            icon={<Search size={14} />}
            label="Search"
            onClick={() => setSearchOpen(true)}
          />
        )}
        {searchOpen && (
          <Search 
            size={14} 
            style={{ 
              position: "absolute", 
              left: "12px", 
              top: "50%", 
              transform: "translateY(-50%)",
              color: "#4F8EF7",
              pointerEvents: "none",
            }} 
          />
        )}
      </div>
    </div>
  );
}
