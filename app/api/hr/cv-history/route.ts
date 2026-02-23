import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getCVHistoryFromDB } from "@/lib/hr-db";

const MEMORY_DIR = path.join(
  process.env.HOME || "/root",
  ".openclaw/workspace/memory"
);

export interface CVHistoryEntry {
  id: number;
  company: string;
  role: string;
  atsScore: number | null;
  date: string;
  outcome: string;
}

/** Map a status string to a display outcome label */
function mapOutcome(status: string): string {
  const s = (status || "").toLowerCase();
  if (s.includes("interview")) return "Interview";
  if (s.includes("offer")) return "Offered";
  if (s.includes("reject")) return "Rejected";
  if (s.includes("submit") || s.includes("generated") || s.includes("ready")) return "Submitted";
  if (s.includes("withdraw")) return "Rejected";
  return "Pending";
}

/** Parse ATS score from file content like "ATS Score: 82%" or "ATS Score Estimate: 91%" or "88-92%" */
function extractAtsScore(content: string): number | null {
  // Try "ATS Score Estimate: 88-92%"
  const rangeMatch = content.match(/ATS\s+Score\s+Estimate[:\s*]*(\d+)-(\d+)%/i);
  if (rangeMatch) {
    // Take the average
    return (parseInt(rangeMatch[1]) + parseInt(rangeMatch[2])) / 2;
  }
  // Try "ATS Score: 82%" or "ATS Score Estimate: 91%"
  const match = content.match(/ATS\s+Score(?:\s+Estimate)?[:\s*]*(\d+)%/i);
  if (match) return parseInt(match[1], 10);
  return null;
}

/** Extract company name from cv-output file content */
function extractCompanyFromContent(content: string, filename: string): string {
  // Try "CV Analysis: Payfuture Director of Operations" - extract "Payfuture"
  const analysisMatch = content.match(/CV\s+Analysis:\s*([^-\n]+)/i);
  if (analysisMatch) {
    const company = analysisMatch[1].trim();
    // Clean up: remove "Ahmed Nasr - " prefix if present
    return company.replace(/^Ahmed\s+Nasr\s*-\s*/, "").trim();
  }

  // Try "Company: Foo" header first
  const companyMatch = content.match(/^\*?\*?Company\*?\*?:\s*(.+)$/im);
  if (companyMatch) return companyMatch[1].trim();

  // Try "Ahmed Nasr × Company Name" pattern
  const crossMatch = content.match(/Ahmed\s+Nasr\s*[×x]\s*(.+?)(?:\n|$)/i);
  if (crossMatch) return crossMatch[1].trim();

  // Fall back to filename: cv-output-2026-02-21-delphi → "Delphi"
  const slug = filename.replace(/^cv-output-\d{4}-\d{2}-\d{2}-/, "").replace(".md", "");
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Extract role from cv-output file content */
function extractRoleFromContent(content: string): string {
  // Try "CV Analysis: Payfuture Director of Operations" - extract "Director of Operations"
  const analysisMatch = content.match(/CV\s+Analysis:\s*[^-\n]+-\s*(.+?)(?:\n|$)/i);
  if (analysisMatch) return analysisMatch[1].trim();

  // Try "Role: Senior AI PM" header
  const roleMatch = content.match(/^\*?\*?Role\*?\*?:\s*(.+)$/im);
  if (roleMatch) return roleMatch[1].trim();

  // Try first h2 after the personal details block
  const h2Match = content.match(/^## (.+)$/m);
  if (h2Match && !/professional summary|core competencies|Ahmed Nasr/i.test(h2Match[1])) {
    return h2Match[1].trim();
  }

  return "Unknown Role";
}

/** Extract date from cv-output filename: cv-output-2026-02-21-foo.md */
function extractDateFromFilename(filename: string): string {
  const match = filename.match(/cv-output-(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : new Date().toISOString().split("T")[0];
}

/** Parse cv-history.md for structured entries */
function parseCVHistoryFile(): CVHistoryEntry[] {
  const filePath = path.join(MEMORY_DIR, "cv-history.md");
  if (!fs.existsSync(filePath)) return [];

  const content = fs.readFileSync(filePath, "utf-8");
  const entries: CVHistoryEntry[] = [];
  let idCounter = 1000; // offset to avoid collision with DB ids

  // Match blocks: ## Company - Role / **Company:** / **ATS Score:** / **Status:** / **Date:**
  const blocks = content.split(/^##\s+/m).slice(1);
  for (const block of blocks) {
    const lines = block.split("\n");
    const headline = lines[0]?.trim() || "";
    // "GMG - Transformational Senior Manager" style
    const [companyRaw, ...roleParts] = headline.split("-");
    const company = companyRaw?.trim() || "Unknown";
    const role = roleParts.join("-").trim() || "Unknown Role";

    const atsMatch = block.match(/\*?\*?ATS\s+Score\*?\*?:\s*(\d+)%/i);
    const atsScore = atsMatch ? parseInt(atsMatch[1], 10) : null;
    const statusMatch = block.match(/\*?\*?Status\*?\*?:\s*(.+?)(?:\n|$)/i);
    const outcome = mapOutcome(statusMatch?.[1] || "");
    const dateMatch = block.match(/\*?\*?Date\*?\*?:\s*(\d{4}-\d{2}-\d{2})/i);
    const date = dateMatch?.[1] || new Date().toISOString().split("T")[0];

    if (company && company !== "Unknown") {
      entries.push({ id: idCounter++, company, role, atsScore, date, outcome });
    }
  }
  return entries;
}

/** Scan memory directory for cv-output-*.md files */
function parseCVOutputFiles(): CVHistoryEntry[] {
  try {
    const files = fs.readdirSync(MEMORY_DIR).filter(
      (f) => f.startsWith("cv-output-") && f.endsWith(".md")
    );

    const entries: CVHistoryEntry[] = [];
    let idCounter = 2000;

    for (const file of files) {
      const content = fs.readFileSync(path.join(MEMORY_DIR, file), "utf-8");
      const company = extractCompanyFromContent(content, file);
      const role = extractRoleFromContent(content);
      const atsScore = extractAtsScore(content);
      const date = extractDateFromFilename(file);

      // Infer outcome: if ats_score >= 85 and exists, treat as submitted; no status clue otherwise
      entries.push({
        id: idCounter++,
        company,
        role,
        atsScore,
        date,
        outcome: "Submitted",
      });
    }

    return entries;
  } catch {
    return [];
  }
}

/** Scan cvs directory for PDF files and extract company/role from filename */
function parseCVSFolder(): CVHistoryEntry[] {
  const CVS_DIR = path.join(process.env.HOME || "/root", ".openclaw/workspace/cvs");
  
  try {
    if (!fs.existsSync(CVS_DIR)) return [];

    const files = fs.readdirSync(CVS_DIR).filter(
      (f) => f.endsWith(".pdf") && f.includes("Ahmed Nasr")
    );

    const entries: CVHistoryEntry[] = [];
    let idCounter = 3000;

    for (const file of files) {
      // Parse filename: "Ahmed Nasr - Role - Company.pdf"
      const clean = file.replace("Ahmed Nasr - ", "").replace(".pdf", "");
      const parts = clean.split(" - ");
      
      const role = parts[0] || "Unknown Role";
      const company = parts.slice(1).join(" - ") || "Unknown Company";

      // Extract date from file metadata
      const stats = fs.statSync(path.join(CVS_DIR, file));
      const date = stats.mtime.toISOString().split("T")[0];

      entries.push({
        id: idCounter++,
        company,
        role,
        atsScore: null,
        date,
        outcome: "Ready",
      });
    }

    return entries;
  } catch {
    return [];
  }
}

const FALLBACK: CVHistoryEntry[] = [
  {
    id: 1,
    company: "Delphi Consulting",
    role: "Senior AI PM",
    atsScore: 91,
    date: "2026-02-21",
    outcome: "Interview",
  },
];

export async function GET() {
  try {
    // 1) Parse cv-output-*.md files FIRST (these have ATS scores)
    const outputFiles = parseCVOutputFiles();
    
    // 2) Get DB entries
    const dbRows = getCVHistoryFromDB(100);
    
    // 3) Scan cvs folder for all PDFs
    const cvsFolder = parseCVSFolder();
    
    // Combine all sources (avoid duplicates, prefer entries with ATS scores)
    const history: CVHistoryEntry[] = [];
    const seen = new Set<string>();
    
    // Add cv-output files first (usually have ATS scores)
    for (const entry of outputFiles) {
      const key = `${entry.company}|${entry.role}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        history.push(entry);
      }
    }
    
    // Add DB entries
    for (const r of dbRows) {
      const key = `${r.company}|${r.jobTitle}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        history.push({
          id: r.id,
          company: r.company,
          role: r.jobTitle,
          atsScore: r.atsScore,
          date: r.createdAt.split("T")[0],
          outcome: mapOutcome(r.status),
        });
      }
    }
    
    // Add CVS folder entries that aren't duplicates
    for (const entry of cvsFolder) {
      const key = `${entry.company}|${entry.role}`.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        history.push(entry);
      }
    }
    
    if (history.length > 0) {
      // Sort by date descending
      history.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));
      return NextResponse.json({ history });
    }

    // Fallback: try cv-history.md file
    const fileHistory = parseCVHistoryFile();
    const merged: CVHistoryEntry[] = [];
    const seen2 = new Set<string>();

    for (const entry of fileHistory) {
      const key = `${entry.company}|${entry.role}`.toLowerCase();
      if (!seen2.has(key)) {
        seen2.add(key);
        merged.push(entry);
      }
    }

    // Sort by date descending
    merged.sort((a, b) => (b.date > a.date ? 1 : b.date < a.date ? -1 : 0));

    if (merged.length > 0) {
      return NextResponse.json({ history: merged });
    }

    // 4) Hardcoded fallback from GOALS.md
    return NextResponse.json({ history: FALLBACK });
  } catch (err) {
    console.error("[HR CV History API]", err);
    return NextResponse.json({ history: FALLBACK }, { status: 200 });
  }
}
