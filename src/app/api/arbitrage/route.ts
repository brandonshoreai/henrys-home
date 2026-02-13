import { NextRequest, NextResponse } from "next/server";

const BOT_URL = "http://localhost:8000";
const ALLOWED = ["dashboard", "opportunities", "positions", "trades", "balance", "settings", "health"];

export async function GET(req: NextRequest) {
  const endpoint = req.nextUrl.searchParams.get("endpoint") || "dashboard";

  if (!ALLOWED.includes(endpoint)) {
    return NextResponse.json({ error: "Invalid endpoint" }, { status: 400 });
  }

  try {
    const res = await fetch(`${BOT_URL}/${endpoint}`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Bot unreachable" }, { status: 502 });
  }
}
