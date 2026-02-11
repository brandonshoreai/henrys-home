import { GatewayEnvelope } from "./types";

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || "http://127.0.0.1:18789";
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

export async function invokeGateway<T = unknown>(
  tool: string,
  args: Record<string, unknown> = {},
  sessionKey?: string
): Promise<{ ok: boolean; data?: T; text?: string; error?: string }> {
  try {
    const res = await fetch(`${GATEWAY_URL}/tools/invoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(GATEWAY_TOKEN ? { Authorization: `Bearer ${GATEWAY_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        tool,
        action: "json",
        args,
        ...(sessionKey ? { sessionKey } : {}),
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { ok: false, error: `Gateway returned ${res.status}: ${text}` };
    }

    const envelope = await res.json();
    return unwrapEnvelope<T>(envelope);
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Unknown error" };
  }
}

function unwrapEnvelope<T>(envelope: GatewayEnvelope<T>): {
  ok: boolean;
  data?: T;
  text?: string;
  error?: string;
} {
  if (!envelope.ok) {
    return { ok: false, error: envelope.error || "Gateway error" };
  }

  // The result can come in different shapes:
  // 1. Direct result object (for simple endpoints)
  // 2. { content: [{ type: "text", text: "..." }], details: {...} }
  const result = envelope.result;
  
  // If result has content array (tool-style response)
  if (result?.content) {
    const textPart = result.content.find((c: { type: string }) => c.type === "text");
    const text = textPart?.text;
    const details = result.details;

    let data: T | undefined = details as T;
    if (!data && text) {
      try {
        data = JSON.parse(text) as T;
      } catch {
        // text is not JSON, return as-is
        return { ok: true, text, data: undefined };
      }
    }
    return { ok: true, data, text };
  }

  // Direct result (e.g., health endpoint)
  return { ok: true, data: result as T };
}

export async function checkGatewayHealth(): Promise<{
  online: boolean;
  pid?: number;
  uptime?: number;
  memory?: { rss: number; heapUsed: number; heapTotal: number };
  version?: string;
  sessions?: number;
}> {
  try {
    // Try the /health endpoint first
    const res = await fetch(`${GATEWAY_URL}/health`, {
      cache: "no-store",
      headers: {
        ...(GATEWAY_TOKEN ? { Authorization: `Bearer ${GATEWAY_TOKEN}` } : {}),
      },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: true, ...data };
  } catch {
    // If /health fails, try tools/invoke with a simple status call
    try {
      const result = await invokeGateway("session_status");
      if (result.ok) {
        return { online: true };
      }
    } catch {
      // ignore
    }
    return { online: false };
  }
}

export function getGatewayUrl(): string {
  return GATEWAY_URL;
}

export function formatEpochMs(ms: number): string {
  if (!ms || ms === 0) return "—";
  // Handle both seconds and milliseconds
  const timestamp = ms > 1e12 ? ms : ms * 1000;
  return new Date(timestamp).toLocaleString();
}

export function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export function formatCost(cost: number): string {
  // Cost might come as dollars or cents — handle both
  if (cost < 1) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(2)}`;
}
