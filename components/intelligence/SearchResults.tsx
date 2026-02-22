"use client";

interface Match {
  line: number;
  text: string;
  context: string;
}

interface FileResult {
  file: string;
  matches: Match[];
}

interface SearchResultsProps {
  results: FileResult[];
  query: string;
  totalMatches: number;
  focusedIndex: number;
  onResultClick?: (result: FileResult, match: Match) => void;
}

function highlightText(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part, i) =>
    regex.test(part) ? (
      <mark
        key={i}
        style={{
          background: "rgba(79, 142, 247, 0.25)",
          color: "#4F8EF7",
          borderRadius: "2px",
          padding: "0 1px",
          fontWeight: 700,
        }}
      >
        {part}
      </mark>
    ) : (
      part
    )
  );
}

let flatIndex = 0;

export default function SearchResults({
  results,
  query,
  totalMatches,
  focusedIndex,
  onResultClick,
}: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          color: "#555570",
          fontSize: "13px",
          fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          padding: "24px 0",
        }}
      >
        {query.length >= 2 ? `No results for "${query}"` : "Type to search across 51+ memory files"}
      </div>
    );
  }

  let currentFlatIndex = 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div
        style={{
          fontSize: "11px",
          color: "#555570",
          fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
          paddingBottom: "4px",
        }}
      >
        {totalMatches} match{totalMatches !== 1 ? "es" : ""} across {results.length} file{results.length !== 1 ? "s" : ""}
      </div>

      {results.map((fileResult) => (
        <div key={fileResult.file}>
          {/* File header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "6px",
            }}
          >
            <span style={{ fontSize: "14px" }}>📄</span>
            <span
              style={{
                fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                fontSize: "12px",
                fontWeight: 600,
                color: "#4F8EF7",
              }}
            >
              {fileResult.file}
            </span>
            <span
              style={{
                fontSize: "10px",
                color: "#555570",
                fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
              }}
            >
              ({fileResult.matches.length} match{fileResult.matches.length !== 1 ? "es" : ""})
            </span>
          </div>

          {/* Matches */}
          <div style={{ display: "flex", flexDirection: "column", gap: "4px", paddingLeft: "22px" }}>
            {fileResult.matches.map((match) => {
              const idx = currentFlatIndex++;
              const isFocused = idx === focusedIndex;
              return (
                <div
                  key={`${fileResult.file}-${match.line}`}
                  onClick={() => onResultClick?.(fileResult, match)}
                  style={{
                    background: isFocused ? "rgba(79, 142, 247, 0.08)" : "rgba(255,255,255,0.02)",
                    border: isFocused ? "1px solid rgba(79, 142, 247, 0.4)" : "1px solid #1E2D45",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    cursor: "pointer",
                    transition: "all 0.1s ease",
                  }}
                >
                  {/* Line number */}
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#555570",
                      fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                      marginBottom: "3px",
                    }}
                  >
                    Line {match.line}
                  </div>
                  {/* Match text */}
                  <div
                    style={{
                      fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                      fontSize: "13px",
                      color: "#F0F0F5",
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {highlightText(match.text.trim(), query)}
                  </div>
                  {/* Context (collapsed by default, shown on focus) */}
                  {isFocused && match.context !== match.text && (
                    <div
                      style={{
                        marginTop: "8px",
                        paddingTop: "8px",
                        borderTop: "1px solid #1E2D45",
                        fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                        fontSize: "11px",
                        color: "#555570",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        lineHeight: 1.6,
                      }}
                    >
                      {highlightText(match.context, query)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
