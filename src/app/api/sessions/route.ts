import { NextResponse } from "next/server";
import { invokeGateway } from "@/lib/openclaw";

export async function GET() {
  const result = await invokeGateway("sessions_list", { messageLimit: 1 });
  if (!result.ok) {
    return NextResponse.json({ sessions: [], error: result.error });
  }
  // sessions_list returns { count, sessions } or just an array
  const data = result.data as Record<string, unknown> | unknown[];
  const sessions = Array.isArray(data) ? data : (data as Record<string, unknown>)?.sessions || data;
  return NextResponse.json({ sessions: sessions || [] });
}
