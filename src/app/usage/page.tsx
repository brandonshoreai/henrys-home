"use client";

import { useEffect, useState } from "react";
import { BarChart3, ToggleLeft, ToggleRight } from "lucide-react";

interface ModelUsage {
  model: string;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  requests: number;
}

export default function UsagePage() {
  const [usage, setUsage] = useState<ModelUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<"today" | "allTime">("today");

  useEffect(() => {
    fetch("/api/gateway/usage", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ period }) })
      .then(r => r.json())
      .then(d => setUsage(d.data || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [period]);

  const maxTokens = Math.max(...usage.map(u => u.inputTokens + u.outputTokens), 1);
  const maxCost = Math.max(...usage.map(u => u.cost), 1);
  const totalCost = usage.reduce((s, u) => s + u.cost, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-light text-gray-900 tracking-tight">Usage & Costs</h1>
          <p className="text-sm text-gray-400 mt-1">Token usage and cost breakdown by model</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPeriod("today")}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${period === "today" ? "bg-apple-blue text-white" : "bg-gray-100 text-gray-500"}`}
          >
            Today
          </button>
          <button
            onClick={() => setPeriod("allTime")}
            className={`px-4 py-2 rounded-xl text-sm transition-all ${period === "allTime" ? "bg-apple-blue text-white" : "bg-gray-100 text-gray-500"}`}
          >
            All Time
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-5 mb-8">
        <div className="card p-6">
          <span className="text-sm text-gray-400">Total Cost</span>
          <div className="text-3xl font-light text-gray-900 mt-1">${(totalCost / 100).toFixed(2)}</div>
        </div>
        <div className="card p-6">
          <span className="text-sm text-gray-400">Total Requests</span>
          <div className="text-3xl font-light text-gray-900 mt-1">{usage.reduce((s, u) => s + u.requests, 0).toLocaleString()}</div>
        </div>
        <div className="card p-6">
          <span className="text-sm text-gray-400">Models Used</span>
          <div className="text-3xl font-light text-gray-900 mt-1">{usage.length}</div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-apple-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : usage.length === 0 ? (
        <div className="card p-12 text-center">
          <BarChart3 size={40} strokeWidth={1} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-light text-gray-400 mb-1">No usage data</h3>
          <p className="text-sm text-gray-300">Usage data will appear when the gateway processes requests</p>
        </div>
      ) : (
        <div className="card p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-6">Per-Model Breakdown</h3>
          <div className="space-y-5">
            {usage.map(u => (
              <div key={u.model}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900">{u.model}</span>
                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <span>{u.requests} requests</span>
                    <span className="font-medium text-gray-600">${(u.cost / 100).toFixed(2)}</span>
                  </div>
                </div>
                <div className="flex gap-1 h-3">
                  <div
                    className="bg-apple-blue/70 rounded-l-full transition-all duration-500"
                    style={{ width: `${(u.inputTokens / maxTokens) * 100}%` }}
                    title={`Input: ${u.inputTokens.toLocaleString()}`}
                  />
                  <div
                    className="bg-apple-green/70 rounded-r-full transition-all duration-500"
                    style={{ width: `${(u.outputTokens / maxTokens) * 100}%` }}
                    title={`Output: ${u.outputTokens.toLocaleString()}`}
                  />
                </div>
                <div className="flex gap-4 mt-1 text-[10px] text-gray-300">
                  <span>In: {u.inputTokens.toLocaleString()}</span>
                  <span>Out: {u.outputTokens.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-6 pt-4 border-t border-gray-100 text-xs text-gray-400">
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-apple-blue/70" />Input tokens</div>
            <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-apple-green/70" />Output tokens</div>
          </div>
        </div>
      )}
    </div>
  );
}
