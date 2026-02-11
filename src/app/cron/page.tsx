"use client";

import { useEffect, useState } from "react";
import StatusDot from "@/components/StatusDot";
import { Timer, Plus, Calendar, Clock } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyJob = any;

export default function CronPage() {
  const [jobs, setJobs] = useState<AnyJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/cron")
      .then(r => r.json())
      .then(d => {
        const list = d.jobs || d || [];
        setJobs(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">Cron Jobs</h1>
          <p className="text-sm text-gray-400 mt-1">Scheduled tasks and automation</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-apple-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="card p-12 text-center">
          <Timer size={40} strokeWidth={1} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-light text-gray-400 mb-1">No cron jobs</h3>
          <p className="text-sm text-gray-300">Scheduled jobs will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {jobs.map((job, i) => {
            const schedule = typeof job.schedule === "string" ? job.schedule : job.schedule?.expr || job.expression || job.cron || "";
            const tz = typeof job.schedule === "object" ? job.schedule?.tz : "";
            const name = job.name || job.id || `Job ${i + 1}`;
            const enabled = job.enabled !== false;
            const model = job.model || "";
            const lastRun = job.lastRun || job.lastRunAt;
            const nextRun = job.nextRun || job.nextRunAt;

            return (
              <div key={job.id || i} className="card p-5">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <StatusDot status={enabled ? "online" : "offline"} />
                    <span className="text-sm font-medium text-gray-900">{name}</span>
                    {model && <span className="badge badge-gray">{model}</span>}
                  </div>
                  <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${enabled ? "bg-apple-green" : "bg-gray-200"}`}>
                    <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 mt-0.5 ${enabled ? "ml-4" : "ml-0.5"}`} />
                  </div>
                </div>
                {job.message && (
                  <p className="text-xs text-gray-500 mb-2 truncate">{job.message}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                  <span className="flex items-center gap-1"><Calendar size={11} />{schedule}</span>
                  {tz && <span className="text-gray-300">{tz}</span>}
                  {lastRun && <span className="flex items-center gap-1"><Clock size={11} />Last: {new Date(typeof lastRun === "number" && lastRun > 1e12 ? lastRun : lastRun * 1000).toLocaleString()}</span>}
                  {nextRun && <span>Next: {new Date(typeof nextRun === "number" && nextRun > 1e12 ? nextRun : nextRun * 1000).toLocaleString()}</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
