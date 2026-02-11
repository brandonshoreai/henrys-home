"use client";
import { Skill } from "@/lib/types";
import StatusDot from "./StatusDot";
import { Package, Puzzle, FolderCode } from "lucide-react";

const typeIcon = {
  bundled: Package,
  managed: Puzzle,
  workspace: FolderCode,
};

const typeBadge = {
  bundled: "badge-blue",
  managed: "badge-green",
  workspace: "badge-orange",
};

export default function SkillCard({ skill }: { skill: Skill }) {
  const Icon = typeIcon[skill.type] || Package;
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
          <Icon size={18} className="text-gray-400" />
        </div>
        <span className={`badge ${typeBadge[skill.type]}`}>{skill.type}</span>
      </div>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm font-medium text-gray-900">{skill.name}</span>
        <StatusDot status={skill.enabled ? "online" : "offline"} size={6} />
      </div>
      <p className="text-xs text-gray-400 line-clamp-2">{skill.description}</p>
    </div>
  );
}
