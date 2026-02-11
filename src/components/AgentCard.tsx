"use client";
import { Agent } from "@/lib/types";
import StatusDot from "./StatusDot";
import { User, Wrench } from "lucide-react";

export default function AgentCard({ agent }: { agent: Agent }) {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
          <User size={18} className="text-gray-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{agent.name}</span>
            <StatusDot status={agent.status} />
          </div>
          <span className="text-xs text-gray-400">{agent.role}</span>
        </div>
      </div>
      {agent.currentTask && (
        <p className="text-xs text-gray-500 mb-2 truncate">{agent.currentTask}</p>
      )}
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <Wrench size={11} />
        <span>{agent.skills.length} skills</span>
        <span className="mx-1">·</span>
        <span>{agent.sessions.length} sessions</span>
      </div>
    </div>
  );
}
