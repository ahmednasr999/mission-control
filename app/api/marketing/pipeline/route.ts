import { NextResponse } from "next/server";
import { getPipelineColumns } from "@/lib/marketing-db";

export async function GET() {
  try {
    const columns = getPipelineColumns();
    return NextResponse.json({ columns });
  } catch (err) {
    console.error("[Marketing Pipeline API]", err);
    return NextResponse.json(
      {
        columns: {
          ideas: [],
          draft: [],
          review: [],
          scheduled: [],
          published: [],
        },
      },
      { status: 200 }
    );
  }
}
