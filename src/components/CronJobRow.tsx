"use client";
import { CronJob } from "@/lib/types";
import StatusDot from "./StatusDot";
import { Clock, Play, Calendar } from "lucide-react";

export default function CronJobRow({ job }: { job: CronJob }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <StatusDot status={job.enabled ? (job.status === "running" ? "running" : "online") : "offline"} />
          <span className="text-sm font-medium text-gray-900">{job.name}</span>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <div className={`w-9 h-5 rounded-full transition-colors duration-200 ${job.enabled ? "bg-apple-green" : "bg-gray-200"}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${job.enabled ? "translate-x-4" : "translate-x-0.5"}`} />
          </div>
        </label>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1"><Calendar size={11} />{job.humanReadable}</span>
        <span className="flex items-center gap-1"><Clock size={11} />{job.expression}</span>
        {job.lastRun && <span>Last: {new Date(job.lastRun).toLocaleTimeString()}</span>}
      </div>
    </div>
  );
}
