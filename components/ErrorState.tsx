"use client";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({ message = "Failed to load", onRetry }: ErrorStateProps) {
  return (
    <div style={{ 
      display: "flex", 
      flexDirection: "column", 
      alignItems: "center", 
      gap: "12px", 
      padding: "24px",
      color: "#F87171",
      textAlign: "center"
    }}>
      <span style={{ fontSize: "24px" }}>⚠️</span>
      <span style={{ fontSize: "13px", color: "#9CA3AF" }}>{message}</span>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            padding: "8px 16px",
            background: "rgba(79, 142, 247, 0.15)",
            border: "1px solid #4F8EF7",
            borderRadius: "6px",
            color: "#4F8EF7",
            fontSize: "12px",
            cursor: "pointer",
          }}
        >
          Tap to retry
        </button>
      )}
    </div>
  );
}
