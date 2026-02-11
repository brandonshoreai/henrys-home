"use client";

import { useEffect, useState } from "react";
import StatusDot from "@/components/StatusDot";
import { Puzzle, Search } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySkill = any;

export default function SkillsPage() {
  const [skills, setSkills] = useState<AnySkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/skills")
      .then(r => r.json())
      .then(d => {
        const list = d.skills || d || [];
        setSkills(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = skills.filter((s: { name?: string; description?: string }) =>
    !search || (s.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (s.description || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">Skills</h1>
          <p className="text-sm text-gray-400 mt-1">Installed capabilities and integrations</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
        <input
          type="text"
          placeholder="Search skills..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input-field pl-10"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-apple-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Puzzle size={40} strokeWidth={1} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-light text-gray-400 mb-1">No skills found</h3>
          <p className="text-sm text-gray-300">{search ? "Try a different search" : "Skills will appear when installed"}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((skill: { name?: string; description?: string; enabled?: boolean; type?: string }, i: number) => (
            <div key={skill.name || i} className="card p-5">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <StatusDot status={skill.enabled !== false ? "online" : "offline"} />
                  <span className="text-sm font-medium text-gray-900">{skill.name || String(skill)}</span>
                </div>
                {skill.type && <span className="badge badge-gray">{skill.type}</span>}
              </div>
              {skill.description && (
                <p className="text-xs text-gray-400 line-clamp-2">{skill.description}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
