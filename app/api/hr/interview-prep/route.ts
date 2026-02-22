import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MEMORY_DIR = path.join(
  process.env.HOME || "/root",
  ".openclaw/workspace/memory"
);

// Static interview prep data - loaded from memory files
const INTERVIEW_PREP_DATA: Record<string, {
  company: string;
  role: string;
  atsScore: number;
  companyResearch: string;
  roleRequirements: string[];
  likelyQuestions: string[];
  strengths: string[];
  salaryTarget: string;
  notes: string;
}> = {
  "delphi consulting": {
    company: "Delphi Consulting",
    role: "Senior AI Project Manager",
    atsScore: 91,
    companyResearch: "UAE-based consultancy specializing in Data, Advanced Analytics & AI, Infrastructure, Cloud Security, and Application Modernization. Hybrid work model, digital-first mindset, serves clients across UAE/GCC.",
    roleRequirements: [
      "8+ years PM in UAE/GCC markets",
      "End-to-end digital transformation delivery",
      "AI/ML solutions hands-on experience",
      "Power Platform (Power Apps, Power Automate)",
      ".NET & Web Applications",
      "Custom app development lifecycle",
      "SharePoint-based solutions",
      "Agile/Scrum methodologies",
      "C-level stakeholder management",
      "Budget & P&L ownership",
      "Risk management & RAID logs",
      "Government entity experience (preferred)"
    ],
    likelyQuestions: [
      "Tell me about a digital transformation you led from inception to go-live",
      "How do you manage scope creep in enterprise projects?",
      "Describe your experience with AI/ML project delivery",
      "How do you handle conflicting priorities across stakeholders?",
      "Walk me through your approach to risk management",
      "How do you ensure budget and profitability on projects?",
      "Tell me about a time you delivered under a tight deadline"
    ],
    strengths: [
      "Scaled Talabat 30K→7M orders (233x growth)",
      "$50M PMO at TopMed (current)",
      "$25M+ portfolio management experience",
      "PMP, CSM, CSPO, CBAP certified (exact JD match)",
      "Arabic/English bilingual",
      "15-hospital network transformation",
      "Power Platform implementation (40% efficiency gains)"
    ],
    salaryTarget: "50,000-55,000 AED/month",
    notes: "Interview with Kritika Chhabra. JD emphasizes: end-to-end delivery, AI/ML hands-on, Power Platform, C-level stakeholder management, budget ownership. CV highlights: $50M transformation, Talabat scale story, PMP/CSM/CSPO certs, Power Platform efficiency gains."
  }
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const company = searchParams.get("company")?.toLowerCase() || "";
  
  // Try exact match first
  let prepData = INTERVIEW_PREP_DATA[company];
  
  // Try partial match
  if (!prepData) {
    for (const key of Object.keys(INTERVIEW_PREP_DATA)) {
      if (company.includes(key) || key.includes(company)) {
        prepData = INTERVIEW_PREP_DATA[key];
        break;
      }
    }
  }
  
  // Try to load from memory files if not in static data
  if (!prepData) {
    try {
      const files = fs.readdirSync(MEMORY_DIR).filter(
        f => f.includes(company.replace(/\s+/g, "-")) && f.startsWith("cv-output-")
      );
      if (files.length > 0) {
        const content = fs.readFileSync(path.join(MEMORY_DIR, files[0]), "utf-8");
        const atsMatch = content.match(/ATS\s+Score.*?(\d+)/i);
        const atsScore = atsMatch ? parseInt(atsMatch[1]) : null;
        
        prepData = {
          company: company,
          role: "Role from JD",
          atsScore: atsScore || 0,
          companyResearch: "See CV for details",
          roleRequirements: [],
          likelyQuestions: [],
          strengths: [],
          salaryTarget: "",
          notes: ""
        };
      }
    } catch {}
  }
  
  if (prepData) {
    return NextResponse.json({ prep: prepData });
  }
  
  return NextResponse.json({ prep: null });
}
