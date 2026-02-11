"use client";
import StatusDot from "./StatusDot";
import { MessageSquare, Clock, Cpu } from "lucide-react";

const channelBadge: Record<string, { label: string; class: string }> = {
  bluebubbles: { label: "iMessage", class: "badge-blue" },
  telegram: { label: "Telegram", class: "badge-blue" },
  whatsapp: { label: "WhatsApp", class: "badge-green" },
  discord: { label: "Discord", class: "badge-gray" },
  webchat: { label: "Web", class: "badge-gray" },
  cron: { label: "Cron", class: "badge-orange" },
  subagent: { label: "Sub-agent", class: "badge-gray" },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function SessionCard({ session }: { session: any }) {
  const key = session.key || session.sessionKey || session.id || "unknown";
  const channel = session.channel || session.lastChannel || "";
  const kind = session.kind || "";
  const badge = channelBadge[channel] || channelBadge[kind] || { label: channel || "Session", class: "badge-gray" };
  const model = session.model || "—";
  const tokens = session.totalTokens || 0;
  const label = session.label || session.displayName || key;
  const isActive = session.status !== "ended";

  return (
    <div className="card p-5 cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <StatusDot status={isActive ? "online" : "offline"} />
          <span className="text-sm font-medium text-gray-900 truncate max-w-[240px]">{label}</span>
        </div>
        <span className={`badge ${badge.class}`}>{badge.label}</span>
      </div>
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1"><Cpu size={12} />{model}</span>
        <span className="flex items-center gap-1"><MessageSquare size={12} />{tokens.toLocaleString()} tokens</span>
      </div>
    </div>
  );
}
