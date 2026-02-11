"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  MessagesSquare,
  MessageCircle,
  Timer,
  Puzzle,
  Server,
  Radio,
  Activity,
  BarChart3,
  Settings,
  Radar,
  CheckSquare,
  CalendarCheck,
} from "lucide-react";
import StatusDot from "./StatusDot";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/agents", label: "Agents", icon: Users },
  { href: "/sessions", label: "Sessions", icon: MessagesSquare },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/feed", label: "Live Feed", icon: Activity },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/dailies", label: "Dailies", icon: CalendarCheck },
  { href: "/cron", label: "Cron Jobs", icon: Timer },
  { href: "/skills", label: "Skills", icon: Puzzle },
  { href: "/nodes", label: "Nodes", icon: Server },
  { href: "/channels", label: "Channels", icon: Radio },
  { href: "/usage", label: "Usage", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [gatewayOnline, setGatewayOnline] = useState<boolean | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        setGatewayOnline(data.online);
      } catch {
        setGatewayOnline(false);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-60 h-screen fixed left-0 top-0 bg-[#F5F5F7] border-r border-gray-200/60 flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-apple-blue flex items-center justify-center text-lg">
          🦞
        </div>
        <div>
          <div className="text-sm font-semibold text-gray-900 leading-tight">Henry</div>
          <div className="text-[10px] text-gray-400">OpenClaw</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
        {nav.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                active
                  ? "bg-apple-blue/10 text-apple-blue font-medium"
                  : "text-gray-600 hover:bg-gray-200/60 hover:text-gray-900"
              }`}
            >
              <item.icon size={18} strokeWidth={active ? 2 : 1.5} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Gateway Status */}
      <div className="px-4 py-4 border-t border-gray-200/60">
        <div className="flex items-center gap-2 text-xs text-gray-400">
          <StatusDot
            status={gatewayOnline === null ? "pending" : gatewayOnline ? "online" : "offline"}
          />
          <span>Gateway {gatewayOnline === null ? "..." : gatewayOnline ? "Online" : "Offline"}</span>
        </div>
      </div>
    </aside>
  );
}
