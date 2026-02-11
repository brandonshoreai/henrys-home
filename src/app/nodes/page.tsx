"use client";

import { useEffect, useState } from "react";
import { Node } from "@/lib/types";
import StatusDot from "@/components/StatusDot";
import { Server, Monitor, Cpu } from "lucide-react";

export default function NodesPage() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/gateway/nodes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) })
      .then(r => r.json())
      .then(d => { if (d.data) setNodes(d.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 tracking-tight">Nodes</h1>
        <p className="text-sm text-gray-400 mt-1">Connected compute nodes</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-apple-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : nodes.length === 0 ? (
        <div className="card p-12 text-center">
          <Server size={40} strokeWidth={1} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-light text-gray-400 mb-1">No nodes connected</h3>
          <p className="text-sm text-gray-300">Compute nodes will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nodes.map(node => (
            <div key={node.id} className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                  <Monitor size={18} className="text-gray-400" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{node.name}</span>
                    <StatusDot status={node.status} />
                  </div>
                  <span className="text-xs text-gray-400">{node.os}</span>
                </div>
              </div>
              <div className="flex gap-1 flex-wrap">
                {node.capabilities.map(cap => (
                  <span key={cap} className="badge badge-gray">{cap}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
