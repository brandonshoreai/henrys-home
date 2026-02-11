import { NextResponse } from "next/server";
import { invokeGateway } from "@/lib/openclaw";

export async function GET() {
  // Use the channels.status tool to get channel info
  const result = await invokeGateway("exec", { command: "openclaw channels status --json 2>/dev/null || openclaw status --json 2>/dev/null || echo '[]'" });
  if (!result.ok) {
    return NextResponse.json({ channels: [], error: result.error });
  }
  let channels = result.data;
  if (!channels && result.text) {
    try { channels = JSON.parse(result.text); } catch { channels = []; }
  }
  return NextResponse.json({ channels: Array.isArray(channels) ? channels : [] });
}
