/**
 * parser.ts — Markdown parsers for each memory file type
 * All parsers return arrays of typed records ready for SQLite upsert.
 */

// ---- Types ----

export interface ParsedTask {
  title: string;
  status: string;      // derived from emoji: 🔴=Urgent, 🟡=InProgress, 🟢=Recurring, ✅=Done, 📋=Backlog
  category: string;
  description: string;
  priority: string;
  source: string;
}

export interface ParsedJobPipeline {
  company: string;
  role: string;
  location: string;
  link: string;
  jd_status: string;
  cv_status: string;
  status: string;
  ats_score: number | null;
}

export interface ParsedContentPipeline {
  stage: string;
  title: string;
  pillar: string;
  file_path: string;
  word_count: number | null;
  scheduled_date: string;
  published_date: string;
  performance: string;
}

export interface ParsedGoal {
  category: string;
  objective: string;
  status: string;
  deadline: string;
  progress: number;
}

export interface ParsedMemoryHighlight {
  section: string;
  content: string;
  file_source: string;
}

export interface ParsedDailyNote {
  date: string;
  content: string;
  summary: string;
}

export interface ParsedCVHistory {
  jobTitle: string;
  company: string;
  atsScore: number | null;
  status: string;
  notes: string;
}

// ---- Helpers ----

function getEmojiStatus(line: string): string {
  if (line.includes('🔴')) return 'Urgent';
  if (line.includes('🟡')) return 'InProgress';
  if (line.includes('🟢')) return 'Recurring';
  if (line.includes('✅')) return 'Done';
  if (line.includes('📋')) return 'Backlog';
  return 'Unknown';
}

function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .trim();
}

function parsePipeTable(lines: string[]): string[][] {
  const dataRows: string[][] = [];
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;
    if (trimmed.replace(/\|/g, '').replace(/-/g, '').replace(/\s/g, '') === '') continue; // separator
    const cols = trimmed
      .split('|')
      .map(c => c.trim())
      .filter((_, i, arr) => i > 0 && i < arr.length - 1); // remove first/last empty
    if (cols.length > 0) dataRows.push(cols);
  }
  return dataRows;
}

// ---- Parsers ----

/**
 * Parse active-tasks.md → tasks array
 * Sections are marked with emoji headings: ## 🔴 Urgent, ## 🟡 In Progress, etc.
 */
export function parseActiveTasks(content: string): ParsedTask[] {
  const tasks: ParsedTask[] = [];
  const lines = content.split('\n');

  let currentStatus = 'Unknown';
  let currentTitle = '';
  let descLines: string[] = [];
  let inTask = false;

  const flush = () => {
    if (currentTitle) {
      tasks.push({
        title: stripMarkdown(currentTitle),
        status: currentStatus,
        category: inferCategory(currentTitle),
        description: descLines.join('\n').trim(),
        priority: statusToPriority(currentStatus),
        source: 'active-tasks.md',
      });
    }
    currentTitle = '';
    descLines = [];
    inTask = false;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Section heading with emoji
    if (trimmed.startsWith('## ')) {
      flush();
      currentStatus = getEmojiStatus(trimmed);
      inTask = false;
      continue;
    }

    // Task heading (### or -)
    if (trimmed.startsWith('### ')) {
      flush();
      currentTitle = trimmed.replace(/^###\s*/, '');
      inTask = true;
      continue;
    }

    // Bullet item that might be a task within a section
    if (!inTask && trimmed.startsWith('- ') && currentStatus !== 'Unknown') {
      // inline task in a list section
      const taskTitle = trimmed.replace(/^-\s*/, '').replace(/✅\s*/, '');
      if (taskTitle && !taskTitle.startsWith('**')) {
        tasks.push({
          title: stripMarkdown(taskTitle),
          status: currentStatus,
          category: inferCategory(taskTitle),
          description: '',
          priority: statusToPriority(currentStatus),
          source: 'active-tasks.md',
        });
      }
      continue;
    }

    // Description lines under a task heading
    if (inTask && trimmed) {
      descLines.push(trimmed);
    }
  }

  flush();
  return tasks.filter(t => t.title.length > 0);
}

function statusToPriority(status: string): string {
  if (status === 'Urgent') return 'High';
  if (status === 'InProgress') return 'Medium';
  if (status === 'Done') return 'Low';
  return 'Medium';
}

function inferCategory(title: string): string {
  const t = title.toLowerCase();
  if (t.includes('interview') || t.includes('cv') || t.includes('job') || t.includes('apply')) return 'Job Search';
  if (t.includes('content') || t.includes('linkedin') || t.includes('post')) return 'Content';
  if (t.includes('openclaw') || t.includes('mission control') || t.includes('agent')) return 'System';
  if (t.includes('memory') || t.includes('goals')) return 'Admin';
  return 'General';
}

/**
 * Parse GOALS.md job pipeline table → job_pipeline records
 */
export function parseJobPipeline(content: string): ParsedJobPipeline[] {
  const jobs: ParsedJobPipeline[] = [];
  const lines = content.split('\n');

  // Find the job pipeline table section
  let inTable = false;
  let headerParsed = false;
  let headers: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.toLowerCase().includes('job pipeline') && trimmed.startsWith('#')) {
      inTable = true;
      headerParsed = false;
      continue;
    }

    if (inTable && trimmed.startsWith('|')) {
      const cols = trimmed
        .split('|')
        .map(c => c.trim())
        .filter((_, i, arr) => i > 0 && i < arr.length - 1);

      // Separator row
      if (cols.every(c => /^[-:]+$/.test(c))) {
        headerParsed = true;
        continue;
      }

      if (!headerParsed) {
        headers = cols.map(h => h.toLowerCase());
        continue;
      }

      // Data row
      if (cols.length >= 2) {
        const get = (name: string) => {
          const idx = headers.indexOf(name);
          return idx >= 0 ? (cols[idx] || '').trim() : '';
        };

        const company = get('company') || cols[0] || '';
        const role = get('role') || cols[1] || '';
        const stage = get('stage') || get('status') || cols[2] || '';
        const nextAction = get('next action') || get('next') || cols[3] || '';
        const deadline = get('deadline') || cols[4] || '';

        if (company && company !== '—' && company !== '-') {
          jobs.push({
            company: stripMarkdown(company),
            role: stripMarkdown(role),
            location: '',
            link: '',
            jd_status: stage ? 'Parsed' : '',
            cv_status: '',
            status: mapStageToStatus(stage),
            ats_score: null,
          });
        }
      }
      continue;
    }

    // Stop parsing table when we hit the next section (not a table)
    if (inTable && trimmed.startsWith('#') && !trimmed.toLowerCase().includes('job pipeline')) {
      inTable = false;
    }
  }

  return jobs;
}

function mapStageToStatus(stage: string): string {
  const s = stage.toLowerCase();
  if (s.includes('interview')) return 'Interview';
  if (s.includes('applied')) return 'Applied';
  if (s.includes('offer')) return 'Offer';
  if (s.includes('reject')) return 'Rejected';
  if (s.includes('screen')) return 'Screening';
  if (s.includes('prep')) return 'Prep';
  return stage || 'Prospect';
}

/**
 * Parse job-application-tracker.md → job_pipeline records
 * Consolidated tracker with multiple sections: Interview, Applied, Identified
 */
export function parseJobApplicationTracker(content: string): ParsedJobPipeline[] {
  const jobs: ParsedJobPipeline[] = [];
  const lines = content.split('\n');

  let currentSection = '';
  let inTable = false;
  let headerParsed = false;
  let headers: string[] = [];

  const mapStatus = (status: string): string => {
    const s = status.toLowerCase();
    if (s.includes('🎤') || s.includes('interview')) return 'Interview';
    if (s.includes('✅') || s.includes('applied') || s.includes('⏳')) return 'Applied';
    if (s.includes('💰') || s.includes('offer')) return 'Offer';
    if (s.includes('❌') || s.includes('reject')) return 'Rejected';
    if (s.includes('🆕') || s.includes('new')) return 'Identified';
    return 'Applied';
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Section headers
    if (trimmed.startsWith('## ')) {
      const sectionLower = trimmed.toLowerCase();
      if (sectionLower.includes('interview')) currentSection = 'Interview';
      else if (sectionLower.includes('applied') || sectionLower.includes('active')) currentSection = 'Applied';
      else if (sectionLower.includes('identif') || sectionLower.includes('research')) currentSection = 'Identified';
      else currentSection = '';
      inTable = false;
      headerParsed = false;
      continue;
    }

    // Table row
    if (currentSection && trimmed.startsWith('|')) {
      const cols = trimmed
        .split('|')
        .map(c => c.trim())
        .filter((_, i, arr) => i > 0 && i < arr.length - 1);

      // Skip separator
      if (cols.every(c => /^[-:]+$/.test(c) || c === '')) {
        headerParsed = true;
        continue;
      }

      // Header row
      if (!headerParsed && cols.some(c => /company|date/i.test(c))) {
        headers = cols.map(h => h.toLowerCase());
        continue;
      }

      // Data row
      if (headerParsed && cols.length >= 2) {
        const get = (name: string) => {
          const idx = headers.indexOf(name);
          return idx >= 0 ? (cols[idx] || '').trim() : '';
        };

        const date = get('date') || cols[0] || '';
        const company = get('company') || cols[1] || '';
        const role = get('role') || cols[2] || '';
        const location = get('location') || cols[3] || '';
        const status = get('status') || '';

        if (company && company !== '—' && company !== '-' && company.toLowerCase() !== 'company') {
          jobs.push({
            company: stripMarkdown(company),
            role: stripMarkdown(role) || '—',
            location: stripMarkdown(location),
            link: '',
            jd_status: status ? 'Parsed' : '',
            cv_status: '',
            status: mapStatus(status || currentSection),
            ats_score: null,
          });
        }
      }
    }
  }

  return jobs;
}

/**
 * Parse content-pipeline.md → content_pipeline records
 * Multiple tables: Ideas, In Draft, In Review, Scheduled, Published
 */
export function parseContentPipeline(content: string): ParsedContentPipeline[] {
  const items: ParsedContentPipeline[] = [];
  const lines = content.split('\n');

  let currentStage = '';
  let inTable = false;
  let headerParsed = false;
  let headers: string[] = [];

  const STAGE_SECTIONS: Record<string, string> = {
    'ideas': 'Ideas',
    'in draft': 'Draft',
    'in review': 'Review',
    'scheduled': 'Scheduled',
    'published': 'Published',
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Detect stage section heading
    if (trimmed.startsWith('##')) {
      const heading = trimmed.replace(/^#+\s*/, '').toLowerCase().replace(/[^a-z ]/g, '').trim();
      for (const [key, value] of Object.entries(STAGE_SECTIONS)) {
        if (heading.includes(key)) {
          currentStage = value;
          inTable = false;
          headerParsed = false;
          headers = [];
          break;
        }
      }
      continue;
    }

    if (trimmed.startsWith('|') && currentStage) {
      const cols = trimmed
        .split('|')
        .map(c => c.trim())
        .filter((_, i, arr) => i > 0 && i < arr.length - 1);

      if (cols.every(c => /^[-:]+$/.test(c))) {
        headerParsed = true;
        inTable = true;
        continue;
      }

      if (!headerParsed) {
        headers = cols.map(h => h.toLowerCase());
        continue;
      }

      if (cols.length < 2) continue;

      const get = (name: string) => {
        const idx = headers.findIndex(h => h.includes(name));
        return idx >= 0 ? (cols[idx] || '').trim() : '';
      };

      const title = get('title') || cols[0] || '';
      if (!title || title === '—' || title === '-') continue;

      items.push({
        stage: currentStage,
        title: stripMarkdown(title),
        pillar: get('pillar') || get('topic') || '',
        file_path: get('file') || get('path') || '',
        word_count: null,
        scheduled_date: get('scheduled') || get('schedule') || '',
        published_date: get('published') || get('publish') || '',
        performance: get('performance') || get('result') || '',
      });
    } else if (trimmed.startsWith('|') === false && inTable) {
      inTable = false;
      headerParsed = false;
    }
  }

  return items;
}

/**
 * Parse GOALS.md strategic objectives → goals records
 */
export function parseGoals(content: string): ParsedGoal[] {
  const goals: ParsedGoal[] = [];
  const lines = content.split('\n');

  let currentCategory = '';

  for (const line of lines) {
    const trimmed = line.trim();

    // Category heading: ### Executive Job Search
    if (trimmed.startsWith('### ')) {
      currentCategory = trimmed.replace(/^###\s*/, '').trim();
      continue;
    }

    // Goal items: - [ ] or - [x]
    const todoMatch = trimmed.match(/^-\s*\[([xX ]?)\]\s*(.+)/);
    if (todoMatch && currentCategory) {
      const done = todoMatch[1].toLowerCase() === 'x';
      const objective = stripMarkdown(todoMatch[2]).replace(/✅.*$/, '').trim();

      if (!objective || objective.length < 3) continue;

      // Extract deadline if present
      const deadlineMatch = objective.match(/\(([^)]+\d{4}[^)]*)\)/);
      const deadline = deadlineMatch ? deadlineMatch[1] : '';

      goals.push({
        category: currentCategory,
        objective: objective.replace(/\([^)]*\)$/, '').trim(),
        status: done ? 'Done' : 'Active',
        deadline,
        progress: done ? 100 : 0,
      });
    }
  }

  return goals;
}

/**
 * Parse MEMORY.md → memory_highlights records
 * Extract sections and their content as key highlights
 */
export function parseMemoryHighlights(content: string, fileSource: string = 'MEMORY.md'): ParsedMemoryHighlight[] {
  const highlights: ParsedMemoryHighlight[] = [];
  const lines = content.split('\n');

  let currentSection = '';
  let sectionLines: string[] = [];

  const flush = () => {
    if (currentSection && sectionLines.length > 0) {
      const sectionContent = sectionLines.join('\n').trim();
      if (sectionContent.length > 10) {
        highlights.push({
          section: currentSection,
          content: sectionContent,
          file_source: fileSource,
        });
      }
    }
    sectionLines = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('## ') || trimmed.startsWith('# ')) {
      flush();
      currentSection = trimmed.replace(/^#+\s*/, '');
      continue;
    }

    if (currentSection && trimmed) {
      sectionLines.push(trimmed);
    }
  }

  flush();
  return highlights;
}

/**
 * Parse daily notes YYYY-MM-DD.md → daily_notes record
 */
export function parseDailyNote(content: string, filePath: string): ParsedDailyNote {
  // Extract date from file path
  const dateMatch = filePath.match(/(\d{4}-\d{2}-\d{2})/);
  const date = dateMatch ? dateMatch[1] : '';

  // Generate a summary from first 3 non-empty lines after any heading
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  const summaryLines: string[] = [];

  for (const line of lines) {
    const t = line.trim();
    if (t.startsWith('#')) {
      if (summaryLines.length === 0) {
        summaryLines.push(t.replace(/^#+\s*/, ''));
      }
    } else if (summaryLines.length < 3) {
      summaryLines.push(stripMarkdown(t));
    }
    if (summaryLines.length >= 3) break;
  }

  return {
    date,
    content,
    summary: summaryLines.join(' | ').substring(0, 500),
  };
}

/**
 * Parse cv-history.md → cv_history records (supplement existing)
 */
export function parseCVHistory(content: string): ParsedCVHistory[] {
  const items: ParsedCVHistory[] = [];
  const lines = content.split('\n');

  let currentTitle = '';
  let company = '';
  let atsScore: number | null = null;
  let status = '';
  let notes = '';
  let inEntry = false;

  const flush = () => {
    if (currentTitle && company) {
      items.push({
        jobTitle: currentTitle,
        company,
        atsScore,
        status,
        notes,
      });
    }
    currentTitle = '';
    company = '';
    atsScore = null;
    status = '';
    notes = '';
    inEntry = false;
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Entry heading: ## Company - Job Title (cv-history.md format)
    if (trimmed.startsWith('## ') && !trimmed.toLowerCase().includes('cv history')) {
      flush();
      const heading = trimmed.replace(/^##\s*/, '');
      // Split on " - " for "Company - Job Title" format
      const dashIdx = heading.indexOf(' - ');
      if (dashIdx > -1) {
        company = heading.substring(0, dashIdx).trim();      // First part is company
        currentTitle = heading.substring(dashIdx + 3).trim(); // Second part is job title
      } else {
        company = heading;
        currentTitle = '';
      }
      inEntry = true;
      continue;
    }

    if (!inEntry) continue;

    // Extract fields
    const atsMatch = trimmed.match(/ats.score.*?(\d+)/i);
    if (atsMatch) { atsScore = parseInt(atsMatch[1]); continue; }

    const statusMatch = trimmed.match(/\*\*status\*\*:?\s*(.+)/i);
    if (statusMatch) { status = statusMatch[1].trim(); continue; }

    const companyMatch = trimmed.match(/\*\*company\*\*:?\s*(.+)/i);
    if (companyMatch) { company = companyMatch[1].trim(); continue; }

    const titleMatch = trimmed.match(/\*\*job.?title\*\*:?\s*(.+)/i);
    if (titleMatch) { currentTitle = titleMatch[1].trim(); continue; }

    const notesMatch = trimmed.match(/\*\*match.?notes\*\*:?\s*(.+)/i);
    if (notesMatch) { notes = notesMatch[1].trim(); continue; }
  }

  flush();
  return items;
}
