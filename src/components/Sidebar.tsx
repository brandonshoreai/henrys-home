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
  FileText,
  TrendingUp,
  MoreHorizontal,
  X,
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
  { href: "/docs", label: "Docs", icon: FileText },
  { href: "/arbitrage", label: "Arb Bot", icon: TrendingUp },
  { href: "/cron", label: "Cron Jobs", icon: Timer },
  { href: "/skills", label: "Skills", icon: Puzzle },
  { href: "/nodes", label: "Nodes", icon: Server },
  { href: "/channels", label: "Channels", icon: Radio },
  { href: "/usage", label: "Usage", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: Settings },
];

// Bottom tab bar items for mobile
const mobileTabItems = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/chat", label: "Chat", icon: MessageCircle },
  { href: "/arbitrage", label: "Arb Bot", icon: TrendingUp },
  { href: "/sessions", label: "Sessions", icon: MessagesSquare },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [gatewayOnline, setGatewayOnline] = useState<boolean | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);

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

  // Close "more" menu on route change
  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const isTabActive = (href: string) => href === "/" ? pathname === "/" : pathname.startsWith(href);
  const isInMoreMenu = !mobileTabItems.some(item => isTabActive(item.href));

  return (
    <>
      {/* Desktop Sidebar - hidden on mobile */}
      <aside className="hidden md:flex w-60 h-screen fixed left-0 top-0 bg-[#F5F5F7] border-r border-gray-200/60 flex-col z-50">
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

      {/* Mobile Bottom Tab Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/60 z-50 pb-3">
        <div className="flex items-stretch justify-around px-2">
          {mobileTabItems.map((item) => {
            const active = isTabActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center py-2 px-3 min-h-[52px] flex-1 transition-colors ${
                  active ? "text-apple-blue" : "text-gray-400"
                }`}
              >
                <item.icon size={22} strokeWidth={active ? 2 : 1.5} />
                <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
              </Link>
            );
          })}
          {/* More button */}
          <button
            onClick={() => setMoreOpen(!moreOpen)}
            className={`flex flex-col items-center justify-center py-2 px-3 min-h-[52px] flex-1 transition-colors ${
              moreOpen || isInMoreMenu ? "text-apple-blue" : "text-gray-400"
            }`}
          >
            <MoreHorizontal size={22} strokeWidth={moreOpen ? 2 : 1.5} />
            <span className="text-[10px] mt-0.5 font-medium">More</span>
          </button>
        </div>
      </nav>

      {/* Mobile "More" overlay menu */}
      {moreOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/30 z-[60]"
            onClick={() => setMoreOpen(false)}
          />
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[70] max-h-[70vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="text-sm font-semibold text-gray-900">More</span>
              <button onClick={() => setMoreOpen(false)} className="p-1 text-gray-400">
                <X size={20} />
              </button>
            </div>
            <div className="px-3 py-2 space-y-0.5">
              {nav
                .filter((item) => !mobileTabItems.some((tab) => tab.href === item.href))
                .map((item) => {
                  const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm min-h-[44px] transition-all duration-200 ${
                        active
                          ? "bg-apple-blue/10 text-apple-blue font-medium"
                          : "text-gray-600 active:bg-gray-100"
                      }`}
                    >
                      <item.icon size={20} strokeWidth={active ? 2 : 1.5} />
                      {item.label}
                    </Link>
                  );
                })}
            </div>
            <div className="px-7 py-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <StatusDot
                  status={gatewayOnline === null ? "pending" : gatewayOnline ? "online" : "offline"}
                />
                <span>Gateway {gatewayOnline === null ? "..." : gatewayOnline ? "Online" : "Offline"}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
