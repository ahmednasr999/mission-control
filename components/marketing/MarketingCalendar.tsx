"use client";

import { useEffect, useState } from "react";
import type { ContentItem } from "@/lib/marketing-db";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PipelineResponse {
  columns: {
    ideas: ContentItem[];
    draft: ContentItem[];
    review: ContentItem[];
    scheduled: ContentItem[];
    published: ContentItem[];
  };
}

export default function MarketingCalendar() {
  const [data, setData] = useState<PipelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetch("/api/marketing/pipeline")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#A0A0B0" }}>
        Loading calendar...
      </div>
    );
  }

  // Get all items with dates
  const allItems = data
    ? Object.values(data.columns).flat().filter((item) => item.date && item.date !== "—")
    : [];

  // Generate calendar days
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startDayOfWeek = firstDay.getDay();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Get items for a specific day
  function getItemsForDay(day: number) {
    const dateStr = `${monthNames[month].slice(0, 3)} ${day}`;
    return allItems.filter((item) => item.date?.includes(dateStr));
  }

  // Navigate months
  function prevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1));
  }

  return (
    <Card style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px", overflow: "hidden" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          borderBottom: "1px solid #1E2D45",
        }}
      >
        <Button
          variant="ghost"
          onClick={prevMonth}
          style={{
            background: "transparent",
            border: "none",
            color: "#8888A0",
            fontSize: "18px",
            cursor: "pointer",
            padding: "8px",
          }}
        >
          ←
        </Button>
        <span
          style={{
            fontSize: "15px",
            fontWeight: 600,
            color: "#F0F0F5",
          }}
        >
          {monthNames[month]} {year}
        </span>
        <Button
          variant="ghost"
          onClick={nextMonth}
          style={{
            background: "transparent",
            border: "none",
            color: "#8888A0",
            fontSize: "18px",
            cursor: "pointer",
            padding: "8px",
          }}
        >
          →
        </Button>
      </div>

      {/* Day Headers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          borderBottom: "1px solid #1E2D45",
        }}
      >
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div
            key={day}
            style={{
              padding: "10px",
              textAlign: "center",
              fontSize: "11px",
              fontWeight: 600,
              color: "#A0A0B0",
              textTransform: "uppercase",
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, 1fr)",
          gap: "1px",
          background: "#1E2D45",
        }}
      >
        {/* Empty cells before first day */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div
            key={`empty-${i}`}
            style={{
              background: "#0D1220",
              minHeight: "100px",
              padding: "8px",
            }}
          />
        ))}

        {/* Days */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const items = getItemsForDay(day);
          const isToday =
            new Date().getDate() === day &&
            new Date().getMonth() === month &&
            new Date().getFullYear() === year;

          return (
            <div
              key={day}
              style={{
                background: isToday ? "rgba(79, 142, 247, 0.1)" : "#0D1220",
                minHeight: "100px",
                padding: "8px",
                border: isToday ? "1px solid #4F8EF7" : "none",
              }}
            >
              <div
                style={{
                  fontSize: "12px",
                  fontWeight: isToday ? 700 : 400,
                  color: isToday ? "#4F8EF7" : "#8888A0",
                  marginBottom: "4px",
                }}
              >
                {day}
              </div>
              {items.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  style={{
                    fontSize: "10px",
                    color: "#F0F0F5",
                    background: "rgba(79, 142, 247, 0.2)",
                    padding: "2px 4px",
                    borderRadius: "3px",
                    marginBottom: "2px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.title}
                </div>
              ))}
              {items.length > 2 && (
                <div style={{ fontSize: "10px", color: "#A0A0B0" }}>
                  +{items.length - 2} more
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Scheduled Items List */}
      {allItems.length > 0 && (
        <div
          style={{
            borderTop: "1px solid #1E2D45",
            padding: "16px 20px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#A0A0B0",
              marginBottom: "12px",
              textTransform: "uppercase",
            }}
          >
            Upcoming ({allItems.length})
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {allItems.slice(0, 5).map((item) => (
              <div
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "13px",
                }}
              >
                <span
                  style={{
                    background: "rgba(79, 142, 247, 0.2)",
                    color: "#4F8EF7",
                    padding: "2px 8px",
                    borderRadius: "4px",
                    fontSize: "11px",
                    fontWeight: 600,
                    minWidth: "60px",
                    textAlign: "center",
                  }}
                >
                  {item.date}
                </span>
                <span style={{ color: "#F0F0F5" }}>{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
