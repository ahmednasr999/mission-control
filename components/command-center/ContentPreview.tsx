"use client";

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
}

function StageColumn({ label, count, color, bg }: StageColumnProps) {
  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
      }}
    >
      {/* Count bubble - larger and clearer */}
      <div
        style={{
          width: "56px",
          height: "56px",
          borderRadius: "14px",
          background: bg,
          border: `2px solid ${count > 0 ? color : "#1E2D45"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-syne, Syne, sans-serif)",
          fontSize: "22px",
          fontWeight: 800,
          color: count > 0 ? color : "#555570",
          boxShadow: count > 0 ? `0 4px 12px ${color}20` : "none",
        }}
      >
        {count}
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          fontSize: "11px",
          color: count > 0 ? "#8888A0" : "#555570",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 600,
          textAlign: "center",
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
  const data = stages || { ideas: 0, draft: 0, review: 0, published: 0 };

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
          padding: "16px 20px 14px",
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
        <span
          style={{
            fontSize: "11px",
            color: "#555570",
            fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
          }}
        >
          KANBAN
        </span>
      </div>

      {/* Stages */}
      <div style={{ padding: "24px 20px" }}>
        {loading ? (
          <div
            style={{
              textAlign: "center",
              color: "#555570",
              fontSize: "13px",
              fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
            }}
          >
            Loading…
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0",
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
                />
                {i < STAGES.length - 1 && (
                  <div
                    style={{
                      fontSize: "20px",
                      color: "#2a3f5f",
                      flexShrink: 0,
                      margin: "0 -4px",
                      paddingBottom: "28px",
                      opacity: 0.6,
                    }}
                  >
                    →
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Total note */}
        {!loading && (
          <div
            style={{
              marginTop: "16px",
              paddingTop: "16px",
              borderTop: "1px solid #1E2D45",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                color: "#555570",
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              }}
            >
              Total pieces
            </span>
            <span
              style={{
                fontSize: "13px",
                fontWeight: 700,
                fontFamily: "var(--font-syne, Syne, sans-serif)",
                color: "#8888A0",
              }}
            >
              {data.ideas + data.draft + data.review + data.published}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
