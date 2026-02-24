import { NextResponse } from "next/server";
import sqlite3 from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "mission-control.db");
const MEMORY_PATH = path.join(process.env.HOME || "/root", ".openclaw/memory");

interface Goal {
  id: number;
  category: string;
  objective: string;
  status: string;
  deadline: string | null;
  progress: number;
  updatedAt: string;
}

interface Task {
  id: number;
  title: string;
  status: string;
  priority: string;
  assignee: string;
}

interface ActivityEntry {
  date: string;
  excerpt: string;
  sourceFile: string;
}

interface GoalDetailResponse {
  goal: Goal | null;
  relatedGoals: Goal[];
  relatedTasks: Task[];
  activityTimeline: ActivityEntry[];
}

function getDb() {
  return sqlite3(DB_PATH);
}

function parseGoalsFromMarkdown(): Goal[] {
  const goals: Goal[] = [];
  try {
    const GOALS_PATH = path.join(process.env.HOME || "/root", ".openclaw/workspace/GOALS.md");
    const content = fs.readFileSync(GOALS_PATH, "utf-8");
    
    const q1Idx = content.indexOf("🟡 Strategic Objectives");
    if (q1Idx !== -1) {
      const sectionStart = content.indexOf("\n", q1Idx) + 1;
      const nextH2 = content.slice(sectionStart).search(/\n## /);
      const sectionEnd = nextH2 !== -1 ? sectionStart + nextH2 : content.length;
      const section = content.slice(sectionStart, sectionEnd);
      const subSections = section.split(/\n###\s+/);
      
      let objId = 100;
      for (const sub of subSections) {
        if (!sub.trim()) continue;
        const lines = sub.split("\n");
        const categoryName = lines[0].trim();
        
        for (const line of lines.slice(1)) {
          const checkedMatch = line.match(/^[-*]\s+\[([xX ])\]\s+(.+)/);
          if (checkedMatch) {
            const objective = checkedMatch[2].replace(/✅$/, "").trim();
            const done = checkedMatch[1].toLowerCase() === "x";
            goals.push({
              id: objId++,
              category: categoryName,
              objective,
              status: done ? "Done" : "Active",
              deadline: null,
              progress: done ? 100 : 0,
              updatedAt: new Date().toISOString(),
            });
          }
        }
      }
    }
  } catch (e) {
    console.error("Error parsing GOALS.md:", e);
  }
  return goals;
}

function searchMemoryForGoal(keywords: string[]): ActivityEntry[] {
  const entries: ActivityEntry[] = [];
  
  try {
    if (!fs.existsSync(MEMORY_PATH)) return entries;
    
    const files = fs.readdirSync(MEMORY_PATH).filter(f => f.endsWith(".md"));
    
    for (const file of files) {
      const filePath = path.join(MEMORY_PATH, file);
      const content = fs.readFileSync(filePath, "utf-8");
      
      for (const keyword of keywords) {
        const regex = new RegExp(keyword, "gi");
        let match;
        while ((match = regex.exec(content)) !== null) {
          const start = Math.max(0, match.index - 80);
          const end = Math.min(content.length, match.index + keyword.length + 80);
          let excerpt = content.slice(start, end).replace(/\n/g, " ").trim();
          if (start > 0) excerpt = "..." + excerpt;
          if (end < content.length) excerpt = excerpt + "...";
          
          const dateMatch = file.match(/^(\d{4}-\d{2}-\d{2})/);
          const date = dateMatch ? dateMatch[1] : file.replace(".md", "");
          
          entries.push({
            date,
            excerpt,
            sourceFile: file,
          });
          break;
        }
      }
    }
  } catch (e) {
    console.error("Error searching memory:", e);
  }
  
  return entries.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
}

function findRelatedTasks(keywords: string[]): Task[] {
  const db = getDb();
  const tasks: Task[] = [];
  
  try {
    const searchPattern = keywords.map(k => `%${k}%`).join("|");
    const stmt = db.prepare(`
      SELECT id, title, status, priority, assignee 
      FROM tasks 
      WHERE title LIKE ? OR description LIKE ?
      ORDER BY 
        CASE priority 
          WHEN 'High' THEN 0 
          WHEN 'Medium' THEN 1 
          ELSE 2 
        END
      LIMIT 10
    `);
    
    const rows = stmt.all(searchPattern, searchPattern) as Task[];
    return rows;
  } catch (e) {
    console.error("Error finding related tasks:", e);
    return [];
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ goalId: string }> }
): Promise<NextResponse<GoalDetailResponse>> {
  const { goalId } = await params;
  const goalIdNum = parseInt(goalId, 10);
  
  if (isNaN(goalIdNum)) {
    return NextResponse.json({ 
      goal: null, 
      relatedGoals: [], 
      relatedTasks: [], 
      activityTimeline: [] 
    });
  }
  
  const db = getDb();
  
  let goal: Goal | null = null;
  
  if (goalIdNum >= 100) {
    const mdGoals = parseGoalsFromMarkdown();
    goal = mdGoals.find(g => g.id === goalIdNum) || null;
  } else {
    try {
      const stmt = db.prepare("SELECT * FROM goals WHERE id = ?");
      goal = stmt.get(goalIdNum) as Goal | null;
    } catch (e) {
      console.error("Error fetching goal from DB:", e);
    }
  }
  
  if (!goal) {
    return NextResponse.json({ 
      goal: null, 
      relatedGoals: [], 
      relatedTasks: [], 
      activityTimeline: [] 
    });
  }
  
  const keywords = goal.objective.split(/\s+/).filter(w => w.length > 3);
  
  let relatedGoals: Goal[] = [];
  try {
    const stmt = db.prepare(`
      SELECT * FROM goals 
      WHERE category = ? AND id != ? 
      ORDER BY progress DESC 
      LIMIT 3
    `);
    relatedGoals = stmt.all(goal.category, goal.id) as Goal[];
  } catch (e) {
    console.error("Error fetching related goals:", e);
  }
  
  const relatedTasks = findRelatedTasks(keywords);
  const activityTimeline = searchMemoryForGoal(keywords);
  
  return NextResponse.json({
    goal,
    relatedGoals,
    relatedTasks,
    activityTimeline,
  });
}
