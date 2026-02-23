"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface DailyNote {
  id: number;
  date: string;
  summary: string;
  updatedAt: string;
}

interface Props {
  notes: DailyNote[];
  loading: boolean;
}

export default function DailyNotesPreview({ notes, loading }: Props) {
  return (
    <Card className="bg-[#050814] border-[rgba(148,163,184,0.2)] rounded-lg" style={{ padding: 16, borderRadius: 8, minHeight: 160 }}>
      <CardHeader className="pb-1" style={{ padding: 0, marginBottom: 4 }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 18 }}>🧠</span>
            <CardTitle className="text-sm font-semibold text-[#e5e7eb]">Daily Notes</CardTitle>
          </div>
        </div>
        <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
          Last 3 days from your memory log
        </div>
      </CardHeader>

      <CardContent className="p-0" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ fontSize: 12, color: "#6b7280" }}>Loading daily notes…</div>
        ) : !notes || notes.length === 0 ? (
          <div style={{ fontSize: 12, color: "#6b7280" }}>
            No daily notes found in the last few days.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {notes.slice(0, 3).map((note) => (
              <div
                key={note.id}
                style={{
                  borderRadius: 6,
                  padding: 8,
                  backgroundColor: "rgba(15, 23, 42, 0.9)",
                  border: "1px solid rgba(55, 65, 81, 0.7)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#9ca3af" }}>
                    {note.date}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: "#d1d5db", lineHeight: 1.4, maxHeight: 60, overflow: "hidden" }}>
                  {note.summary}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
