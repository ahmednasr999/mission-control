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
    companyResearch: "Mid-size consultancy, UAE/GCC focus. Data, Analytics, AI, Cloud, Security, App Modernization. Enterprise clients on digital transformation.",
    roleRequirements: [
      "8+ years PM in UAE/GCC",
      "Digital transformation, AI/ML",
      "Agile/Scrum, Power Platform",
      "$25M+ portfolio"
    ],
    likelyQuestions: [
      "Tell me about a digital transformation you led",
      "How do you manage scope creep?",
      "Describe your approach to stakeholder management",
      "What's your experience with AI/ML projects?",
      "How do you handle conflicting priorities?"
    ],
    strengths: [
      "Scaled Talabat 30K→7M orders",
      "$50M PMO at TopMed",
      "PMP, CSM, CSPO (cert match)",
      "Arabic/English bilingual",
      "FinTech + HealthTech + e-commerce breadth"
    ],
    salaryTarget: "50,000-55,000 AED/month",
    notes: "Interview with Kritika Chhabra. Emphasize $50M transformation, 15-hospital network, Talabat scale story."
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
