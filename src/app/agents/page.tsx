"use client";

import { useEffect, useState } from "react";
import StatusDot from "@/components/StatusDot";
import { Bot, Plus } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAgent = any;

export default function AgentsPage() {
  const [agents, setAgents] = useState<AnyAgent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/agents")
      .then(r => r.json())
      .then(d => {
        const list = d.agents || d || [];
        setAgents(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">Agents</h1>
          <p className="text-sm text-gray-400 mt-1">AI agents and their configurations</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-apple-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : agents.length === 0 ? (
        <div className="card p-12 text-center">
          <Bot size={40} strokeWidth={1} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-light text-gray-400 mb-1">No agents found</h3>
          <p className="text-sm text-gray-300">Agents will appear when configured</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent: Record<string, unknown>, i: number) => (
            <div key={(agent.id as string) || i} className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                  {(agent.emoji as string) || "🤖"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{(agent.name as string) || (agent.id as string)}</span>
                    <StatusDot status={(agent.status as string) === "online" || (agent.status as string) === "active" ? "online" : "offline"} />
                  </div>
                  <span className="text-xs text-gray-400">{(agent.role as string) || (agent.id as string)}</span>
                </div>
              </div>
              {agent.model && <span className="badge badge-gray">{agent.model as string}</span>}
              {agent.workspace && <p className="text-xs text-gray-300 mt-2 truncate">{agent.workspace as string}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
