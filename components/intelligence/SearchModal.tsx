"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import SearchResults from "./SearchResults";

interface Match {
  line: number;
  text: string;
  context: string;
}

interface FileResult {
  file: string;
  matches: Match[];
}

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
}

export default function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FileResult[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [loading, setLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalFlat = results.reduce((sum, r) => sum + r.matches.length, 0);

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setResults([]);
      setTotalMatches(0);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/intelligence/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results || []);
      setTotalMatches(data.totalMatches || 0);
      setFocusedIndex(-1);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  // Auto-focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery("");
      setResults([]);
      setFocusedIndex(-1);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(prev + 1, totalFlat - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(prev - 1, -1));
    }
  };

  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "10vh",
      }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(8, 12, 22, 0.85)",
          backdropFilter: "blur(4px)",
        }}
      />

      {/* Modal */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "680px",
          margin: "0 16px",
          background: "#0D1220",
          border: "1px solid #1E2D45",
          borderRadius: "12px",
          boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          overflow: "hidden",
        }}
      >
        {/* Input row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
            borderBottom: "1px solid #1E2D45",
          }}
        >
          <span style={{ fontSize: "18px", color: "#555570", marginRight: "12px", flexShrink: 0 }}>🔍</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search across all memory files..."
            style={{
              flex: 1,
              padding: "20px 0",
              background: "transparent",
              border: "none",
              outline: "none",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              fontSize: "16px",
              color: "#F0F0F5",
            }}
          />
          {loading && (
            <span
              style={{
                fontSize: "11px",
                color: "#555570",
                fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                flexShrink: 0,
                marginLeft: "8px",
              }}
            >
              searching…
            </span>
          )}
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid #1E2D45",
              borderRadius: "6px",
              padding: "4px 8px",
              cursor: "pointer",
              color: "#555570",
              fontSize: "11px",
              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
              flexShrink: 0,
              marginLeft: "12px",
            }}
          >
            ESC
          </button>
        </div>

        {/* Results area */}
        <div
          style={{
            maxHeight: "60vh",
            overflowY: "auto",
            padding: "16px 20px",
          }}
        >
          {query.length < 2 && results.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: "#555570",
                fontSize: "13px",
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                padding: "24px 0",
              }}
            >
              Type to search across 51+ memory files
            </div>
          ) : (
            <SearchResults
              results={results}
              query={query}
              totalMatches={totalMatches}
              focusedIndex={focusedIndex}
            />
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            borderTop: "1px solid #1E2D45",
            padding: "10px 20px",
            display: "flex",
            gap: "16px",
            alignItems: "center",
          }}
        >
          {[
            { key: "↑↓", label: "navigate" },
            { key: "Enter", label: "expand" },
            { key: "Esc", label: "close" },
          ].map(({ key, label }) => (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <kbd
                style={{
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid #1E2D45",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                  fontSize: "11px",
                  color: "#8888A0",
                }}
              >
                {key}
              </kbd>
              <span
                style={{
                  fontSize: "11px",
                  color: "#555570",
                  fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
