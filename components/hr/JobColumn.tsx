"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Job } from "@/components/hr/JobCard";

const COLUMN_COLORS: Record<string, string> = {
  identified: "#64748B",
  applied: "#3B82F6",
  interview: "#F59E0B",
  offer: "#34D399",
  closed: "#6B7280",
};

const COLUMN_LABELS: Record<string, string> = {
  identified: "Identified",
  applied: "Applied",
  interview: "Interview",
  offer: "Offer",
  closed: "Closed",
};

function AtsScoreBadge({ score }: { score: number | null }) {
  if (score == null) {
    return (
      <Badge variant="outline" className="text-slate-500 border-slate-600 bg-slate-800/30">
        No ATS
      </Badge>
    );
  }

  const variant = score >= 85 ? "default" : score >= 70 ? "secondary" : "destructive";
  
  return (
    <Badge variant={variant as "default" | "secondary" | "destructive"} className="font-mono text-xs">
      {score}%
    </Badge>
  );
}

function StatusBadge({ status }: { status: string }) {
  const color = COLUMN_COLORS[status] || "#64748B";
  const label = COLUMN_LABELS[status] || status;
  
  return (
    <Badge style={{ 
      backgroundColor: `${color}20`, 
      color: color, 
      borderColor: `${color}50` 
    }} className="border">
      {label}
    </Badge>
  );
}

interface JobColumnProps {
  jobs: Job[];
  onJobClick: (job: Job) => void;
}

export default function JobColumn({ jobs, onJobClick }: JobColumnProps) {
  if (jobs.length === 0) {
    return (
      <div className="flex-1 min-w-[280px] p-3">
        <div className="text-xs text-slate-500 text-center py-8">
          No jobs in this column
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-w-[280px] p-3">
      <div className="flex flex-col gap-3">
        {jobs.map((job) => (
          <Card 
            key={job.id} 
            className="bg-slate-900/80 border-slate-700/50 hover:border-slate-600 cursor-pointer transition-colors"
            onClick={() => onJobClick(job)}
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-sm font-semibold text-slate-100 line-clamp-2">
                  {job.role}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="text-xs text-slate-400 mb-3">{job.company}</div>
              <div className="flex items-center gap-2 flex-wrap">
                <AtsScoreBadge score={job.atsScore} />
                <StatusBadge status={job.column} />
              </div>
              {job.nextAction && (
                <div className="mt-3 pt-3 border-t border-slate-700/50">
                  <span className="text-xs text-slate-500">Next: </span>
                  <span className="text-xs text-slate-300">{job.nextAction}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
