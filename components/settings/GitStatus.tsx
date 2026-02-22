"use client";

import { useState, useEffect } from "react";

interface Commit {
  hash: string;
  message: string;
  date: string;
}

interface GitData {
  remote: string | null;
  commits: Commit[];
  connected: boolean;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", {
      timeZone: "Africa/Cairo",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function GitStatus() {
  const [data, setData] = useState<GitData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/settings/git-status")
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ remote: null, commits: [], connected: false }))
      .finally(() => setLoading(false));
  }, []);

  const latest = data?.commits?.[0];

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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
          GitHub Backup
        </span>
        {!loading && (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              fontSize: "12px",
              color: data?.connected ? "#34D399" : "#F87171",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: data?.connected ? "#34D399" : "#F87171",
                boxShadow: data?.connected
                  ? "0 0 6px rgba(52,211,153,0.6)"
                  : "0 0 6px rgba(248,113,113,0.6)",
                flexShrink: 0,
              }}
            />
            {data?.connected ? "Connected" : "Not configured"}
          </span>
        )}
      </div>

      <div style={{ padding: "20px" }}>
        {loading ? (
          <div
            style={{
              color: "#555570",
              fontSize: "13px",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              padding: "20px 0",
              textAlign: "center",
            }}
          >
            Loading git status…
          </div>
        ) : (
          <>
            {/* Repo info */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                marginBottom: "20px",
              }}
            >
              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid #1E2D45",
                  borderRadius: "8px",
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                    fontSize: "10px",
                    color: "#555570",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "6px",
                  }}
                >
                  Repository
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                    fontSize: "12px",
                    color: "#4F8EF7",
                    wordBreak: "break-all",
                  }}
                >
                  {data?.remote || "—"}
                </div>
              </div>

              <div
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid #1E2D45",
                  borderRadius: "8px",
                  padding: "12px 14px",
                }}
              >
                <div
                  style={{
                    fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                    fontSize: "10px",
                    color: "#555570",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "6px",
                  }}
                >
                  Last Pushed
                </div>
                {latest ? (
                  <div>
                    <div
                      style={{
                        fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                        fontSize: "11px",
                        color: "#F0F0F5",
                        marginBottom: "3px",
                      }}
                    >
                      {formatDate(latest.date)}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                        fontSize: "12px",
                        color: "#8888A0",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {latest.message}
                    </div>
                  </div>
                ) : (
                  <span
                    style={{
                      fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                      fontSize: "12px",
                      color: "#555570",
                    }}
                  >
                    No commits
                  </span>
                )}
              </div>
            </div>

            {/* Recent Commits */}
            {data?.commits && data.commits.length > 0 && (
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-syne, Syne, sans-serif)",
                    fontSize: "13px",
                    fontWeight: 700,
                    color: "#8888A0",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: "10px",
                  }}
                >
                  Recent Commits
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {data.commits.map((commit, i) => (
                    <div
                      key={commit.hash + i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "8px 12px",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(30,45,69,0.6)",
                        borderRadius: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                          fontSize: "11px",
                          color: "#4F8EF7",
                          flexShrink: 0,
                          minWidth: "58px",
                        }}
                      >
                        {commit.hash}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                          fontSize: "12px",
                          color: "#F0F0F5",
                          flex: 1,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {commit.message}
                      </span>
                      <span
                        style={{
                          fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                          fontSize: "10px",
                          color: "#555570",
                          flexShrink: 0,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatDate(commit.date)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!data?.connected && (
              <div
                style={{
                  textAlign: "center",
                  padding: "20px",
                  color: "#555570",
                  fontSize: "13px",
                  fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                }}
              >
                No git remote configured for this workspace.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
