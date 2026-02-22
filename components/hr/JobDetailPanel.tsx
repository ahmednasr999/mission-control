"use client";

import { useState, useEffect } from "react";
import { X, FileText, Download, ExternalLink, Calendar, User, Building2, TrendingUp, CheckCircle } from "lucide-react";
import { Job } from "./JobCard";

interface CVInfo {
  jobTitle: string;
  company: string;
  atsScore: number | null;
  status: string;
  date: string;
  filePath?: string;
}

interface InterviewPrep {
  company: string;
  role: string;
  atsScore: number;
  companyResearch: string;
  roleRequirements: string[];
  likelyQuestions: string[];
  strengths: string[];
  salaryTarget: string;
  notes: string;
}

interface JobDetailPanelProps {
  job: Job | null;
  onClose: () => void;
}

function findCVForJob(job: Job): CVInfo | null {
  // Try to find CV in localStorage or return null
  // In a real implementation, this would query the API
  return null;
}

export default function JobDetailPanel({ job, onClose }: JobDetailPanelProps) {
  const [cvInfo, setCvInfo] = useState<CVInfo | null>(null);
  const [interviewPrep, setInterviewPrep] = useState<InterviewPrep | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (job) {
      setLoading(true);
      // Fetch CV info for this job
      fetch(`/api/hr/cv-lookup?company=${encodeURIComponent(job.company)}`)
        .then(r => r.json())
        .then(data => {
          setCvInfo(data.cv || null);
          setLoading(false);
        })
        .catch(() => {
          setCvInfo(null);
          setLoading(false);
        });

      // Fetch interview prep if in interview column
      if (job.column === "interview") {
        fetch(`/api/hr/interview-prep?company=${encodeURIComponent(job.company)}`)
          .then(r => r.json())
          .then(data => {
            setInterviewPrep(data.prep || null);
          })
          .catch(() => {
            setInterviewPrep(null);
          });
      }
    }
  }, [job]);

  if (!job) return null;

  const colColor = job.column === "interview" ? "#F59E0B" : 
                   job.column === "offer" ? "#34D399" : 
                   job.column === "applied" ? "#3B82F6" : "#64748B";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(4px)",
          zIndex: 999,
          opacity: job ? 1 : 0,
          transition: "opacity 0.3s ease",
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: "420px",
          maxWidth: "100vw",
          height: "100vh",
          background: "#080C16",
          borderLeft: "1px solid #1E2D45",
          zIndex: 1000,
          transform: job ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #1E2D45",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontFamily: "var(--font-syne, Syne, sans-serif)",
                fontSize: "20px",
                fontWeight: 700,
                color: "#F0F0F5",
                marginBottom: "4px",
                lineHeight: 1.3,
              }}
            >
              {job.company}
            </div>
            <div
              style={{
                fontSize: "14px",
                color: "#8888A0",
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
              }}
            >
              {job.role}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "transparent",
              border: "none",
              padding: "8px",
              cursor: "pointer",
              color: "#A0A0B0",
              borderRadius: "8px",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.05)";
              e.currentTarget.style.color = "#F0F0F5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "#A0A0B0";
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
          }}
        >
          {/* Status Badge */}
          <div style={{ marginBottom: "24px" }}>
            <span
              style={{
                fontSize: "12px",
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                fontWeight: 600,
                color: colColor,
                background: `${colColor}18`,
                border: `1px solid ${colColor}40`,
                borderRadius: "20px",
                padding: "4px 12px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {job.column}
            </span>
          </div>

          {/* ATS Score */}
          {job.atsScore && (
            <div
              style={{
                background: "#0D1220",
                border: "1px solid #1E2D45",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <TrendingUp size={16} color="#4F8EF7" />
                <span
                  style={{
                    fontSize: "13px",
                    color: "#A0A0B0",
                    fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                  }}
                >
                  ATS Score
                </span>
              </div>
              <div
                style={{
                  fontSize: "32px",
                  fontWeight: 700,
                  color: job.atsScore >= 85 ? "#34D399" : job.atsScore >= 70 ? "#F59E0B" : "#F87171",
                  fontFamily: "var(--font-syne, Syne, sans-serif)",
                }}
              >
                {job.atsScore}%
              </div>
              <div style={{ marginTop: "8px" }}>
                <div
                  style={{
                    height: "6px",
                    background: "#1E2D45",
                    borderRadius: "3px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${job.atsScore}%`,
                      background: job.atsScore >= 85 ? "#34D399" : job.atsScore >= 70 ? "#F59E0B" : "#F87171",
                      borderRadius: "3px",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Job Link Section */}
          {job.link && (
            <div
              style={{
                background: "#0D1220",
                border: "1px solid #1E2D45",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <ExternalLink size={16} color="#4F8EF7" />
                <span
                  style={{
                    fontSize: "13px",
                    color: "#A0A0B0",
                    fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                  }}
                >
                  Job Posting
                </span>
              </div>
              <a
                href={job.link}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "10px 14px",
                  background: "rgba(79, 142, 247, 0.15)",
                  border: "1px solid rgba(79, 142, 247, 0.3)",
                  borderRadius: "6px",
                  color: "#4F8EF7",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none",
                  transition: "all 0.15s ease",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(79, 142, 247, 0.25)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(79, 142, 247, 0.15)";
                }}
              >
                <ExternalLink size={14} />
                {job.link.replace(/^https?:\/\//, "").substring(0, 40)}
                {job.link.length > 40 ? "..." : ""}
              </a>
            </div>
          )}

          {/* CV Section */}
          <div
            style={{
              background: "#0D1220",
              border: "1px solid #1E2D45",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "12px",
              }}
            >
              <FileText size={16} color="#4F8EF7" />
              <span
                style={{
                  fontSize: "13px",
                  color: "#A0A0B0",
                  fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                }}
              >
                Tailored CV
              </span>
            </div>

            {loading ? (
              <div style={{ color: "#A0A0B0", fontSize: "13px" }}>Loading...</div>
            ) : cvInfo ? (
              <div>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#F0F0F5",
                    marginBottom: "12px",
                    fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                  }}
                >
                  {cvInfo.jobTitle}
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  {cvInfo.filePath && (
                    <>
                      <a
                        href={`/api/cvs/view?path=${encodeURIComponent(cvInfo.filePath)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 12px",
                          background: "rgba(79, 142, 247, 0.15)",
                          border: "1px solid rgba(79, 142, 247, 0.3)",
                          borderRadius: "6px",
                          color: "#4F8EF7",
                          fontSize: "12px",
                          fontWeight: 600,
                          textDecoration: "none",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(79, 142, 247, 0.25)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "rgba(79, 142, 247, 0.15)";
                        }}
                      >
                        <ExternalLink size={14} />
                        View
                      </a>
                      <a
                        href={`/api/cvs/download?path=${encodeURIComponent(cvInfo.filePath)}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "8px 12px",
                          background: "transparent",
                          border: "1px solid #1E2D45",
                          borderRadius: "6px",
                          color: "#A0A0B0",
                          fontSize: "12px",
                          fontWeight: 600,
                          textDecoration: "none",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "#2a3f5f";
                          e.currentTarget.style.color = "#F0F0F5";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "#1E2D45";
                          e.currentTarget.style.color = "#A0A0B0";
                        }}
                      >
                        <Download size={14} />
                        Download
                      </a>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <div
                style={{
                  color: "#8888A0",
                  fontSize: "13px",
                  fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                }}
              >
                No CV found for this job
              </div>
            )}
          </div>

          {/* Job Details */}
          <div
            style={{
              background: "#0D1220",
              border: "1px solid #1E2D45",
              borderRadius: "10px",
              padding: "16px",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                color: "#A0A0B0",
                marginBottom: "12px",
                fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                fontWeight: 600,
              }}
            >
              Application Details
            </div>

            {job.salary && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                <span style={{ color: "#8888A0", fontSize: "12px" }}>Salary:</span>
                <span style={{ color: "#F0F0F5", fontSize: "13px" }}>{job.salary}</span>
              </div>
            )}

            {job.updatedAt && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "10px",
                }}
              >
                <Calendar size={14} color="#8888A0" />
                <span style={{ color: "#8888A0", fontSize: "12px" }}>Last updated:</span>
                <span style={{ color: "#F0F0F5", fontSize: "13px" }}>
                  {new Date(job.updatedAt).toLocaleDateString("en-GB")}
                </span>
              </div>
            )}

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <CheckCircle size={14} color="#8888A0" />
              <span style={{ color: "#8888A0", fontSize: "12px" }}>Status:</span>
              <span style={{ color: "#F0F0F5", fontSize: "13px", textTransform: "capitalize" }}>
                {job.column}
              </span>
            </div>
          </div>

          {/* Interview Prep Section - Only show for interview column */}
          {job.column === "interview" && interviewPrep && (
            <div
              style={{
                background: "#0D1220",
                border: "1px solid #F59E0B40",
                borderRadius: "10px",
                padding: "16px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "12px",
                }}
              >
                <span style={{ fontSize: "16px" }}>🎯</span>
                <span
                  style={{
                    fontSize: "13px",
                    color: "#F59E0B",
                    fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                    fontWeight: 600,
                  }}
                >
                  Interview Prep
                </span>
              </div>

              {/* Company Research */}
              {interviewPrep.companyResearch && (
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "11px", color: "#A0A0B0", marginBottom: "4px", textTransform: "uppercase" }}>Company</div>
                  <div style={{ fontSize: "12px", color: "#F0F0F5", lineHeight: 1.4 }}>
                    {interviewPrep.companyResearch}
                  </div>
                </div>
              )}

              {/* Role Requirements */}
              {interviewPrep.roleRequirements.length > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "11px", color: "#A0A0B0", marginBottom: "4px", textTransform: "uppercase" }}>Key Requirements</div>
                  {interviewPrep.roleRequirements.map((req, i) => (
                    <div key={i} style={{ fontSize: "12px", color: "#F0F0F5", paddingLeft: "8px", marginBottom: "2px" }}>• {req}</div>
                  ))}
                </div>
              )}

              {/* Likely Questions */}
              {interviewPrep.likelyQuestions.length > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "11px", color: "#A0A0B0", marginBottom: "4px", textTransform: "uppercase" }}>Likely Questions</div>
                  {interviewPrep.likelyQuestions.slice(0, 3).map((q, i) => (
                    <div key={i} style={{ fontSize: "11px", color: "#8888A0", paddingLeft: "8px", marginBottom: "2px", fontStyle: "italic" }}>"{q}"</div>
                  ))}
                </div>
              )}

              {/* Your Strengths */}
              {interviewPrep.strengths.length > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "11px", color: "#A0A0B0", marginBottom: "4px", textTransform: "uppercase" }}>Your Strengths</div>
                  {interviewPrep.strengths.map((s, i) => (
                    <div key={i} style={{ fontSize: "12px", color: "#34D399", paddingLeft: "8px", marginBottom: "2px" }}>✓ {s}</div>
                  ))}
                </div>
              )}

              {/* Salary Target */}
              {interviewPrep.salaryTarget && (
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontSize: "11px", color: "#A0A0B0", marginBottom: "4px", textTransform: "uppercase" }}>Salary Target</div>
                  <div style={{ fontSize: "13px", color: "#F59E0B", fontWeight: 600 }}>{interviewPrep.salaryTarget}</div>
                </div>
              )}

              {/* Notes */}
              {interviewPrep.notes && (
                <div>
                  <div style={{ fontSize: "11px", color: "#A0A0B0", marginBottom: "4px", textTransform: "uppercase" }}>Notes</div>
                  <div style={{ fontSize: "12px", color: "#F0F0F5", lineHeight: 1.4 }}>{interviewPrep.notes}</div>
                </div>
              )}
            </div>
          )}

          {/* Next Action */}
          {job.nextAction && (
            <div
              style={{
                background: "#0D1220",
                border: "1px solid #1E2D45",
                borderRadius: "10px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "13px",
                  color: "#A0A0B0",
                  marginBottom: "8px",
                  fontFamily: "var(--font-dm-sans, DM Sans, sans-serif)",
                  fontWeight: 600,
                }}
              >
                Next Action
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#F0F0F5",
                  lineHeight: 1.5,
                }}
              >
                {job.nextAction}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
