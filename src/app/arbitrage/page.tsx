"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Activity,
  TrendingUp,
  DollarSign,
  BarChart3,
  Search,
  Zap,
  Target,
  ArrowLeftRight,
  Settings,
  RefreshCw,
  AlertCircle,
  Wallet,
} from "lucide-react";

/* ---------- types ---------- */
interface Dashboard {
  status: string;
  dry_run: boolean;
  uptime_seconds: number;
  total_scans: number;
  total_matches: number;
  total_opportunities: number;
  total_trades: number;
  total_pnl: number;
  active_positions: number;
  current_exposure: number;
  last_scan: string;
  kalshi_balance: number;
  poly_balance: number;
}

interface Opportunity {
  id?: string;
  market?: string;
  spread?: number;
  expected_profit?: number;
  kalshi_price?: number;
  poly_price?: number;
  side?: string;
  [key: string]: unknown;
}

interface Position {
  id?: string;
  market?: string;
  side?: string;
  size?: number;
  entry_price?: number;
  current_pnl?: number;
  opened_at?: string;
  [key: string]: unknown;
}

interface Trade {
  id?: string;
  market?: string;
  side?: string;
  size?: number;
  price?: number;
  pnl?: number;
  timestamp?: string;
  platform?: string;
  [key: string]: unknown;
}

/* ---------- helpers ---------- */
const fmt = (n: number | undefined, decimals = 2) =>
  n != null ? n.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) : "—";

const fmtUSD = (n: number | undefined) => (n != null ? `$${fmt(n)}` : "—");

const fmtUptime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
};

const fmtTime = (t: string | undefined) => {
  if (!t) return "—";
  try {
    return new Date(t).toLocaleString();
  } catch {
    return t;
  }
};

/* ---------- fetch helper ---------- */
async function apiFetch<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(`/api/arbitrage?endpoint=${endpoint}`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/* ---------- components ---------- */
function StatusDot({ status, dryRun }: { status: string | null; dryRun: boolean }) {
  const color =
    status === null
      ? "bg-red-500"
      : dryRun
      ? "bg-yellow-400"
      : "bg-green-500";
  const label = status === null ? "Offline" : dryRun ? "Dry Run" : "Live";
  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium">
      <span className={`h-2.5 w-2.5 rounded-full ${color} animate-pulse`} />
      {label}
    </span>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
        <Icon className="h-4 w-4 text-gray-400" />
      </div>
      <p className={`text-2xl font-semibold tracking-tight ${color || "text-gray-900"}`}>{value}</p>
    </div>
  );
}

/* ---------- main page ---------- */
export default function ArbitragePage() {
  const [dash, setDash] = useState<Dashboard | null>(null);
  const [opps, setOpps] = useState<Opportunity[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [settings, setSettings] = useState<Record<string, unknown> | null>(null);
  const [online, setOnline] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const refresh = useCallback(async () => {
    const [d, o, p, t, s] = await Promise.all([
      apiFetch<Dashboard>("dashboard"),
      apiFetch<Opportunity[]>("opportunities"),
      apiFetch<Position[]>("positions"),
      apiFetch<Trade[]>("trades"),
      apiFetch<Record<string, unknown>>("settings"),
    ]);
    setDash(d);
    setOpps(Array.isArray(o) ? o : []);
    setPositions(Array.isArray(p) ? p : []);
    setTrades(Array.isArray(t) ? t : []);
    setSettings(s);
    setOnline(d !== null);
    setLastRefresh(new Date());
  }, []);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 10_000);
    return () => clearInterval(id);
  }, [refresh]);

  const pnlColor = (dash?.total_pnl ?? 0) >= 0 ? "text-green-600" : "text-red-600";

  return (
    <div>
      {/* header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold tracking-tight">Arbitrage Bot</h1>
          <StatusDot status={online ? (dash?.status ?? "ok") : null} dryRun={dash?.dry_run ?? false} />
        </div>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          {dash && <span>Uptime: {fmtUptime(dash.uptime_seconds)}</span>}
          {lastRefresh && <span>Updated {lastRefresh.toLocaleTimeString()}</span>}
          <button onClick={refresh} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="space-y-8">
        {/* offline banner */}
        {!online && (
          <div className="flex items-center gap-3 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            Bot is unreachable at localhost:8000. Dashboard will auto-retry every 10 seconds.
          </div>
        )}

        {/* stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <StatCard label="Total Scans" value={fmt(dash?.total_scans, 0)} icon={Search} />
          <StatCard label="Matches Found" value={fmt(dash?.total_matches, 0)} icon={Target} />
          <StatCard label="Opportunities" value={fmt(dash?.total_opportunities, 0)} icon={Zap} />
          <StatCard label="Trades Executed" value={fmt(dash?.total_trades, 0)} icon={ArrowLeftRight} />
          <StatCard label="P&L" value={fmtUSD(dash?.total_pnl)} icon={TrendingUp} color={pnlColor} />
          <StatCard label="Exposure" value={fmtUSD(dash?.current_exposure)} icon={BarChart3} />
          <StatCard label="Kalshi Balance" value={fmtUSD(dash?.kalshi_balance)} icon={Wallet} />
          <StatCard label="Polymarket Balance" value={fmtUSD(dash?.poly_balance)} icon={DollarSign} />
        </div>

        {/* opportunities */}
        <Section title="Current Opportunities" icon={Zap} count={opps.length}>
          {opps.length === 0 ? (
            <Empty>No opportunities detected</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    <th className="py-2 pr-4">Market</th>
                    <th className="py-2 pr-4">Spread</th>
                    <th className="py-2 pr-4">Kalshi</th>
                    <th className="py-2 pr-4">Poly</th>
                    <th className="py-2">Expected Profit</th>
                  </tr>
                </thead>
                <tbody>
                  {opps.map((o, i) => (
                    <tr key={o.id ?? i} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-2.5 pr-4 font-medium">{o.market ?? "—"}</td>
                      <td className="py-2.5 pr-4">{o.spread != null ? `${(o.spread * 100).toFixed(1)}%` : "—"}</td>
                      <td className="py-2.5 pr-4">{fmt(o.kalshi_price)}</td>
                      <td className="py-2.5 pr-4">{fmt(o.poly_price)}</td>
                      <td className="py-2.5 text-green-600">{fmtUSD(o.expected_profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* positions */}
        <Section title="Active Positions" icon={Activity} count={positions.length}>
          {positions.length === 0 ? (
            <Empty>No active positions</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    <th className="py-2 pr-4">Market</th>
                    <th className="py-2 pr-4">Side</th>
                    <th className="py-2 pr-4">Size</th>
                    <th className="py-2 pr-4">Entry</th>
                    <th className="py-2 pr-4">P&L</th>
                    <th className="py-2">Opened</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((p, i) => (
                    <tr key={p.id ?? i} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-2.5 pr-4 font-medium">{p.market ?? "—"}</td>
                      <td className="py-2.5 pr-4">{p.side ?? "—"}</td>
                      <td className="py-2.5 pr-4">{fmt(p.size)}</td>
                      <td className="py-2.5 pr-4">{fmtUSD(p.entry_price)}</td>
                      <td className={`py-2.5 pr-4 ${(p.current_pnl ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {fmtUSD(p.current_pnl)}
                      </td>
                      <td className="py-2.5 text-gray-500">{fmtTime(p.opened_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* trades */}
        <Section title="Recent Trades" icon={ArrowLeftRight} count={trades.length}>
          {trades.length === 0 ? (
            <Empty>No trades yet</Empty>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 uppercase tracking-wide border-b border-gray-100">
                    <th className="py-2 pr-4">Time</th>
                    <th className="py-2 pr-4">Market</th>
                    <th className="py-2 pr-4">Platform</th>
                    <th className="py-2 pr-4">Side</th>
                    <th className="py-2 pr-4">Size</th>
                    <th className="py-2 pr-4">Price</th>
                    <th className="py-2">P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((t, i) => (
                    <tr key={t.id ?? i} className="border-b border-gray-50 hover:bg-gray-50/50">
                      <td className="py-2.5 pr-4 text-gray-500">{fmtTime(t.timestamp)}</td>
                      <td className="py-2.5 pr-4 font-medium">{t.market ?? "—"}</td>
                      <td className="py-2.5 pr-4">{t.platform ?? "—"}</td>
                      <td className="py-2.5 pr-4">{t.side ?? "—"}</td>
                      <td className="py-2.5 pr-4">{fmt(t.size)}</td>
                      <td className="py-2.5 pr-4">{fmtUSD(t.price)}</td>
                      <td className={`py-2.5 ${(t.pnl ?? 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {fmtUSD(t.pnl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        {/* settings */}
        {settings && (
          <Section title="Bot Settings" icon={Settings}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(settings).map(([k, v]) => (
                <div key={k} className="flex justify-between py-2 px-3 rounded-lg bg-gray-50 text-sm">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-medium">{String(v)}</span>
                </div>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}

/* ---------- shared UI ---------- */
function Section({
  title,
  icon: Icon,
  count,
  children,
}: {
  title: string;
  icon: React.ElementType;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100">
        <Icon className="h-4 w-4 text-[#007AFF]" />
        <h2 className="font-semibold text-sm">{title}</h2>
        {count != null && (
          <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-gray-400 text-center py-6">{children}</p>;
}
