"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Menu } from "lucide-react";
import ChatSidebar, { ChatThread } from "../../components/ChatSidebar";
import ChatMessage from "../../components/ChatMessage";
import ChatInput from "../../components/ChatInput";

const STORAGE_KEY = "mc-chat-threads";

function loadThreads(): ChatThread[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch { return []; }
}

function saveThreads(threads: ChatThread[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(threads));
}

function newThread(): ChatThread {
  return {
    id: crypto.randomUUID(),
    title: "New chat",
    createdAt: new Date().toISOString(),
    messages: [],
  };
}

const SUGGESTIONS = [
  "Plan a new project",
  "Review my docs",
  "What should I work on today?",
  "Summarize recent activity",
];

export default function ChatPage() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // Init from localStorage
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const saved = loadThreads();
    if (saved.length > 0) {
      setThreads(saved);
      setActiveId(saved[0].id);
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (threads.length > 0) saveThreads(threads);
  }, [threads]);

  // Scroll to bottom on new messages
  const activeThread = threads.find(t => t.id === activeId);
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeThread?.messages.length, sending]);

  const handleNewThread = useCallback(() => {
    const t = newThread();
    setThreads(prev => [t, ...prev]);
    setActiveId(t.id);
  }, []);

  const handleSelectThread = useCallback((id: string) => {
    setActiveId(id);
  }, []);

  const handleDeleteThread = useCallback((id: string) => {
    setThreads(prev => {
      const next = prev.filter(t => t.id !== id);
      if (next.length === 0) localStorage.removeItem(STORAGE_KEY);
      return next;
    });
    setActiveId(prev => prev === id ? (threads.find(t => t.id !== id)?.id || null) : prev);
  }, [threads]);

  const handleSend = useCallback(async (text: string) => {
    if (sending) return;

    let threadId = activeId;

    // Create thread if none active
    if (!threadId) {
      const t = newThread();
      setThreads(prev => [t, ...prev]);
      threadId = t.id;
      setActiveId(t.id);
      // Need to wait for state to settle
      await new Promise(r => setTimeout(r, 0));
    }

    const userMsg = { role: "user" as const, content: text, timestamp: new Date().toISOString() };

    setThreads(prev => prev.map(t =>
      t.id === threadId ? { ...t, messages: [...t.messages, userMsg] } : t
    ));
    setSending(true);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120_000);
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
        signal: controller.signal,
      });
      clearTimeout(timeout);
      const data = await res.json();
      const content = res.ok ? (data.response || "No response") : (data.error || `Error (${res.status})`);
      const assistantMsg = { role: "assistant" as const, content, timestamp: new Date().toISOString() };

      setThreads(prev => prev.map(t => {
        if (t.id !== threadId) return t;
        const msgs = [...t.messages, assistantMsg];
        // Auto-title after first response
        const title = t.title === "New chat" && t.messages.length >= 1
          ? (t.messages[0].content.slice(0, 40) + (t.messages[0].content.length > 40 ? "..." : ""))
          : t.title;
        return { ...t, messages: msgs, title };
      }));
    } catch (e: any) {
      const errorContent = e?.name === "AbortError"
        ? "⏱ Request timed out. Henry might still be working — try again in a moment."
        : "Failed to reach the gateway. Is it running?";
      setThreads(prev => prev.map(t =>
        t.id === threadId ? { ...t, messages: [...t.messages, { role: "assistant" as const, content: errorContent, timestamp: new Date().toISOString() }] } : t
      ));
    } finally {
      setSending(false);
    }
  }, [activeId, sending]);

  const messages = activeThread?.messages || [];

  return (
    <div className="flex h-[calc(100vh-10rem)] md:h-[calc(100vh-4rem)] -mx-4 md:-mx-8 -mt-4 md:-mt-8">
      {/* Sidebar */}
      <ChatSidebar
        threads={threads}
        activeThreadId={activeId}
        onSelectThread={handleSelectThread}
        onNewThread={handleNewThread}
        onDeleteThread={handleDeleteThread}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-sm font-medium text-gray-700 truncate">
            {activeThread?.title || "New chat"}
          </h1>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.length === 0 && !sending ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                <div className="text-7xl mb-6">🦞</div>
                <h2 className="text-2xl font-light text-gray-800 mb-8">How can I help?</h2>
                <div className="flex flex-wrap gap-3 justify-center max-w-lg">
                  {SUGGESTIONS.map(s => (
                    <button
                      key={s}
                      onClick={() => handleSend(s)}
                      className="px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-600 hover:bg-gray-100 hover:border-gray-300 active:scale-95 transition-all"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {messages.map((msg, i) => (
                  <ChatMessage
                    key={i}
                    role={msg.role}
                    content={msg.content}
                    timestamp={msg.timestamp}
                    isLast={i === messages.length - 1}
                  />
                ))}
                {/* Typing indicator */}
                {sending && (
                  <div className="flex gap-3 mb-6">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-base">
                      🦞
                    </div>
                    <div className="flex items-center gap-1.5 py-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </>
            )}
          </div>
        </div>

        {/* Input area */}
        <ChatInput onSend={handleSend} disabled={sending} />
      </div>
    </div>
  );
}
