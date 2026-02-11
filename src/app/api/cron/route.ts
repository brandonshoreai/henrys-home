import { NextResponse } from "next/server";

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || "http://127.0.0.1:18789";
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

export async function GET() {
  try {
    const res = await fetch(`${GATEWAY_URL}/tools/invoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(GATEWAY_TOKEN ? { Authorization: `Bearer ${GATEWAY_TOKEN}` } : {}),
      },
      body: JSON.stringify({ tool: "cron", args: { action: "list" } }),
      cache: "no-store",
    });

    if (!res.ok) {
      return NextResponse.json({ jobs: [], error: `Gateway returned ${res.status}` });
    }

    const envelope = await res.json();
    if (!envelope.ok) {
      return NextResponse.json({ jobs: [], error: envelope.error?.message });
    }

    const text = envelope.result?.content?.find((c: { type: string }) => c.type === "text")?.text;
    if (!text) {
      return NextResponse.json({ jobs: [] });
    }

    // Try parsing as JSON
    try {
      const data = JSON.parse(text);
      const jobs = Array.isArray(data) ? data : data.jobs || data.items || [];
      return NextResponse.json({ jobs });
    } catch {
      // Text output - parse line by line
      return NextResponse.json({ jobs: [], raw: text });
    }
  } catch (e) {
    return NextResponse.json({ jobs: [], error: String(e) });
  }
}
