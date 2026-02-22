"use client";

/**
 * ContentPreview — Phase 3: A+ Animations
 * - Counter animation on numbers
 * - Staggered bubble entrance
 * - Arrow fade-in sequence
 * - Hover scale on bubbles
 * - Total count animation
 */

import { useState, useEffect, useRef } from "react";

interface ContentStages {
  ideas: number;
  draft: number;
  review: number;
  published: number;
}

interface StageColumnProps {
  label: string;
  count: number;
  color: string;
  bg: string;
  delay?: number;
}

// Animated counter hook - browser only
function useAnimatedCounter(target: number, duration = 800, startOnMount = true) {
  const [count, setCount] = useState(0);
  const hasStarted = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!startOnMount || hasStarted.current) return;
    hasStarted.current = true;

    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(target * easeOut));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [target, duration, startOnMount]);

  return count;
}

function StageColumn({ label, count, color, bg, delay = 0 }: StageColumnProps) {
  const [mounted, setMounted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const animatedCount = useAnimatedCounter(count);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "8px",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0) scale(1)" : "translateY(20px) scale(0.8)",
        transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Count bubble */}
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: isHovered ? bg.replace("0.12", "0.25") : bg,
          border: `1.5px solid ${count > 0 ? (isHovered ? color : color) : "#1E2D45"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-syne, Syne, sans-serif)",
          fontSize: "16px",
          fontWeight: 600,
          color: count > 0 ? color : "#A0A0B0",
          boxShadow: count > 0 ? `0 ${isHovered ? "8px" : "2px"} ${isHovered ? "20px" : "8px"} ${color}${isHovered ? "40" : "20"}` : "none",
          transform: isHovered ? "scale(1.15)" : "scale(1)",
          transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
          cursor: "pointer",
        }}
      >
        {animatedCount}
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          fontSize: isHovered ? "16px" : "15px",
          color: count > 0 ? (isHovered ? "#F0F0F5" : "#E0E0E5") : "#8888A0",
          fontWeight: 600,
          textAlign: "center",
          marginTop: "4px",
          transition: "all 0.2s ease",
        }}
      >
        {label}
      </div>
    </div>
  );
}

interface ContentPreviewProps {
  stages: ContentStages | null;
  loading?: boolean;
}

const STAGES = [
  {
    key: "ideas" as keyof ContentStages,
    label: "Ideas",
    color: "#8888A0",
    bg: "rgba(136, 136, 160, 0.12)",
  },
  {
    key: "draft" as keyof ContentStages,
    label: "Draft",
    color: "#D97706",
    bg: "rgba(217, 119, 6, 0.12)",
  },
  {
    key: "review" as keyof ContentStages,
    label: "Review",
    color: "#7C3AED",
    bg: "rgba(124, 58, 237, 0.12)",
  },
  {
    key: "published" as keyof ContentStages,
    label: "Published",
    color: "#059669",
    bg: "rgba(5, 150, 105, 0.12)",
  },
];

export default function ContentPreview({ stages, loading }: ContentPreviewProps) {
  const [mounted, setMounted] = useState(false);
  const data = stages || { ideas: 0, draft: 0, review: 0, published: 0 };
  const totalAnimated = useAnimatedCounter(data.ideas + data.draft + data.review + data.published, 1000, mounted);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div
      style={{
        background: "#0D1220",
        border: "1px solid #1E2D45",
        borderRadius: "10px",
        overflow: "hidden",
        opacity: mounted ? 1 : 0,
        transform: mounted ? "translateY(0)" : "translateY(12px)",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <style>{`
        @keyframes arrowFadeIn {
          from { opacity: 0; transform: translateX(-5px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .arrow-fade {
          animation: arrowFadeIn 0.4s ease forwards;
          opacity: 0;
        }
      `}</style>

      {/* Header */}
      <div
        style={{
          padding: "12px 16px 10px",
          borderBottom: "1px solid #1E2D45",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontFamily: "var(--font-syne, Syne, sans-serif)",
            fontSize: "13px",
            fontWeight: 700,
            color: "#F0F0F5",
          }}
        >
          Content Pipeline
        </span>
        {!loading && stages && (
          <span
            style={{
              fontSize: "11px",
              color: "#A0A0B0",
              fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            }}
          >
            {stages.ideas + stages.draft + stages.review + stages.published} items
          </span>
        )}
      </div>

      {/* Stages */}
      <div style={{ padding: "20px 16px" }}>
        {loading ? (
          <div
            style={{
              textAlign: "center",
              color: "#A0A0B0",
              fontSize: "13px",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            }}
          >
            Loading…
          </div>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                justifyContent: "space-between",
              }}
            >
              {STAGES.map((stage, i) => (
                <div
                  key={stage.key}
                  style={{ display: "flex", alignItems: "center", flex: 1 }}
                >
                  <StageColumn
                    label={stage.label}
                    count={data[stage.key]}
                    color={stage.color}
                    bg={stage.bg}
                    delay={i * 100}
                  />
                  {i < STAGES.length - 1 && (
                    <div
                      className="arrow-fade"
                      style={{
                        fontSize: "16px",
                        color: "#1E2D45",
                        flexShrink: 0,
                        margin: "0 -8px",
                        paddingBottom: "24px",
                        animationDelay: `${i * 100 + 200}ms`,
                      }}
                    >
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total note */}
            <div
              style={{
                marginTop: "16px",
                paddingTop: "16px",
                borderTop: "1px solid #1E2D45",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(10px)",
                transition: "all 0.4s ease 0.5s",
              }}
            >
              <span
                style={{
                  fontSize: "15px",
                  color: "#8888A0",
                  fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                  fontWeight: 500,
                }}
              >
                Total pieces
              </span>
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  fontFamily: "var(--font-syne, Syne, sans-serif)",
                  color: "#F0F0F5",
                }}
              >
                {totalAnimated}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
