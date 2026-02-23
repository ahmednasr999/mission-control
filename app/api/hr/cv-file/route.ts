import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CVS_DIR = path.join(process.env.HOME || "/root", ".openclaw/workspace/cvs");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const company = searchParams.get("company") || "";

  try {
    if (!fs.existsSync(CVS_DIR)) {
      return NextResponse.json({ error: "CV directory not found" }, { status: 404 });
    }

    const files = fs.readdirSync(CVS_DIR);
    
    // Find PDF matching company
    const cleanCompany = company.toLowerCase().replace(/[^a-z0-9]/g, "");
    
    for (const file of files) {
      if (!file.endsWith(".pdf")) continue;
      
      const cleanFile = file.toLowerCase().replace(/[^a-z0-9]/g, "");
      
      if (cleanFile.includes(cleanCompany)) {
        const filePath = path.join(CVS_DIR, file);
        const fileBuffer = fs.readFileSync(filePath);
        
        return new NextResponse(fileBuffer, {
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `inline; filename="${file}"`,
          },
        });
      }
    }

    return NextResponse.json({ error: "CV not found" }, { status: 404 });
  } catch {
    return NextResponse.json({ error: "Error loading CV" }, { status: 500 });
  }
}
