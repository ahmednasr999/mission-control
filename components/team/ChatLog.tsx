"use client";

import { useEffect, useState, useCallback } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

interface ChatLogProps {
  agentId: string;
  agentName: string;
  agentEmoji: string;
}

function formatTimestamp(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", {
      timeZone: "Africa/Cairo",
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return iso;
  }
}

function truncateContent(content: string, maxLen = 1000): string {
  if (content.length <= maxLen) return content;
  return content.slice(0, maxLen) + "\n…[truncated]";
}

export default function ChatLog({ agentId, agentName, agentEmoji }: ChatLogProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const LIMIT = 20;

  const fetchMessages = useCallback(async (newOffset: number, append = false) => {
    try {
      const url = `/api/team/chat?agent=${encodeURIComponent(agentId)}&offset=${newOffset}&limit=${LIMIT}`;
      const res = await fetch(url);
      const data = await res.json();
      const fetched: ChatMessage[] = data.messages || [];
      setHasMore(data.hasMore || false);
      setTotal(data.total || 0);

      if (append) {
        setMessages(prev => [...fetched, ...prev]);
      } else {
        setMessages(fetched);
      }
      setOffset(newOffset + LIMIT);
    } catch {
      if (!append) setMessages([]);
    }
  }, [agentId]);

  useEffect(() => {
    setLoading(true);
    setMessages([]);
    setOffset(0);
    setHasMore(false);
    fetchMessages(0, false).finally(() => setLoading(false));
  }, [agentId, fetchMessages]);

  async function loadMore() {
    setLoadingMore(true);
    await fetchMessages(offset, true);
    setLoadingMore(false);
  }

  return (
    <div
      style={{
        background: "#0D1220",
        border: "1px solid #1E2D45",
        borderRadius: "10px",
        overflow: "hidden",
        marginBottom: "20px",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid #1E2D45",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          background: "rgba(255,255,255,0.01)",
        }}
      >
        <span style={{ fontSize: "18px" }}>{agentEmoji}</span>
        <div>
          <span
            style={{
              fontFamily: "var(--font-syne, Syne, sans-serif)",
              fontSize: "14px",
              fontWeight: 700,
              color: "#F0F0F5",
            }}
          >
            {agentName}
          </span>
          <span
            style={{
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              fontSize: "12px",
              color: "#A0A0B0",
              marginLeft: "8px",
            }}
          >
            Session History
          </span>
        </div>
        {total > 0 && (
          <span
            style={{
              marginLeft: "auto",
              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
              fontSize: "11px",
              color: "#A0A0B0",
            }}
          >
            {total} messages
          </span>
        )}
      </div>

      {/* Messages area */}
      <div style={{ padding: "16px 20px", maxHeight: "520px", overflowY: "auto" }}>
        {/* Load More button at top */}
        {hasMore && !loading && (
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <button
              onClick={loadMore}
              disabled={loadingMore}
              style={{
                background: "rgba(79,142,247,0.1)",
                border: "1px solid #4F8EF740",
                borderRadius: "6px",
                padding: "6px 16px",
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                fontSize: "12px",
                color: "#4F8EF7",
                cursor: loadingMore ? "default" : "pointer",
                opacity: loadingMore ? 0.6 : 1,
                transition: "all 0.15s ease",
              }}
            >
              {loadingMore ? "Loading…" : "← Load Earlier Messages"}
            </button>
          </div>
        )}

        {loading ? (
          <div
            style={{
              textAlign: "center",
              color: "#A0A0B0",
              fontSize: "13px",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              padding: "40px 0",
            }}
          >
            Loading session history…
          </div>
        ) : messages.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#A0A0B0",
              fontSize: "13px",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              padding: "40px 0",
            }}
          >
            No session history available
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: msg.role === "user" ? "flex-end" : "flex-start",
                  gap: "3px",
                }}
              >
                {/* Timestamp */}
                <div
                  style={{
                    fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                    fontSize: "10px",
                    color: "#A0A0B0",
                  }}
                >
                  {formatTimestamp(msg.timestamp)}
                </div>

                {/* Bubble */}
                <div
                  style={{
                    maxWidth: "80%",
                    background: msg.role === "user" ? "#1E3A5F" : "#131A2A",
                    border: `1px solid ${msg.role === "user" ? "#2A4E7F" : "#1E2D45"}`,
                    borderRadius: msg.role === "user"
                      ? "10px 10px 2px 10px"
                      : "10px 10px 10px 2px",
                    padding: "10px 14px",
                    fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                    fontSize: "13px",
                    color: "#F0F0F5",
                    lineHeight: 1.55,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                  }}
                >
                  {truncateContent(msg.content)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
