import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CVS_DIR = path.join(process.env.HOME || "/root", ".openclaw/workspace/cvs");

interface CVInfo {
  jobTitle: string;
  company: string;
  atsScore: number | null;
  status: string;
  date: string;
  filePath: string;
}

/** Find CV file by company name (fuzzy match) */
function findCVByCompany(company: string): CVInfo | null {
  try {
    if (!fs.existsSync(CVS_DIR)) return null;

    const files = fs.readdirSync(CVS_DIR);
    
    // Clean company name for matching
    const cleanCompany = company.toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, " ")
      .trim();
    
    const companyWords = cleanCompany.split(" ").filter(w => w.length > 2);

    // Look for PDF files matching the company
    for (const file of files) {
      if (!file.endsWith(".pdf")) continue;

      const cleanFile = file.toLowerCase()
        .replace(/\.pdf$/, "")
        .replace(/ahmed nasr - /g, "")
        .replace(/[^a-z0-9\s]/g, "")
        .replace(/\s+/g, " ")
        .trim();

      // Check if any significant company word appears in filename
      const matchScore = companyWords.filter(word => 
        cleanFile.includes(word)
      ).length;
      
      // Require at least 1 word match or direct substring match
      const isMatch = matchScore >= 1 || 
        cleanFile.includes(cleanCompany.substring(0, 8)) ||
        cleanCompany.includes(cleanFile.split(" ").pop() || "");

      if (isMatch) {
        // Extract role from filename: "Ahmed Nasr - [Role] - [Company].pdf"
        const parts = file.replace(".pdf", "").split(" - ");
        const role = parts[1] || "";
        const fileCompany = parts[2] || "";

        return {
          jobTitle: role,
          company: fileCompany || company,
          atsScore: null,
          status: "Ready",
          date: new Date().toISOString().split("T")[0],
          filePath: path.join(CVS_DIR, file),
        };
      }
    }

    return null;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const company = searchParams.get("company");

  if (!company) {
    return NextResponse.json({ error: "Company parameter required" }, { status: 400 });
  }

  const cv = findCVByCompany(company);

  return NextResponse.json({ cv });
}
