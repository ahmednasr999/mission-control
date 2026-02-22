"use client";

import { useState, useEffect, useCallback } from "react";
import SearchBar from "@/components/intelligence/SearchBar";
import SearchModal from "@/components/intelligence/SearchModal";
import MemoryHighlights from "@/components/intelligence/MemoryHighlights";
import LessonsLearned from "@/components/intelligence/LessonsLearned";
import GoalsDashboard from "@/components/intelligence/GoalsDashboard";

export default function IntelligencePage() {
  const [modalOpen, setModalOpen] = useState(false);

  // Register global Ctrl+K listener
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      setModalOpen(prev => !prev);
    }
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div style={{ padding: "32px", maxWidth: "100%" }}>
      {/* Page header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <h2
              style={{
                fontFamily: "var(--font-syne, Syne, sans-serif)",
                fontSize: "28px",
                fontWeight: 700,
                color: "#F0F0F5",
                letterSpacing: "-0.03em",
                margin: 0,
              }}
            >
              INTELLIGENCE
            </h2>
            <p
              style={{
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                fontSize: "13px",
                color: "#555570",
                marginTop: "6px",
                marginBottom: 0,
              }}
            >
              Search, insights, and strategic intelligence
            </p>
          </div>

          {/* Ctrl+K hint */}
          <button
            onClick={() => setModalOpen(true)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              background: "#0D1220",
              border: "1px solid #1E2D45",
              borderRadius: "8px",
              padding: "8px 14px",
              cursor: "pointer",
              transition: "border-color 0.2s ease",
            }}
          >
            <span style={{ fontSize: "14px" }}>🔍</span>
            <span
              style={{
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                fontSize: "13px",
                color: "#8888A0",
              }}
            >
              Quick search
            </span>
            <kbd
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid #1E2D45",
                borderRadius: "4px",
                padding: "2px 6px",
                fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                fontSize: "11px",
                color: "#555570",
              }}
            >
              ⌃K
            </kbd>
          </button>
        </div>
      </div>

      {/* 1. Full-width Search Bar */}
      <SearchBar />

      {/* 2. Two-column layout: Memory Highlights (left) + Lessons Learned (right) */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "20px",
          marginBottom: "32px",
        }}
      >
        {/* Left: Memory Highlights */}
        <div>
          <div style={{ marginBottom: "12px" }}>
            <h3
              style={{
                fontFamily: "var(--font-syne, Syne, sans-serif)",
                fontSize: "18px",
                fontWeight: 700,
                color: "#F0F0F5",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Memory Highlights
            </h3>
            <p
              style={{
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                fontSize: "13px",
                color: "#555570",
                margin: "4px 0 0",
              }}
            >
              Key facts from MEMORY.md
            </p>
          </div>
          <MemoryHighlights />
        </div>

        {/* Right: Lessons Learned */}
        <div>
          <div style={{ marginBottom: "12px" }}>
            <h3
              style={{
                fontFamily: "var(--font-syne, Syne, sans-serif)",
                fontSize: "18px",
                fontWeight: 700,
                color: "#F0F0F5",
                margin: 0,
                letterSpacing: "-0.02em",
              }}
            >
              Lessons Learned
            </h3>
            <p
              style={{
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                fontSize: "13px",
                color: "#555570",
                margin: "4px 0 0",
              }}
            >
              Mistakes &amp; wins from memory files
            </p>
          </div>
          <LessonsLearned />
        </div>
      </div>

      {/* 3. Full-width Goals Dashboard */}
      <GoalsDashboard />

      {/* Global Ctrl+K Search Modal */}
      <SearchModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
