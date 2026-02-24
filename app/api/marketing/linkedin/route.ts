import { NextResponse } from "next/server";
import { getLinkedInPosts } from "@/lib/marketing-db";

export async function GET() {
  try {
    const posts = getLinkedInPosts();
    return NextResponse.json({ posts, count: posts.length });
  } catch (err) {
    console.error("[LinkedIn Posts API]", err);
    return NextResponse.json(
      { posts: [], count: 0 },
      { status: 200 }
    );
  }
}
