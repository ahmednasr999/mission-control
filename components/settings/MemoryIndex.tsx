"use client";

import { useState } from "react";

interface ReindexResult {
  success: boolean;
  output?: string;
  error?: string;
}

export default function MemoryIndex() {
  const [indexing, setIndexing] = useState(false);
  const [result, setResult] = useState<ReindexResult | null>(null);
  const [timestamp, setTimestamp] = useState<string | null>(null);

  const handleReindex = async () => {
    setIndexing(true);
    setResult(null);
    try {
      const res = await fetch("/api/settings/reindex", { method: "POST" });
      const data: ReindexResult = await res.json();
      setResult(data);
      setTimestamp(new Date().toISOString());
    } catch {
      setResult({ success: false, error: "Request failed" });
    } finally {
      setIndexing(false);
    }
  };

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleString("en-GB", {
        timeZone: "Africa/Cairo",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return iso;
    }
  }

  return (
    <div
      style={{
        background: "#0D1220",
        border: "1px solid #1E2D45",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid #1E2D45",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "16px",
            fontWeight: 700,
            color: "#F0F0F5",
          }}
        >
          Memory Index
        </span>
      </div>

      <div style={{ padding: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "20px",
            flexWrap: "wrap",
          }}
        >
          {/* Status area */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
            <p
              style={{
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                fontSize: "13px",
                color: "#8888A0",
                margin: 0,
                lineHeight: 1.5,
              }}
            >
              Re-indexes the memory vector store so recent files are searchable via{" "}
              <code
                style={{
                  fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                  fontSize: "11px",
                  background: "rgba(79,142,247,0.1)",
                  border: "1px solid rgba(79,142,247,0.2)",
                  borderRadius: "4px",
                  padding: "1px 6px",
                  color: "#4F8EF7",
                }}
              >
                openclaw memory search
              </code>
              .
            </p>

            {result && timestamp && (
              <div
                style={{
                  background: result.success
                    ? "rgba(52,211,153,0.06)"
                    : "rgba(248,113,113,0.06)",
                  border: `1px solid ${result.success ? "rgba(52,211,153,0.2)" : "rgba(248,113,113,0.2)"}`,
                  borderRadius: "6px",
                  padding: "10px 14px",
                  marginTop: "4px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    marginBottom: result.output || result.error ? "6px" : 0,
                  }}
                >
                  <span style={{ fontSize: "14px" }}>{result.success ? "✅" : "❌"}</span>
                  <span
                    style={{
                      fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                      fontSize: "12px",
                      fontWeight: 600,
                      color: result.success ? "#34D399" : "#F87171",
                    }}
                  >
                    {result.success ? "Re-index complete" : "Re-index failed"}
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                      fontSize: "10px",
                      color: "#A0A0B0",
                      marginLeft: "auto",
                    }}
                  >
                    {formatDate(timestamp)}
                  </span>
                </div>
                {(result.output || result.error) && (
                  <pre
                    style={{
                      fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                      fontSize: "11px",
                      color: result.success ? "#8888A0" : "#F87171",
                      margin: 0,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-all",
                      maxHeight: "120px",
                      overflowY: "auto",
                    }}
                  >
                    {result.output || result.error}
                  </pre>
                )}
              </div>
            )}
          </div>

          {/* Button */}
          <button
            onClick={handleReindex}
            disabled={indexing}
            style={{
              background: indexing
                ? "rgba(79,142,247,0.15)"
                : "linear-gradient(135deg, #4F8EF7, #7C3AED)",
              border: "none",
              borderRadius: "8px",
              padding: "10px 20px",
              fontFamily: "var(--font-syne, Syne, sans-serif)",
              fontSize: "13px",
              fontWeight: 700,
              color: "#fff",
              cursor: indexing ? "not-allowed" : "pointer",
              opacity: indexing ? 0.7 : 1,
              transition: "opacity 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              flexShrink: 0,
              alignSelf: "flex-start",
            }}
          >
            {indexing ? (
              <>
                <span
                  style={{
                    display: "inline-block",
                    width: "10px",
                    height: "10px",
                    border: "2px solid rgba(255,255,255,0.4)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
                Indexing…
              </>
            ) : (
              "⟳ Re-index Memory"
            )}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
