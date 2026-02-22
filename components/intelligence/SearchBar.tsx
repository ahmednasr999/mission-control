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

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FileResult[]>([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [loading, setLoading] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Count total flat results for keyboard nav
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

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex(prev => Math.min(prev + 1, totalFlat - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === "Escape") {
      setQuery("");
      setResults([]);
    }
  };

  const showResults = query.length >= 2 || results.length > 0;

  return (
    <div style={{ marginBottom: "28px" }}>
      {/* Search input */}
      <div
        style={{
          position: "relative",
          background: "#0D1220",
          border: "1px solid #1E2D45",
          borderRadius: "10px",
          overflow: "hidden",
          transition: "border-color 0.2s ease",
        }}
      >
        {/* Magnifying glass icon */}
        <div
          style={{
            position: "absolute",
            left: "20px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "#A0A0B0",
            fontSize: "18px",
            pointerEvents: "none",
            lineHeight: 1,
          }}
        >
          🔍
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search across all memory files..."
          style={{
            width: "100%",
            padding: "18px 20px 18px 52px",
            background: "transparent",
            border: "none",
            outline: "none",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            fontSize: "16px",
            color: "#F0F0F5",
            boxSizing: "border-box",
          }}
        />
        {/* Loading indicator */}
        {loading && (
          <div
            style={{
              position: "absolute",
              right: "20px",
              top: "50%",
              transform: "translateY(-50%)",
              fontSize: "12px",
              color: "#A0A0B0",
              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            }}
          >
            searching…
          </div>
        )}
        {/* Clear button */}
        {query && !loading && (
          <button
            onClick={() => { setQuery(""); setResults([]); inputRef.current?.focus(); }}
            style={{
              position: "absolute",
              right: "16px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              color: "#A0A0B0",
              fontSize: "18px",
              padding: "4px",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        )}
      </div>

      {/* Empty state hint */}
      {!showResults && (
        <div
          style={{
            textAlign: "center",
            color: "#A0A0B0",
            fontSize: "13px",
            fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            padding: "16px 0 0",
          }}
        >
          Type to search across 51+ memory files
        </div>
      )}

      {/* Results */}
      {showResults && (
        <div
          style={{
            background: "#0D1220",
            border: "1px solid #1E2D45",
            borderRadius: "10px",
            padding: "16px 20px",
            marginTop: "8px",
            maxHeight: "500px",
            overflowY: "auto",
          }}
        >
          <SearchResults
            results={results}
            query={query}
            totalMatches={totalMatches}
            focusedIndex={focusedIndex}
          />
        </div>
      )}
    </div>
  );
}
