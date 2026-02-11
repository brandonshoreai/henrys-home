"use client";
import { Channel } from "@/lib/types";
import StatusDot from "./StatusDot";
import { MessageCircle, Hash, Phone, Send } from "lucide-react";

const channelIcon: Record<string, typeof MessageCircle> = {
  whatsapp: Phone,
  telegram: Send,
  discord: Hash,
  imessage: MessageCircle,
};

export default function ChannelCard({ channel }: { channel: Channel }) {
  const Icon = channelIcon[channel.type] || MessageCircle;
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
          <Icon size={18} className="text-gray-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{channel.name}</span>
            <StatusDot status={channel.status} />
          </div>
          <span className="text-xs text-gray-400 capitalize">{channel.type}</span>
        </div>
      </div>
    </div>
  );
}
