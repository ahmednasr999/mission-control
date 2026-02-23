"use client";

import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Alert_Item {
  text: string;
  deadline: string;
  severity: "red" | "amber" | "yellow";
}

interface AlertBannerProps {
  alerts: Alert_Item[];
}

const colorSchemes = {
  red: {
    className: "border-red-500/50 bg-red-950/30",
    dotClass: "bg-red-500",
    textClass: "text-red-300",
    subClass: "text-red-400",
    emoji: "🔴",
    label: "URGENT",
    pulse: true,
  },
  amber: {
    className: "border-amber-500/50 bg-amber-950/20",
    dotClass: "bg-amber-400",
    textClass: "text-amber-200",
    subClass: "text-amber-300",
    emoji: "🟠",
    label: "SOON",
    pulse: false,
  },
  yellow: {
    className: "border-yellow-500/40 bg-yellow-950/10",
    dotClass: "bg-yellow-400",
    textClass: "text-yellow-200",
    subClass: "text-yellow-300",
    emoji: "🟡",
    label: "UPCOMING",
    pulse: false,
  },
};

export default function AlertBanner({ alerts }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (!alerts || alerts.length === 0 || dismissed) return null;

  const topAlert = alerts[0];
  const colors = colorSchemes[topAlert.severity];

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
        .alert-slide { animation: slideDown 0.4s ease; }
        .pulse-dot { animation: pulseGlow 1.5s ease-in-out infinite; }
      `}</style>

      <Alert
        className={`alert-slide cursor-pointer mb-4 ${colors.className} hover:-translate-y-0.5 transition-all`}
        onClick={() => setDismissed(true)}
        title="Click to dismiss"
      >
        <AlertDescription className="flex items-center gap-3">
          {/* Pulse dot */}
          <span className={`w-2 h-2 rounded-full shrink-0 ${colors.dotClass} ${colors.pulse ? "pulse-dot" : ""}`} />

          <span className={`text-sm font-semibold ${colors.textClass}`}>
            {colors.emoji}&nbsp;
            {topAlert.text}
            <span className={`${colors.subClass} font-normal ml-2`}>
              — due {topAlert.deadline}
            </span>
          </span>

          {alerts.length > 1 && (
            <span className={`ml-3 text-xs opacity-70 ${colors.textClass}`}>
              +{alerts.length - 1} more deadline{alerts.length > 2 ? "s" : ""}
            </span>
          )}

          <span className={`ml-auto text-[10px] font-mono opacity-60 ${colors.textClass} shrink-0`}>
            dismiss ×
          </span>
        </AlertDescription>
      </Alert>
    </>
  );
}
