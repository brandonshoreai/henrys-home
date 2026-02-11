"use client";

import { useEffect, useState } from "react";
import SessionCard from "@/components/SessionCard";
import { MessagesSquare, X } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySession = any;

export default function SessionsPage() {
  const [sessions, setSessions] = useState<AnySession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AnySession | null>(null);

  useEffect(() => {
    fetch("/api/sessions")
      .then(r => r.json())
      .then(d => {
        const list = d.sessions || d || [];
        setSessions(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 tracking-tight">Sessions</h1>
        <p className="text-sm text-gray-400 mt-1">Active and recent conversations</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-apple-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="card p-12 text-center">
          <MessagesSquare size={40} strokeWidth={1} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-light text-gray-400 mb-1">No sessions</h3>
          <p className="text-sm text-gray-300">Sessions will appear here when agents are active</p>
        </div>
      ) : (
        <div className="flex gap-5">
          <div className="flex-1 space-y-3">
            {sessions.map((s, i) => (
              <div key={s.key || s.sessionKey || s.id || i} onClick={() => setSelected(s)}>
                <SessionCard session={s} />
              </div>
            ))}
          </div>
          {selected && (
            <div className="w-96 card p-5 sticky top-8 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-900">Session Details</h3>
                <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500">
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-2 text-sm">
                <div><span className="text-gray-400">Key:</span> <span className="text-gray-700 font-mono text-xs">{selected.key || selected.id}</span></div>
                <div><span className="text-gray-400">Channel:</span> <span className="text-gray-700">{selected.channel || selected.lastChannel || "—"}</span></div>
                <div><span className="text-gray-400">Model:</span> <span className="text-gray-700">{selected.model || "—"}</span></div>
                <div><span className="text-gray-400">Tokens:</span> <span className="text-gray-700">{(selected.totalTokens || 0).toLocaleString()}</span></div>
                {selected.updatedAt && (
                  <div><span className="text-gray-400">Last active:</span> <span className="text-gray-700">{new Date(selected.updatedAt).toLocaleString()}</span></div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
