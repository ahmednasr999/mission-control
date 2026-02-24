"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import type { OpsTask } from "@/lib/ops-db";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDisplay(isoString?: string): string {
  if (!isoString) return "—";
  try {
    return new Date(isoString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      timeZone: "Africa/Cairo",
    });
  } catch {
    return isoString;
  }
}

/** Convert "high"/"medium"/"low" → "High"/"Medium"/"Low" */
function capPriority(p: string): string {
  return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label
      style={{
        fontSize: "11px",
        fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
        color: "#8888A0",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        marginBottom: "6px",
        display: "block",
      }}
    >
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid #1E2D45",
  borderRadius: "6px",
  color: "#F0F0F5",
  fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
  fontSize: "13px",
  padding: "8px 10px",
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: "pointer",
  appearance: "none" as const,
  WebkitAppearance: "none" as const,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238888A0' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat",
  backgroundPosition: "right 10px center",
  paddingRight: "30px",
};

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OpsTaskWithStatus extends OpsTask {
  status: string; // raw DB status string
}

interface OpsTaskModalProps {
  task: OpsTaskWithStatus;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

export default function OpsTaskModal({
  task,
  onClose,
  onSaved,
  onDeleted,
}: OpsTaskModalProps) {
  // Form state
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [status, setStatus] = useState(task.status ?? "To Do");
  const [priority, setPriority] = useState(capPriority(task.priority));
  const [dueDate, setDueDate] = useState(
    task.dueDate ? task.dueDate.slice(0, 10) : ""
  );
  const [category, setCategory] = useState(task.category);
  const [assignee, setAssignee] = useState(task.assignee);

  // UI state
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const backdropRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === backdropRef.current) onClose();
    },
    [onClose]
  );

  const handleSave = async () => {
    if (!title.trim()) {
      setSaveError("Title cannot be empty.");
      return;
    }
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch(`/api/ops/tasks/${task.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, status, priority, dueDate, category, assignee }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSaveError(err.error ?? "Save failed");
        setSaving(false);
        return;
      }
      onSaved();
    } catch {
      setSaveError("Network error — please retry");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/ops/tasks/${task.id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSaveError(err.error ?? "Delete failed");
        setDeleting(false);
        setConfirmDelete(false);
        return;
      }
      onDeleted();
    } catch {
      setSaveError("Network error — please retry");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const focusedBorder = (field: string) =>
    focusedField === field ? "#3B82F6" : "#1E2D45";

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(4, 8, 20, 0.85)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* Modal panel */}
      <div
        style={{
          background: "linear-gradient(145deg, #0D1220 0%, #0A0F1E 100%)",
          border: "1px solid #1E2D45",
          borderRadius: "12px",
          width: "100%",
          maxWidth: "580px",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 24px 64px rgba(0,0,0,0.6), 0 0 0 1px rgba(59,130,246,0.08)",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 20px 14px",
            borderBottom: "1px solid #1E2D45",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            background: "#0D1220",
            zIndex: 1,
          }}
        >
          <div>
            <span
              style={{
                fontFamily: "var(--font-syne, Syne, sans-serif)",
                fontSize: "15px",
                fontWeight: 700,
                color: "#F0F0F5",
                letterSpacing: "-0.02em",
              }}
            >
              Task Details
            </span>
            <span
              style={{
                fontSize: "11px",
                color: "#8888A0",
                fontFamily: "var(--font-dm-mono, DM Mono, monospace)",
                marginLeft: "10px",
              }}
            >
              #{task.id}
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid #1E2D45",
              borderRadius: "6px",
              color: "#8888A0",
              cursor: "pointer",
              width: "30px",
              height: "30px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "16px",
              lineHeight: 1,
              transition: "color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#F0F0F5";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#3B82F6";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#8888A0";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "#1E2D45";
            }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px" }}>
          {/* Title */}
          <div style={{ marginBottom: "16px" }}>
            <FieldLabel>Title</FieldLabel>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onFocus={() => setFocusedField("title")}
              onBlur={() => setFocusedField(null)}
              placeholder="Task title"
              style={{ ...inputStyle, borderColor: focusedBorder("title"), fontSize: "15px", fontWeight: 600 }}
            />
          </div>

          {/* Description */}
          <div style={{ marginBottom: "16px" }}>
            <FieldLabel>Description</FieldLabel>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onFocus={() => setFocusedField("desc")}
              onBlur={() => setFocusedField(null)}
              placeholder="What needs to be done?"
              rows={4}
              style={{
                ...inputStyle,
                borderColor: focusedBorder("desc"),
                resize: "vertical",
                minHeight: "90px",
                lineHeight: 1.5,
              }}
            />
          </div>

          {/* Row: Status + Priority */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
            <div>
              <FieldLabel>Status</FieldLabel>
              <div style={{ position: "relative" }}>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  onFocus={() => setFocusedField("status")}
                  onBlur={() => setFocusedField(null)}
                  style={{ ...selectStyle, borderColor: focusedBorder("status") }}
                >
                  <option value="To Do">To Do</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Blocked">Blocked</option>
                  <option value="Done">Done</option>
                </select>
              </div>
            </div>

            <div>
              <FieldLabel>Priority</FieldLabel>
              <div style={{ position: "relative" }}>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  onFocus={() => setFocusedField("priority")}
                  onBlur={() => setFocusedField(null)}
                  style={{ ...selectStyle, borderColor: focusedBorder("priority") }}
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Row: Due Date + Category */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px", marginBottom: "16px" }}>
            <div>
              <FieldLabel>Due Date</FieldLabel>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                onFocus={() => setFocusedField("dueDate")}
                onBlur={() => setFocusedField(null)}
                style={{
                  ...inputStyle,
                  borderColor: focusedBorder("dueDate"),
                  colorScheme: "dark",
                }}
              />
            </div>

            <div>
              <FieldLabel>Category</FieldLabel>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                onFocus={() => setFocusedField("category")}
                onBlur={() => setFocusedField(null)}
                placeholder="e.g. Engineering"
                style={{ ...inputStyle, borderColor: focusedBorder("category") }}
              />
            </div>
          </div>

          {/* Assignee */}
          <div style={{ marginBottom: "16px" }}>
            <FieldLabel>Assignee</FieldLabel>
            <div style={{ position: "relative" }}>
              <select
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                onFocus={() => setFocusedField("assignee")}
                onBlur={() => setFocusedField(null)}
                style={{ ...selectStyle, borderColor: focusedBorder("assignee") }}
              >
                <option value="Unassigned">Unassigned</option>
                <option value="Ahmed">Ahmed</option>
                <option value="NASR">NASR</option>
                <option value="Adham">Adham</option>
                <option value="Heikal">Heikal</option>
                <option value="Maher">Maher</option>
                <option value="Lotfi">Lotfi</option>
              </select>
            </div>
          </div>

          {/* Metadata */}
          <div
            style={{
              display: "flex",
              gap: "20px",
              padding: "12px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid #1E2D45",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <div>
              <span style={{ fontSize: "10px", color: "#8888A0", fontFamily: "var(--font-dm-mono, DM Mono, monospace)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Created
              </span>
              <div style={{ fontSize: "12px", color: "#A0A0B0", fontFamily: "var(--font-dm-mono, DM Mono, monospace)", marginTop: "3px" }}>
                {formatDisplay(task.createdAt)}
              </div>
            </div>
            {task.completedDate && (
              <div>
                <span style={{ fontSize: "10px", color: "#8888A0", fontFamily: "var(--font-dm-mono, DM Mono, monospace)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Completed
                </span>
                <div style={{ fontSize: "12px", color: "#34D399", fontFamily: "var(--font-dm-mono, DM Mono, monospace)", marginTop: "3px" }}>
                  {formatDisplay(task.completedDate)}
                </div>
              </div>
            )}
          </div>

          {/* Error message */}
          {saveError && (
            <div
              style={{
                fontSize: "12px",
                color: "#F87171",
                background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.3)",
                borderRadius: "6px",
                padding: "8px 12px",
                marginBottom: "14px",
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              }}
            >
              {saveError}
            </div>
          )}

          {/* Confirm Delete overlay */}
          {confirmDelete && (
            <div
              style={{
                background: "rgba(248,113,113,0.08)",
                border: "1px solid rgba(248,113,113,0.3)",
                borderRadius: "8px",
                padding: "14px",
                marginBottom: "14px",
                textAlign: "center",
              }}
            >
              <p style={{ fontSize: "13px", color: "#F0F0F5", marginBottom: "12px", fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)" }}>
                Delete <strong>&quot;{task.title}&quot;</strong>? This cannot be undone.
              </p>
              <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                <button
                  onClick={() => setConfirmDelete(false)}
                  disabled={deleting}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "6px",
                    border: "1px solid #1E2D45",
                    background: "transparent",
                    color: "#A0A0B0",
                    fontSize: "12px",
                    fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  style={{
                    padding: "7px 16px",
                    borderRadius: "6px",
                    border: "1px solid rgba(248,113,113,0.5)",
                    background: "rgba(248,113,113,0.15)",
                    color: "#F87171",
                    fontSize: "12px",
                    fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                    cursor: deleting ? "not-allowed" : "pointer",
                    fontWeight: 600,
                    opacity: deleting ? 0.6 : 1,
                  }}
                >
                  {deleting ? "Deleting…" : "Yes, Delete"}
                </button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: "10px", justifyContent: "space-between" }}>
            {/* Delete */}
            {!confirmDelete && (
              <button
                onClick={() => setConfirmDelete(true)}
                disabled={saving || deleting}
                style={{
                  padding: "9px 16px",
                  borderRadius: "7px",
                  border: "1px solid rgba(248,113,113,0.35)",
                  background: "rgba(248,113,113,0.08)",
                  color: "#F87171",
                  fontSize: "13px",
                  fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,113,113,0.15)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(248,113,113,0.6)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,113,113,0.08)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(248,113,113,0.35)";
                }}
              >
                🗑 Delete
              </button>
            )}

            <div style={{ display: "flex", gap: "10px", marginLeft: "auto" }}>
              {/* Close */}
              <button
                onClick={onClose}
                disabled={saving || deleting}
                style={{
                  padding: "9px 16px",
                  borderRadius: "7px",
                  border: "1px solid #1E2D45",
                  background: "transparent",
                  color: "#A0A0B0",
                  fontSize: "13px",
                  fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                  cursor: "pointer",
                  fontWeight: 600,
                  transition: "all 0.15s",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#F0F0F5";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#3B82F6";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.color = "#A0A0B0";
                  (e.currentTarget as HTMLButtonElement).style.borderColor = "#1E2D45";
                }}
              >
                Cancel
              </button>

              {/* Save */}
              <button
                onClick={handleSave}
                disabled={saving || deleting}
                style={{
                  padding: "9px 22px",
                  borderRadius: "7px",
                  border: "1px solid rgba(59,130,246,0.5)",
                  background: saving
                    ? "rgba(59,130,246,0.15)"
                    : "linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(124,58,237,0.2) 100%)",
                  color: "#3B82F6",
                  fontSize: "13px",
                  fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                  cursor: saving ? "not-allowed" : "pointer",
                  fontWeight: 700,
                  transition: "all 0.15s",
                  opacity: saving ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!saving) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(59,130,246,0.8)";
                    (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, rgba(59,130,246,0.35) 0%, rgba(124,58,237,0.3) 100%)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!saving) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(59,130,246,0.5)";
                    (e.currentTarget as HTMLButtonElement).style.background = "linear-gradient(135deg, rgba(59,130,246,0.25) 0%, rgba(124,58,237,0.2) 100%)";
                  }
                }}
              >
                {saving ? "Saving…" : "✓ Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
