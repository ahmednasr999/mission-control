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
        gap: "8px",
      }}
    >
      {/* Count bubble */}
      <div
        style={{
          width: "64px",
          height: "64px",
          borderRadius: "16px",
          background: bg,
          border: `2px solid ${count > 0 ? color : "#1E2D45"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-syne, Syne, sans-serif)",
          fontSize: "28px",
          fontWeight: 800,
          color: count > 0 ? color : "#A0A0B0",
          boxShadow: count > 0 ? `0 4px 16px ${color}30` : "none",
        }}
      >
        {count}
      </div>

      {/* Label */}
      <div
        style={{
          fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
          fontSize: "15px",
          color: count > 0 ? "#F0F0F5" : "#8888A0",
          fontWeight: 600,
          textAlign: "center",
          marginTop: "4px",
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
            fontSize: "13px",
            color: "#4F8EF7",
            fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
            fontWeight: 600,
            background: "rgba(79, 142, 247, 0.1)",
            padding: "4px 10px",
            borderRadius: "6px",
          }}
        >
          KANBAN
        </span>
      </div>

      {/* Stages */}
      <div style={{ padding: "28px 24px" }}>
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
                />
                {i < STAGES.length - 1 && (
                  <div
                    style={{
                      fontSize: "16px",
                      color: "#1E2D45",
                      flexShrink: 0,
                      margin: "0 -8px",
                      paddingBottom: "24px",
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
              {data.ideas + data.draft + data.review + data.published}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
