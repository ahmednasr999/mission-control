"use client";

import { useEffect, useState } from "react";

interface LinkedInPost {
  id: number;
  title: string;
  content: string;
  status: string;
  priority: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  Draft:     { bg: "rgba(139, 92, 246, 0.15)", text: "#A78BFA" },
  Scheduled: { bg: "rgba(34, 211, 238, 0.15)", text: "#22D3EE" },
  Published: { bg: "rgba(52, 211, 153, 0.15)", text: "#34D399" },
};

const SCHEDULE: { day: string; date: string; postNum: number; type: string }[] = [
  { day: "Sat", date: "Feb 22", postNum: 8,  type: "PMO Insight" },
  { day: "Sun", date: "Feb 23", postNum: 1,  type: "Healthcare Disruption" },
  { day: "Mon", date: "Feb 24", postNum: 5,  type: "Free Assessment CTA" },
  { day: "Tue", date: "Feb 25", postNum: 2,  type: "Talabat Story" },
  { day: "Wed", date: "Feb 26", postNum: 6,  type: "Skills Gap" },
  { day: "Thu", date: "Feb 27", postNum: 9,  type: "Leadership" },
  { day: "Fri", date: "Feb 28", postNum: 10, type: "Free Call CTA" },
];

export default function LinkedInContent() {
  const [posts, setPosts] = useState<LinkedInPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/marketing/linkedin")
      .then((r) => r.json())
      .then((data) => {
        setPosts(data.posts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ marginTop: "32px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "18px" }}>💼</span>
          <h2 style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "15px",
            fontWeight: 700,
            color: "#F0F0F5",
            margin: 0,
          }}>
            LinkedIn — Everyday CTA
          </h2>
          <span style={{
            background: "rgba(79, 142, 247, 0.15)",
            color: "#4F8EF7",
            fontSize: "11px",
            fontWeight: 600,
            padding: "2px 8px",
            borderRadius: "10px",
          }}>
            {posts.length} posts
          </span>
        </div>
        <span style={{ fontSize: "12px", color: "#6B7280" }}>Framework: 3S&apos;s + 2F&apos;s</span>
      </div>

      {/* Publishing Schedule Strip */}
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid #1E2D45",
        borderRadius: "12px",
        padding: "16px 20px",
        marginBottom: "20px",
      }}>
        <p style={{ fontSize: "11px", color: "#6B7280", margin: "0 0 12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Publishing Schedule — Week 1
        </p>
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          {SCHEDULE.map((s) => (
            <div key={s.date} style={{
              minWidth: "100px",
              background: "rgba(79,142,247,0.08)",
              border: "1px solid rgba(79,142,247,0.2)",
              borderRadius: "8px",
              padding: "10px 12px",
              flexShrink: 0,
            }}>
              <div style={{ fontSize: "10px", color: "#4F8EF7", fontWeight: 700, marginBottom: "4px" }}>
                {s.day} {s.date}
              </div>
              <div style={{ fontSize: "11px", color: "#A0A0B0", fontWeight: 600 }}>
                Post #{s.postNum}
              </div>
              <div style={{ fontSize: "10px", color: "#6B7280", marginTop: "2px" }}>
                {s.type}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Posts Grid */}
      {loading ? (
        <div style={{ textAlign: "center", color: "#6B7280", padding: "40px", fontSize: "13px" }}>
          Loading posts...
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "12px" }}>
          {posts.map((post, idx) => {
            const statusStyle = STATUS_COLORS[post.status] || STATUS_COLORS["Draft"];
            const isExpanded = expanded === post.id;
            return (
              <div
                key={post.id}
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid #1E2D45",
                  borderRadius: "12px",
                  padding: "16px",
                  cursor: "pointer",
                  transition: "border-color 0.2s",
                }}
                onClick={() => setExpanded(isExpanded ? null : post.id)}
              >
                {/* Post Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{
                      background: "rgba(79,142,247,0.15)",
                      color: "#4F8EF7",
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 7px",
                      borderRadius: "6px",
                      minWidth: "28px",
                      textAlign: "center",
                    }}>
                      #{idx + 1}
                    </span>
                    <span style={{
                      background: statusStyle.bg,
                      color: statusStyle.text,
                      fontSize: "10px",
                      fontWeight: 600,
                      padding: "2px 8px",
                      borderRadius: "6px",
                    }}>
                      {post.status}
                    </span>
                  </div>
                  <span style={{ fontSize: "12px", color: "#4B5563" }}>
                    {isExpanded ? "▲" : "▼"}
                  </span>
                </div>

                {/* Title */}
                <p style={{
                  fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#E0E0F0",
                  margin: "0 0 8px",
                  lineHeight: "1.4",
                }}>
                  {post.title.replace(/^Post \d+: /, "")}
                </p>

                {/* Preview / Full Content */}
                <p style={{
                  fontSize: "12px",
                  color: "#8888A0",
                  margin: 0,
                  lineHeight: "1.6",
                  display: "-webkit-box",
                  WebkitLineClamp: isExpanded ? undefined : 3,
                  WebkitBoxOrient: "vertical",
                  overflow: isExpanded ? "visible" : "hidden",
                  whiteSpace: "pre-wrap",
                }}>
                  {post.content}
                </p>

                {/* Footer */}
                <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "10px", color: "#4B5563" }}>
                    {post.content.split(" ").length} words
                  </span>
                  <span style={{ fontSize: "10px", color: "#4F8EF7", fontWeight: 600 }}>
                    {isExpanded ? "Collapse" : "Read full post →"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
