"use client";

import { useEffect, useState } from "react";
import MetricCard from "@/components/MetricCard";
import StatusDot from "@/components/StatusDot";
import DonutChart from "@/components/DonutChart";
import { Activity, Cpu, DollarSign, Users, Clock } from "lucide-react";

interface HealthData {
  online: boolean;
  pid?: number;
  uptime?: number;
  memory?: { rss: number; heapUsed: number; heapTotal: number };
  version?: string;
}

function formatUptime(s: number) {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function formatBytes(b: number) { return `${(b / 1048576).toFixed(0)} MB`; }

export default function DashboardHome() {
  const [health, setHealth] = useState<HealthData | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sessions, setSessions] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [cronJobs, setCronJobs] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [skills, setSkills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [healthRes, sessionsRes, cronRes, skillsRes] = await Promise.all([
          fetch("/api/health").then(r => r.json()).catch(() => ({ online: false })),
          fetch("/api/sessions").then(r => r.json()).catch(() => ({ sessions: [] })),
          fetch("/api/cron").then(r => r.json()).catch(() => ({ jobs: [] })),
          fetch("/api/skills").then(r => r.json()).catch(() => ({ skills: [] })),
        ]);
        setHealth(healthRes);
        const sList = sessionsRes.sessions || sessionsRes || [];
        setSessions(Array.isArray(sList) ? sList : []);
        const jList = cronRes.jobs || cronRes || [];
        setCronJobs(Array.isArray(jList) ? jList : []);
        const skList = skillsRes.skills || skillsRes || [];
        setSkills(Array.isArray(skList) ? skList : []);
      } catch {
        setHealth({ online: false });
      } finally {
        setLoading(false);
      }
    }
    load();
    const i = setInterval(load, 30000);
    return () => clearInterval(i);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-apple-blue border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isOnline = health?.online ?? false;
  const sessionCount = sessions.length;
  const dmCount = sessions.filter((s: { kind?: string; channel?: string }) => s.kind === "dm" || (!s.kind && s.channel)).length;
  const cronCount = sessions.filter((s: { kind?: string; key?: string }) => s.kind === "cron" || (s.key && s.key.includes(":cron:"))).length;
  const subCount = sessions.filter((s: { kind?: string; key?: string }) => s.kind === "subagent" || s.kind === "other" || (s.key && s.key.includes(":subagent:"))).length;

  const totalTokens = sessions.reduce((sum: number, s: { totalTokens?: number }) => sum + (s.totalTokens || 0), 0);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">System overview and key metrics</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <MetricCard
          title="System Health"
          value={isOnline ? "Online" : "Offline"}
          icon={<Cpu size={18} />}
        >
          <div className="flex items-center gap-2 mt-2">
            <StatusDot status={isOnline ? "online" : "offline"} />
            <span className="text-xs text-gray-400">
              {isOnline ? (health?.version ? `v${health.version}` : `PID ${health?.pid || "—"}`) : "Gateway unreachable"}
            </span>
          </div>
          {health?.uptime && (
            <p className="text-xs text-gray-400 mt-1">Uptime: {formatUptime(health.uptime)}</p>
          )}
          {health?.memory && (
            <p className="text-xs text-gray-400">Memory: {formatBytes(health.memory.rss)}</p>
          )}
        </MetricCard>

        <MetricCard
          title="Active Sessions"
          value={sessionCount}
          icon={<Users size={18} />}
        >
          <div className="flex gap-2 mt-2 flex-wrap">
            {dmCount > 0 && <span className="badge badge-blue">{dmCount} DM</span>}
            {cronCount > 0 && <span className="badge badge-orange">{cronCount} Cron</span>}
            {subCount > 0 && <span className="badge badge-gray">{subCount} Sub</span>}
            {sessionCount === 0 && <span className="text-xs text-gray-300">No active sessions</span>}
          </div>
        </MetricCard>

        <MetricCard
          title="Total Tokens"
          value={totalTokens.toLocaleString()}
          icon={<Activity size={18} />}
        >
          <p className="text-xs text-gray-400 mt-2">Across all sessions</p>
        </MetricCard>

        <MetricCard
          title="Resources"
          value={`${skills.length} Skills`}
          subtitle={`${cronJobs.length} Cron Jobs`}
          icon={<DollarSign size={18} />}
        />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Skills */}
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Installed Skills</h3>
          {skills.length === 0 ? (
            <p className="text-xs text-gray-300 text-center py-8">No skills loaded</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {skills.map((s: { name?: string; description?: string; enabled?: boolean }, i: number) => (
                <div key={s.name || i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <span className="text-sm text-gray-700">{s.name || String(s)}</span>
                  <StatusDot status={s.enabled !== false ? "online" : "offline"} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cron Jobs */}
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Cron Jobs</h3>
          {cronJobs.length === 0 ? (
            <p className="text-xs text-gray-300 text-center py-8">No cron jobs configured</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {cronJobs.map((j: { id?: string; name?: string; schedule?: { expr?: string } | string; enabled?: boolean }, i: number) => (
                <div key={j.id || i} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                  <div>
                    <span className="text-sm text-gray-700">{j.name || j.id || `Job ${i + 1}`}</span>
                    <span className="text-xs text-gray-400 ml-2">
                      {typeof j.schedule === "string" ? j.schedule : j.schedule?.expr || ""}
                    </span>
                  </div>
                  <StatusDot status={j.enabled !== false ? "online" : "offline"} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Sessions */}
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-4">Recent Sessions</h3>
          {sessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-gray-300">
              <Clock size={32} strokeWidth={1} />
              <p className="text-sm mt-3">No sessions</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sessions.slice(0, 10).map((s: { key?: string; label?: string; displayName?: string; channel?: string; model?: string; totalTokens?: number }, i: number) => (
                <div key={s.key || i} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-apple-blue mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">{s.label || s.displayName || s.key}</p>
                    <p className="text-xs text-gray-400">{s.channel || "—"} · {s.model || "—"} · {(s.totalTokens || 0).toLocaleString()} tokens</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
