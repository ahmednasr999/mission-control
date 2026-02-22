const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const os = require('os');

const DB_PATH = path.join(process.cwd(), 'mission-control.db');
const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

const MEMORY_DIR = path.join(os.homedir(), '.openclaw', 'workspace', 'memory');
const ROOT_DIR = path.join(os.homedir(), '.openclaw', 'workspace');

function cairoNow() {
  return new Date().toLocaleString('en-CA', {
    timeZone: 'Africa/Cairo',
    hour12: false,
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).replace(', ', 'T');
}

function stripMd(text) {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .trim();
}

const now = cairoNow();
console.log('Cairo time:', now);

// Test: Write goals from GOALS.md
const goalsContent = fs.readFileSync(path.join(ROOT_DIR, 'GOALS.md'), 'utf-8');
const gLines = goalsContent.split('\n');
let category = '';
let goals = [];

for (const line of gLines) {
  const t = line.trim();
  if (t.startsWith('### ')) category = t.replace(/^###\s*/, '');
  const m = t.match(/^-\s*\[([xX ]?)\]\s*(.+)/);
  if (m && category) {
    const obj = stripMd(m[2]).replace(/✅.*$/, '').trim();
    if (obj.length > 2) {
      goals.push({
        category,
        objective: obj,
        status: m[1].toLowerCase() === 'x' ? 'Done' : 'Active',
        deadline: '',
        progress: 0
      });
    }
  }
}
console.log('Goals to sync:', goals.length);

const goalsInsert = db.prepare('INSERT OR IGNORE INTO goals (category, objective, status, deadline, progress, updatedAt) VALUES (?, ?, ?, ?, ?, ?)');
const goalsExisting = db.prepare('SELECT id FROM goals WHERE category = ? AND objective = ?');
let goalsInserted = 0;

for (const g of goals) {
  const found = goalsExisting.get(g.category, g.objective);
  if (!found) {
    goalsInsert.run(g.category, g.objective, g.status, g.deadline, g.progress, now);
    goalsInserted++;
  }
}
db.prepare('INSERT INTO sync_log (file, status, rows_affected, syncedAt) VALUES (?, ?, ?, ?)').run('GOALS.md', 'ok', goalsInserted, now);
console.log('Goals inserted:', goalsInserted);

// Test: Write content_pipeline from content-pipeline.md
const cpContent = fs.readFileSync(path.join(MEMORY_DIR, 'content-pipeline.md'), 'utf-8');
const cpLines = cpContent.split('\n');
let stage = '';
let cpInserted = 0;
const cpInsertStmt = db.prepare('INSERT OR IGNORE INTO content_pipeline (stage, title, pillar, file_path, updatedAt) VALUES (?, ?, ?, ?, ?)');
const cpExisting = db.prepare('SELECT id FROM content_pipeline WHERE stage = ? AND title = ?');

for (const line of cpLines) {
  const t = line.trim();
  if (t.startsWith('##')) {
    const h = t.replace(/^#+\s*/, '').replace(/[^\w ]/g, '').toLowerCase().trim();
    if (h.includes('idea')) stage = 'Ideas';
    else if (h.includes('draft')) stage = 'Draft';
    else if (h.includes('review')) stage = 'Review';
    else if (h.includes('schedul')) stage = 'Scheduled';
    else if (h.includes('publish')) stage = 'Published';
  }
  if (t.startsWith('|') && stage) {
    const cols = t.split('|').map(c => c.trim()).filter((c, i, a) => i > 0 && i < a.length - 1);
    if (cols.length >= 2 && !cols.every(c => /^[-:]+$/.test(c)) && cols[0] !== 'Topic' && cols[0] !== 'Title') {
      if (cols[0] && cols[0] !== '—' && cols[0] !== '-') {
        const title = stripMd(cols[0]);
        const found = cpExisting.get(stage, title);
        if (!found) {
          cpInsertStmt.run(stage, title, cols[1] || '', '', now);
          cpInserted++;
        }
      }
    }
  }
}
db.prepare('INSERT INTO sync_log (file, status, rows_affected, syncedAt) VALUES (?, ?, ?, ?)').run('content-pipeline.md', 'ok', cpInserted, now);
console.log('Content pipeline inserted:', cpInserted);

// Test: Write daily notes
const dailyFiles = fs.readdirSync(MEMORY_DIR).filter(f => /^\d{4}-\d{2}-\d{2}\.md$/.test(f));
console.log('Daily note files found:', dailyFiles.length);
let notesInserted = 0;

for (const f of dailyFiles) {
  const filePath = path.join(MEMORY_DIR, f);
  const noteContent = fs.readFileSync(filePath, 'utf-8');
  const date = f.replace('.md', '');
  
  // Generate summary
  const noteLines = noteContent.split('\n').filter(l => l.trim().length > 0);
  const summaryLines = [];
  for (const line of noteLines) {
    const nt = line.trim();
    if (nt.startsWith('#')) {
      if (summaryLines.length === 0) summaryLines.push(nt.replace(/^#+\s*/, ''));
    } else if (summaryLines.length < 3) {
      summaryLines.push(stripMd(nt));
    }
    if (summaryLines.length >= 3) break;
  }
  const summary = summaryLines.join(' | ').substring(0, 500);
  
  db.prepare(`
    INSERT INTO daily_notes (date, content, summary, updatedAt)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(date) DO UPDATE SET content = excluded.content, summary = excluded.summary, updatedAt = excluded.updatedAt
  `).run(date, noteContent, summary, now);
  notesInserted++;
}
db.prepare('INSERT INTO sync_log (file, status, rows_affected, syncedAt) VALUES (?, ?, ?, ?)').run('daily_notes', 'ok', notesInserted, now);
console.log('Daily notes inserted/updated:', notesInserted);

// Final verification
console.log('\n=== Final Row Counts ===');
const tables = ['goals', 'content_pipeline', 'daily_notes', 'memory_highlights', 'job_pipeline', 'sync_log'];
tables.forEach(t => {
  const count = db.prepare('SELECT COUNT(*) as cnt FROM ' + t).get();
  console.log(' ', t.padEnd(25), count.cnt, 'rows');
});

console.log('\n=== Sync Log ===');
const logs = db.prepare('SELECT file, status, rows_affected, syncedAt FROM sync_log ORDER BY syncedAt DESC LIMIT 8').all();
logs.forEach(l => console.log(' ', l.file.padEnd(25), l.status.padEnd(8), l.rows_affected, 'rows |', l.syncedAt));

db.close();
console.log('\n✅ All write tests passed');
