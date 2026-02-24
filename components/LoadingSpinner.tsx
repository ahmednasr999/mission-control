"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

const SIZES = {
  sm: "16px",
  md: "24px",
  lg: "40px",
};

export default function LoadingSpinner({ size = "md", message }: LoadingSpinnerProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "12px", padding: "24px" }}>
      <div
        style={{
          width: SIZES[size],
          height: SIZES[size],
          border: "2px solid #1E2D45",
          borderTopColor: "#4F8EF7",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      {message && <span style={{ color: "#6B7280", fontSize: "12px" }}>{message}</span>}
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
