import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { mapStatusToColumn, HRJobRow } from "@/lib/hr-db";

const GOALS_PATH = path.join(
  process.env.HOME || "/root",
  ".openclaw/workspace/GOALS.md"
);

const DB_PATH = "/root/.openclaw/workspace/mission-control/mission-control.db";
const MEMORY_PATH = path.join(process.env.HOME || "/root", ".openclaw/workspace/memory");
const CVS_DIR = path.join(process.env.HOME || "/root", ".openclaw/workspace/cvs");

export interface JobDetail {
  id: number;
  company: string;
  role: string;
  status: string;
  column: "identified" | "radar" | "applied" | "interview" | "offer" | "closed";
  atsScore: number | null;
  nextAction: string | null;
  salary: string | null;
  location: string | null;
  companyDomain: string | null;
  updatedAt: string | null;
  appliedDate: string | null;
  jdLink: string | null;
  cvHistory: CVHistoryEntry[];
  interviewNotes: TimelineEntry[];
  notes: string | null;
}

interface CVHistoryEntry {
  id: number;
  jobTitle: string;
  company: string;
  atsScore: number | null;
  status: string;
  createdAt: string;
  filePath: string | null;
}

interface TimelineEntry {
  date: string;
  excerpt: string;
  source: string;
}

function decodeJobId(jobId: string): string {
  return decodeURIComponent(jobId).replace(/-/g, " ");
}

function findJobInGoals(companyName: string): Partial<HRJobRow> | null {
  try {
    if (!fs.existsSync(GOALS_PATH)) return null;
    const content = fs.readFileSync(GOALS_PATH, "utf-8");

    const sectionMatch = content.match(
      /##\s*(?:🔴\s*)?Active Job Pipeline([\s\S]*?)(?=\n##|\n---)/i
    );
    if (!sectionMatch) return null;

    const section = sectionMatch[1];
    const rows = section.split("\n").filter((l) => l.trim().startsWith("|"));

    for (const row of rows) {
      const cells = row
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean);
      if (cells.length < 2) continue;
      if (/^[-:]+$/.test(cells[0]) || /company/i.test(cells[0])) continue;

      const company = cells[0] || "";
      const normalizedCompany = company.toLowerCase().replace(/\s+/g, " ").trim();
      const searchCompany = companyName.toLowerCase().replace(/\s+/g, " ").trim();

      if (normalizedCompany === searchCompany) {
        const role = cells[1] || "";
        const status = cells[2] || "identified";
        const nextAction = cells[3] || null;
        const link = cells[4] || null;
        const salary = cells[5] || null;

        let jdLink: string | null = null;
        if (link) {
          try {
            new URL(link);
            jdLink = link;
          } catch {
            jdLink = null;
          }
        }

        return {
          company,
          role,
          status,
          next_action: nextAction,
          link: jdLink,
          salary,
        };
      }
    }
    return null;
  } catch {
    return null;
  }
}

function findJobInDB(companyName: string): HRJobRow | null {
  try {
    const db = new Database(DB_PATH, { readonly: true });
    const row = db
      .prepare(
        `SELECT id, company, role, location, link, status, ats_score,
                next_action, salary, company_domain, applied_date, updatedAt
         FROM job_pipeline
         WHERE LOWER(company) = LOWER(?)
         LIMIT 1`
      )
      .get(companyName) as HRJobRow | undefined;
    db.close();
    return row || null;
  } catch {
    return null;
  }
}

function getCVHistory(companyName: string): CVHistoryEntry[] {
  try {
    const db = new Database(DB_PATH, { readonly: true });
    const rows = db
      .prepare(
        `SELECT id, jobTitle, company, atsScore, status, createdAt, pdfPath
         FROM cv_history
         WHERE LOWER(company) = LOWER(?)
         ORDER BY createdAt DESC`
      )
      .all(companyName) as (CVHistoryEntry & { pdfPath: string | null })[];
    db.close();

    return rows.map((row) => {
      let filePath: string | null = null;
      if (row.pdfPath && fs.existsSync(row.pdfPath)) {
        filePath = row.pdfPath;
      } else if (row.jobTitle) {
        try {
          const cvFiles = fs.readdirSync(CVS_DIR).filter((f) => f.endsWith(".pdf"));
          for (const file of cvFiles) {
            const cleanFile = file.toLowerCase().replace(/\.pdf$/, "").replace(/ahmed nasr - /g, "");
            const searchStr = companyName.toLowerCase();
            if (cleanFile.includes(searchStr.replace(/\s+/g, ""))) {
              filePath = path.join(CVS_DIR, file);
              break;
            }
          }
        } catch {
          // CVS_DIR might not exist
        }
      }

      return {
        id: row.id,
        jobTitle: row.jobTitle,
        company: row.company,
        atsScore: row.atsScore,
        status: row.status,
        createdAt: row.createdAt,
        filePath,
      };
    });
  } catch {
    return [];
  }
}

function scanMemoryForCompany(companyName: string): TimelineEntry[] {
  const results: TimelineEntry[] = [];
  const searchTerms = companyName.toLowerCase().split(/\s+/).filter((t) => t.length > 2);

  if (!fs.existsSync(MEMORY_PATH)) return results;

  try {
    const files = fs.readdirSync(MEMORY_PATH).filter((f) => f.endsWith(".md"));

    for (const file of files) {
      const filePath = path.join(MEMORY_PATH, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const lowerContent = content.toLowerCase();

      const hasMatch = searchTerms.some((term) => lowerContent.includes(term));
      if (!hasMatch) continue;

      const fileNameDate = file.match(/^(\d{4}-\d{2}-\d{2})/);
      const date = fileNameDate ? fileNameDate[1] : "Unknown";

      const lines = content.split("\n");
      const matchingLines: string[] = [];
      for (const line of lines) {
        const lowerLine = line.toLowerCase();
        if (searchTerms.some((term) => lowerLine.includes(term))) {
          const clean = line.trim().replace(/^[-*]\s*/, "").substring(0, 150);
          if (clean.length > 10) {
            matchingLines.push(clean);
          }
        }
      }

      if (matchingLines.length > 0) {
        results.push({
          date,
          excerpt: matchingLines.slice(0, 3).join(" | "),
          source: file,
        });
      }
    }

    results.sort((a, b) => {
      if (a.date === "Unknown") return 1;
      if (b.date === "Unknown") return -1;
      return b.date.localeCompare(a.date);
    });

    return results;
  } catch {
    return [];
  }
}

function getInterviewPrepLink(): string | null {
  const prepPath = path.join(MEMORY_PATH, "interview-prep-protocol.md");
  if (fs.existsSync(prepPath)) {
    return "/api/memory/view?file=interview-prep-protocol.md";
  }
  return null;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params;
    const companyName = decodeJobId(jobId);

    let jobData = findJobInGoals(companyName);
    let source = "goals";

    if (!jobData) {
      const dbJob = findJobInDB(companyName);
      if (dbJob) {
        jobData = {
          id: dbJob.id,
          company: dbJob.company,
          role: dbJob.role,
          status: dbJob.status,
          next_action: dbJob.next_action,
          link: dbJob.link,
          salary: dbJob.salary,
          location: dbJob.location,
          company_domain: dbJob.company_domain,
          updatedAt: dbJob.updatedAt,
          applied_date: dbJob.applied_date,
          ats_score: dbJob.ats_score,
        };
        source = "database";
      }
    }

    if (!jobData || !jobData.company) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const cvHistory = getCVHistory(companyName);
    const interviewNotes = scanMemoryForCompany(companyName);
    const interviewPrepLink = getInterviewPrepLink();

    const jobDetail: JobDetail = {
      id: typeof jobData.id === "number" ? jobData.id : 1,
      company: jobData.company || companyName,
      role: jobData.role || "Unknown Role",
      status: jobData.status || "identified",
      column: mapStatusToColumn(jobData.status || null),
      atsScore: jobData.ats_score ?? null,
      nextAction: jobData.next_action ?? null,
      salary: jobData.salary ?? null,
      location: jobData.location ?? null,
      companyDomain: jobData.company_domain ?? null,
      updatedAt: jobData.updatedAt ?? null,
      appliedDate: jobData.applied_date ?? null,
      jdLink: jobData.link ?? null,
      cvHistory,
      interviewNotes,
      notes: null,
    };

    return NextResponse.json({
      job: jobDetail,
      interviewPrepLink,
      source,
    });
  } catch (err) {
    console.error("[HR Job Detail API]", err);
    return NextResponse.json({ error: "Failed to fetch job details" }, { status: 500 });
  }
}
