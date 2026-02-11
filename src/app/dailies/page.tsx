"use client";

import { useEffect, useState } from "react";
import {
  Newspaper,
  Clock,
  Mail,
  RefreshCw,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Calendar,
} from "lucide-react";

interface Daily {
  id: string;
  name: string;
  emoji: string;
  time: string;
  description: string;
  details: string[];
  status: "active" | "paused" | "coming-soon";
  cronId?: string;
  category: "content" | "monitoring" | "maintenance";
  addedDate: string;
}

const dailies: Daily[] = [
  {
    id: "ai-for-blondes-newsletter",
    name: "AI for Blondes Newsletter",
    emoji: "💌",
    time: "9:00 AM ET",
    description:
      "Daily AI newsletter — 8-10 curated stories written like a smart friend explaining AI over coffee. Scraped from X/Twitter and web sources, formatted as beautiful HTML email via MJML.",
    details: [
      "Scrapes X/Twitter using Scweet + web search for fresh AI news (24-48h)",
      "Curates 8-10 stories across categories: 🎨 Image Gen, 🎬 Video Gen, 💻 Coding AI, 🚀 Startups, 🍿 Drama, 🤯 Wild Demos",
      "Written in casual, jargon-free tone — fun, smart, and quick (~3 min read)",
      "Compiled from MJML template → responsive HTML email",
      "Sent via Gmail (gog) to subscriber list",
      "Design: dark navy header + pink gradient + category tags per story",
    ],
    status: "active",
    cronId: "046a3b30-66c2-49b7-ae58-9e8b971a814a",
    category: "content",
    addedDate: "2026-02-11",
  },
  {
    id: "heartbeat-checks",
    name: "Heartbeat System Checks",
    emoji: "💓",
    time: "Every few hours",
    description:
      "Periodic background checks — rotating through email inbox, calendar, weather, and social mentions. Extracts new facts to knowledge graph and maintains memory files.",
    details: [
      "Checks urgent unread emails",
      "Reviews upcoming calendar events (next 24-48h)",
      "Extracts new facts from conversations → knowledge graph",
      "Updates MEMORY.md with distilled learnings",
      "Rotates checks evenly via heartbeat-state.json",
    ],
    status: "active",
    category: "monitoring",
    addedDate: "2026-02-11",
  },
  {
    id: "memory-maintenance",
    name: "Memory Maintenance",
    emoji: "🧠",
    time: "Throughout the day",
    description:
      "Keeps the three-layer memory system healthy — daily notes, knowledge graph updates, and long-term memory curation.",
    details: [
      "Creates and updates daily notes (memory/YYYY-MM-DD.md)",
      "Syncs cross-platform context (iMessage ↔ Telegram)",
      "Updates entity facts in ~/life/ knowledge graph",
      "Prunes outdated info from current-context.md",
    ],
    status: "active",
    category: "maintenance",
    addedDate: "2026-02-11",
  },
];

const categoryColors: Record<string, string> = {
  content: "bg-pink-50 text-pink-600 border-pink-200",
  monitoring: "bg-blue-50 text-blue-600 border-blue-200",
  maintenance: "bg-amber-50 text-amber-600 border-amber-200",
};

const statusConfig: Record<string, { dot: string; label: string; icon: React.ReactNode }> = {
  active: { dot: "bg-green-500", label: "Active", icon: <CheckCircle2 size={14} className="text-green-500" /> },
  paused: { dot: "bg-yellow-500", label: "Paused", icon: <Circle size={14} className="text-yellow-500" /> },
  "coming-soon": { dot: "bg-gray-300", label: "Coming Soon", icon: <Circle size={14} className="text-gray-300" /> },
};

export default function DailiesPage() {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(i);
  }, []);

  const toggle = (id: string) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

  const activeCount = dailies.filter((d) => d.status === "active").length;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 tracking-tight">Dailies</h1>
        <p className="text-sm text-gray-400 mt-1">
          Everything Henry does every day — {activeCount} active routine{activeCount !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
            <CheckCircle2 size={20} className="text-green-500" />
          </div>
          <div>
            <p className="text-2xl font-light text-gray-900">{activeCount}</p>
            <p className="text-xs text-gray-400">Active Routines</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <Clock size={20} className="text-blue-500" />
          </div>
          <div>
            <p className="text-2xl font-light text-gray-900">
              {now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/New_York" })}
            </p>
            <p className="text-xs text-gray-400">Current Time (ET)</p>
          </div>
        </div>
        <div className="card p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center">
            <Calendar size={20} className="text-purple-500" />
          </div>
          <div>
            <p className="text-2xl font-light text-gray-900">
              {now.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" })}
            </p>
            <p className="text-xs text-gray-400">Today</p>
          </div>
        </div>
      </div>

      {/* Dailies List */}
      <div className="space-y-4">
        {dailies.map((daily) => {
          const isExpanded = expanded[daily.id];
          const status = statusConfig[daily.status];
          const catColor = categoryColors[daily.category];

          return (
            <div
              key={daily.id}
              className="card overflow-hidden transition-all duration-200 hover:shadow-md"
            >
              {/* Main Row */}
              <button
                onClick={() => toggle(daily.id)}
                className="w-full flex items-center gap-4 p-5 text-left"
              >
                {/* Emoji */}
                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl flex-shrink-0">
                  {daily.emoji}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-base font-medium text-gray-900">{daily.name}</h3>
                    {status.icon}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border ${catColor}`}>
                      {daily.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 line-clamp-1">{daily.description}</p>
                </div>

                {/* Time */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Clock size={14} className="text-gray-400" />
                  <span className="text-sm font-medium text-gray-600">{daily.time}</span>
                </div>

                {/* Chevron */}
                <div className="flex-shrink-0 text-gray-300">
                  {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </div>
              </button>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-gray-100">
                  <div className="pt-4 pl-16">
                    <p className="text-sm text-gray-600 mb-3">{daily.description}</p>
                    <ul className="space-y-1.5">
                      {daily.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-500">
                          <span className="text-gray-300 mt-0.5">•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                    <div className="flex items-center gap-4 mt-4 text-xs text-gray-400">
                      <span>Added: {daily.addedDate}</span>
                      {daily.cronId && <span>Cron ID: {daily.cronId.slice(0, 8)}…</span>}
                      <span className="flex items-center gap-1">
                        {status.icon} {status.label}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty state for when we want to add more */}
      <div className="mt-6 text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
        <p className="text-sm text-gray-400">
          New dailies will appear here as they&apos;re added
        </p>
      </div>
    </div>
  );
}
