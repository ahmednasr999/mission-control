"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Task {
  id: string;
  title: string;
  description?: string;
  assignee?: string;
  priority?: string;
  category?: string;
  due_date?: string;
  status: string;
  createdAt: string;
}

interface PipelineResponse {
  columns: {
    todo: Task[];
    inProgress: Task[];
    blocked: Task[];
    done: Task[];
  };
}

export default function OpsCalendar() {
  const [data, setData] = useState<PipelineResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetch("/api/ops/tasks")
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

  const allTasks = data
    ? [
        ...data.columns.todo,
        ...data.columns.inProgress,
        ...data.columns.blocked,
      ].filter((task) => task.due_date)
    : [];

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

  function getTasksForDay(day: number) {
    const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return allTasks.filter((task) => task.due_date === dateStr);
  }

  function getPriorityColor(priority?: string) {
    switch (priority) {
      case "high": return "#F87171";
      case "medium": return "#F59E0B";
      case "low": return "#34D399";
      default: return "#4F8EF7";
    }
  }

  function prevMonth() {
    setCurrentMonth(new Date(year, month - 1, 1));
  }
  function nextMonth() {
    setCurrentMonth(new Date(year, month + 1, 1));
  }

  const overdue = allTasks.filter(t => {
    const due = new Date(t.due_date!);
    return due < new Date() && !data?.columns.done.find(d => d.id === t.id);
  }).length;

  const upcoming = allTasks.filter(t => {
    const due = new Date(t.due_date!);
    const today = new Date();
    const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
    return due >= today && due <= weekFromNow;
  }).length;

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        <Card style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#F87171" }}>{overdue}</div>
          <div style={{ fontSize: "11px", color: "#A0A0B0", textTransform: "uppercase" }}>Overdue</div>
        </Card>
        <Card style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#F59E0B" }}>{upcoming}</div>
          <div style={{ fontSize: "11px", color: "#A0A0B0", textTransform: "uppercase" }}>Due This Week</div>
        </Card>
        <Card style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px", padding: "16px", textAlign: "center" }}>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "#4F8EF7" }}>{allTasks.length}</div>
          <div style={{ fontSize: "11px", color: "#A0A0B0", textTransform: "uppercase" }}>Total with Due Date</div>
        </Card>
      </div>

      <Card style={{ background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: "1px solid #1E2D45" }}>
          <Button variant="ghost" onClick={prevMonth} style={{ background: "transparent", border: "none", color: "#8888A0", fontSize: "18px", cursor: "pointer", padding: "8px" }}>←</Button>
          <span style={{ fontSize: "15px", fontWeight: 600, color: "#F0F0F5" }}>{monthNames[month]} {year}</span>
          <Button variant="ghost" onClick={nextMonth} style={{ background: "transparent", border: "none", color: "#8888A0", fontSize: "18px", cursor: "pointer", padding: "8px" }}>→</Button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", borderBottom: "1px solid #1E2D45" }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} style={{ padding: "10px", textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#A0A0B0", textTransform: "uppercase" }}>
              {day}
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "1px", background: "#1E2D45" }}>
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} style={{ background: "#0D1220", minHeight: "100px", padding: "8px" }} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const tasks = getTasksForDay(day);
            const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;
            const isOverdue = tasks.length > 0 && new Date(`${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`) < new Date();

            return (
              <div key={day} style={{ background: isToday ? "rgba(79, 142, 247, 0.1)" : "#0D1220", minHeight: "100px", padding: "8px", border: isToday ? "1px solid #4F8EF7" : "none" }}>
                <div style={{ fontSize: "12px", fontWeight: isToday ? 700 : 400, color: isOverdue ? "#F87171" : isToday ? "#4F8EF7" : "#8888A0", marginBottom: "4px" }}>{day}</div>
                {tasks.slice(0, 2).map((task) => (
                  <div key={task.id} style={{ fontSize: "10px", color: "#F0F0F5", background: `${getPriorityColor(task.priority)}30`, padding: "2px 4px", borderRadius: "3px", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {task.title.slice(0, 20)}
                  </div>
                ))}
                {tasks.length > 2 && <div style={{ fontSize: "10px", color: "#A0A0B0" }}>+{tasks.length - 2} more</div>}
              </div>
            );
          })}
        </div>
      </Card>

      {upcoming > 0 && (
        <Card style={{ marginTop: "24px", background: "#0D1220", border: "1px solid #1E2D45", borderRadius: "10px", padding: "16px 20px" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "#A0A0B0", textTransform: "uppercase", marginBottom: "12px" }}>Due This Week</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {allTasks.filter(t => {
              const due = new Date(t.due_date!);
              const today = new Date();
              const weekFromNow = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
              return due >= today && due <= weekFromNow;
            }).map((task) => (
              <div key={task.id} style={{ display: "flex", alignItems: "center", gap: "12px", fontSize: "13px" }}>
                <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: getPriorityColor(task.priority) }} />
                <span style={{ color: "#F0F0F5", flex: 1 }}>{task.title}</span>
                <span style={{ color: "#A0A0B0", fontSize: "12px" }}>{task.due_date}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
