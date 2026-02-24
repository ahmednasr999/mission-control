"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface DiskHealth {
  used: number;
  total: number;
  available: number;
  usagePercent: number;
  status: "healthy" | "warning" | "action" | "critical";
  lastCheck: string;
}

export default function DiskHealthCard() {
  const [health, setHealth] = useState<DiskHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const res = await fetch("/api/disk-health");
        const data = await res.json();
        setHealth(data);
      } catch (error) {
        console.error("Failed to fetch disk health:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
    // Refresh every 5 minutes
    const interval = setInterval(fetchHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !health) {
    return (
      <Card style={{ borderRadius: "10px", border: "1px solid #1E2D45" }}>
        <CardHeader>
          <CardTitle>💾 Disk Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div style={{ color: "#A0A0B0" }}>Loading...</div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = () => {
    switch (health.status) {
      case "healthy":
        return "#34D399";
      case "warning":
        return "#FBBF24";
      case "action":
        return "#F87171";
      case "critical":
        return "#EF4444";
      default:
        return "#A0A0B0";
    }
  };

  const getStatusText = () => {
    switch (health.status) {
      case "healthy":
        return "✅ Healthy";
      case "warning":
        return "⚠️ Monitor";
      case "action":
        return "🟠 Action Needed";
      case "critical":
        return "🔴 Critical";
      default:
        return "Unknown";
    }
  };

  const lastCheckTime = new Date(health.lastCheck).toLocaleTimeString();

  return (
    <Card
      style={{
        borderRadius: "10px",
        border: "1px solid #1E2D45",
        background: "#0D1220",
      }}
    >
      <CardHeader>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <CardTitle>💾 Disk Health</CardTitle>
          <Badge
            style={{
              background: getStatusColor() + "20",
              color: getStatusColor(),
              borderColor: getStatusColor() + "40",
              border: "1px solid",
            }}
          >
            {getStatusText()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Usage Percentage */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "8px",
                fontSize: "14px",
              }}
            >
              <span style={{ color: "#F0F0F5", fontWeight: 600 }}>
                {health.usagePercent}% Used
              </span>
              <span style={{ color: "#A0A0B0" }}>
                {health.used.toFixed(1)}GB / {health.total.toFixed(1)}GB
              </span>
            </div>
            <Progress
              value={health.usagePercent}
              style={{ height: "6px" }}
              className="bg-slate-700"
            />
          </div>

          {/* Available Space */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "12px",
              fontSize: "13px",
            }}
          >
            <div style={{ padding: "8px 12px", background: "#0A0F1A", borderRadius: "6px", border: "1px solid #1E2D45" }}>
              <div style={{ color: "#A0A0B0", marginBottom: "4px" }}>Available</div>
              <div style={{ color: "#34D399", fontWeight: 600, fontSize: "14px" }}>
                {health.available.toFixed(1)}GB
              </div>
            </div>
            <div style={{ padding: "8px 12px", background: "#0A0F1A", borderRadius: "6px", border: "1px solid #1E2D45" }}>
              <div style={{ color: "#A0A0B0", marginBottom: "4px" }}>Last Check</div>
              <div style={{ color: "#8888A0", fontFamily: "var(--font-dm-mono, monospace)", fontSize: "12px" }}>
                {lastCheckTime}
              </div>
            </div>
          </div>

          {/* Status Details */}
          {health.status !== "healthy" && (
            <div
              style={{
                padding: "10px 12px",
                background: getStatusColor() + "15",
                border: `1px solid ${getStatusColor()}40`,
                borderRadius: "6px",
                fontSize: "12px",
                color: "#F0F0F5",
              }}
            >
              {health.status === "critical" &&
                "🚨 Immediate cleanup required. Contact admin."}
              {health.status === "action" &&
                "🟠 Disk usage high. Cleanup recommended."}
              {health.status === "warning" &&
                "⚠️ Monitor disk usage closely."}
            </div>
          )}

          {/* Auto-Refresh Info */}
          <div
            style={{
              fontSize: "11px",
              color: "#6B7280",
              fontFamily: "var(--font-dm-mono, monospace)",
              textAlign: "center",
            }}
          >
            Auto-refreshes every 5 minutes
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
