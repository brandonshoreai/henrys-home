"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { ArrowDown, Wifi, WifiOff, Wrench, User, Bot, AlertCircle, Info } from "lucide-react";

interface FeedEvent {
  id: string;
  timestamp: Date;
  raw: Record<string, unknown>;
  kind: "message" | "tool_call" | "tool_result" | "thinking" | "error" | "system" | "unknown";
  role?: string;
  content?: string;
  toolName?: string;
  toolArgs?: string;
  toolResult?: string;
}

let eventCounter = 0;

function classifyEvent(data: Record<string, unknown>): FeedEvent {
  const id = String(++eventCounter);
  const timestamp = new Date();
  const base = { id, timestamp, raw: data };

  if (data.type === "connected") {
    return { ...base, kind: "system", content: "Connected to gateway" };
  }
  if (data.type === "disconnected") {
    return { ...base, kind: "system", content: "Disconnected from gateway" };
  }
  if (data.type === "error") {
    return { ...base, kind: "error", content: String(data.message || "Unknown error") };
  }

  // Agent events
  if (data.type === "event" && data.event === "agent") {
    const p = data.payload as Record<string, unknown> | undefined;
    if (!p) return { ...base, kind: "unknown", content: JSON.stringify(data) };

    const agentEvent = p.event as string || p.type as string || "";

    if (agentEvent === "tool_use" || agentEvent === "tool_call" || p.tool) {
      return {
        ...base,
        kind: "tool_call",
        toolName: String(p.tool || p.name || "unknown"),
        toolArgs: typeof p.args === "string" ? p.args : JSON.stringify(p.args || p.input || {}, null, 2),
      };
    }
    if (agentEvent === "tool_result") {
      return {
        ...base,
        kind: "tool_result",
        toolName: String(p.tool || p.name || ""),
        toolResult: typeof p.result === "string" ? p.result : JSON.stringify(p.result || p.output || "", null, 2),
      };
    }
    if (agentEvent === "thinking" || p.thinking) {
      return { ...base, kind: "thinking", content: String(p.thinking || p.text || p.content || "") };
    }
    if (agentEvent === "message" || p.role || p.content) {
      return {
        ...base,
        kind: "message",
        role: String(p.role || "assistant"),
        content: String(p.content || p.text || p.message || ""),
      };
    }
    return { ...base, kind: "unknown", content: JSON.stringify(p) };
  }

  // Chat history responses
  if (data.type === "res" && data.payload) {
    const p = data.payload as Record<string, unknown>;
    if (Array.isArray(p.messages)) {
      return { ...base, kind: "system", content: `Loaded ${(p.messages as unknown[]).length} history messages` };
    }
    if (Array.isArray(p.sessions)) {
      return { ...base, kind: "system", content: `Found ${(p.sessions as unknown[]).length} active sessions` };
    }
  }

  return { ...base, kind: "unknown", content: JSON.stringify(data).slice(0, 200) };
}

const kindColors: Record<string, string> = {
  message: "border-l-blue-400",
  tool_call: "border-l-orange-400",
  tool_result: "border-l-amber-300",
  thinking: "border-l-purple-300",
  error: "border-l-red-400",
  system: "border-l-green-400",
  unknown: "border-l-gray-300",
};

const kindBg: Record<string, string> = {
  error: "bg-red-50",
  system: "bg-green-50/50",
  thinking: "bg-purple-50/50",
};

function CollapsibleJSON({ label, content }: { label: string; content: string }) {
  const [open, setOpen] = useState(false);
  if (!content || content === "{}" || content === "null") return null;
  return (
    <div className="mt-1">
      <button onClick={() => setOpen(!open)} className="text-xs text-gray-400 hover:text-gray-600 underline">
        {open ? `Hide ${label}` : `Show ${label}`}
      </button>
      {open && (
        <pre className="mt-1 text-xs bg-gray-100 rounded p-2 overflow-x-auto max-h-48 text-gray-600">
          {content}
        </pre>
      )}
    </div>
  );
}

function EventCard({ event }: { event: FeedEvent }) {
  const Icon = event.kind === "tool_call" || event.kind === "tool_result" ? Wrench
    : event.role === "user" ? User
    : event.kind === "error" ? AlertCircle
    : event.kind === "system" ? Info
    : Bot;

  return (
    <div className={`border-l-4 ${kindColors[event.kind]} ${kindBg[event.kind] || ""} rounded-r-lg p-3 mb-2`}>
      <div className="flex items-center gap-2 mb-1">
        <Icon size={14} className="text-gray-400 flex-shrink-0" />
        <span className="text-[10px] font-mono text-gray-400">
          {event.timestamp.toLocaleTimeString()}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-wider text-gray-500">
          {event.kind === "message" ? (event.role || "message") : event.kind.replace("_", " ")}
        </span>
        {event.toolName && (
          <span className="text-xs font-mono bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded">
            {event.toolName}
          </span>
        )}
      </div>
      {event.content && (
        <p className="text-sm text-gray-700 whitespace-pre-wrap break-words line-clamp-6">
          {event.content}
        </p>
      )}
      {event.toolArgs && <CollapsibleJSON label="arguments" content={event.toolArgs} />}
      {event.toolResult && <CollapsibleJSON label="result" content={event.toolResult} />}
    </div>
  );
}

export default function FeedPage() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 100;
    setAutoScroll(atBottom);
  }, []);

  useEffect(() => {
    if (autoScroll) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [events, autoScroll]);

  useEffect(() => {
    eventCounter = 0;
    const es = new EventSource("/api/ws");

    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.type === "connected") setConnected(true);
        if (data.type === "disconnected") setConnected(false);
        const event = classifyEvent(data);
        setEvents((prev) => [...prev.slice(-500), event]);
      } catch {}
    };

    es.onerror = () => setConnected(false);

    return () => es.close();
  }, []);

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">Live Feed</h1>
          <p className="text-sm text-gray-400 mt-1">Real-time gateway event stream</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            {connected ? (
              <><Wifi size={16} className="text-green-500" /><span className="text-green-600">Connected</span></>
            ) : (
              <><WifiOff size={16} className="text-red-400" /><span className="text-red-500">Disconnected</span></>
            )}
          </div>
          <span className="text-xs text-gray-400">{events.length} events</span>
        </div>
      </div>

      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto pr-2"
      >
        {events.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-gray-300">
            <Wifi size={32} strokeWidth={1} />
            <p className="text-sm mt-3">Waiting for events...</p>
          </div>
        )}
        {events.map((ev) => (
          <EventCard key={ev.id} event={ev} />
        ))}
        <div ref={bottomRef} />
      </div>

      {!autoScroll && (
        <button
          onClick={() => {
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
            setAutoScroll(true);
          }}
          className="fixed bottom-6 right-6 bg-apple-blue text-white rounded-full p-3 shadow-lg hover:bg-blue-600 transition-colors"
        >
          <ArrowDown size={18} />
        </button>
      )}
    </div>
  );
}
