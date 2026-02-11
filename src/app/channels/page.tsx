"use client";

import { useEffect, useState } from "react";
import StatusDot from "@/components/StatusDot";
import { Radio, MessageSquare } from "lucide-react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyChannel = any;

const channelIcons: Record<string, string> = {
  whatsapp: "💬",
  telegram: "✈️",
  discord: "🎮",
  bluebubbles: "🍎",
  imessage: "🍎",
  slack: "💼",
  webchat: "🌐",
};

export default function ChannelsPage() {
  const [channels, setChannels] = useState<AnyChannel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/channels")
      .then(r => r.json())
      .then(d => {
        const list = d.channels || d || [];
        setChannels(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-light text-gray-900 tracking-tight">Channels</h1>
        <p className="text-sm text-gray-400 mt-1">Connected messaging platforms</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-6 h-6 border-2 border-apple-blue border-t-transparent rounded-full animate-spin" />
        </div>
      ) : channels.length === 0 ? (
        <div className="card p-12 text-center">
          <Radio size={40} strokeWidth={1} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-light text-gray-400 mb-1">No channels detected</h3>
          <p className="text-sm text-gray-300">Channel status will appear when the gateway reports them</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {channels.map((ch: Record<string, unknown>, i: number) => {
            const type = ((ch.type || ch.channel || ch.name || "") as string).toLowerCase();
            return (
              <div key={(ch.id as string) || i} className="card p-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                    {channelIcons[type] || "📡"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900 capitalize">{type || `Channel ${i + 1}`}</span>
                      <StatusDot status={(ch.status as string) === "connected" || (ch.connected as boolean) ? "online" : "offline"} />
                    </div>
                    <span className="text-xs text-gray-400">{(ch.status as string) || ((ch.connected as boolean) ? "Connected" : "Disconnected")}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
