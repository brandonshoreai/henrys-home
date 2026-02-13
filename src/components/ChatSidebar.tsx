"use client";

import { Plus, X, MessageSquare } from "lucide-react";

export interface ChatThread {
  id: string;
  title: string;
  createdAt: string;
  messages: { role: "user" | "assistant"; content: string; timestamp: string }[];
}

interface ChatSidebarProps {
  threads: ChatThread[];
  activeThreadId: string | null;
  onSelectThread: (id: string) => void;
  onNewThread: () => void;
  onDeleteThread: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function groupThreads(threads: ChatThread[]): { label: string; threads: ChatThread[] }[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterday = today - 86400000;
  const week = today - 7 * 86400000;

  const groups: { label: string; threads: ChatThread[] }[] = [
    { label: "Today", threads: [] },
    { label: "Yesterday", threads: [] },
    { label: "Previous 7 Days", threads: [] },
    { label: "Older", threads: [] },
  ];

  const sorted = [...threads].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  for (const t of sorted) {
    const ct = new Date(t.createdAt).getTime();
    if (ct >= today) groups[0].threads.push(t);
    else if (ct >= yesterday) groups[1].threads.push(t);
    else if (ct >= week) groups[2].threads.push(t);
    else groups[3].threads.push(t);
  }

  return groups.filter(g => g.threads.length > 0);
}

export default function ChatSidebar({ threads, activeThreadId, onSelectThread, onNewThread, onDeleteThread, isOpen, onClose }: ChatSidebarProps) {
  const groups = groupThreads(threads);

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/30 z-40 md:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-[280px] bg-gray-50 z-50 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:relative md:translate-x-0 md:z-auto
        ${isOpen ? "md:flex" : "md:hidden"}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <button
            onClick={onNewThread}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 active:scale-95 transition-all flex-1"
          >
            <Plus size={16} />
            New chat
          </button>
          <button onClick={onClose} className="ml-2 p-2 text-gray-400 hover:text-gray-600 md:hidden">
            <X size={20} />
          </button>
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto py-2">
          {groups.map(group => (
            <div key={group.label}>
              <p className="px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wider">{group.label}</p>
              {group.threads.map(thread => (
                <div
                  key={thread.id}
                  onClick={() => { onSelectThread(thread.id); onClose(); }}
                  className={`group flex items-center gap-3 px-4 py-3 mx-2 rounded-xl cursor-pointer transition-colors ${
                    thread.id === activeThreadId ? "bg-gray-200" : "hover:bg-gray-100"
                  }`}
                >
                  <MessageSquare size={16} className="flex-shrink-0 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 truncate">{thread.title}</p>
                    <p className="text-xs text-gray-400">{timeAgo(thread.messages.length > 0 ? thread.messages[thread.messages.length - 1].timestamp : thread.createdAt)}</p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); onDeleteThread(thread.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-opacity"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          ))}
          {threads.length === 0 && (
            <p className="text-center text-sm text-gray-400 mt-8">No conversations yet</p>
          )}
        </div>
      </div>
    </>
  );
}
