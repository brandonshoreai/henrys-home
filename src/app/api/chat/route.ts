import { NextResponse } from "next/server";
import { invokeGateway } from "@/lib/openclaw";

export async function POST(req: Request) {
  const { message, sessionKey } = await req.json();
  const result = await invokeGateway("sessions_send", {
    message,
    sessionKey: sessionKey || "main",
  });
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 502 });
  }
  return NextResponse.json({
    response: result.text || (typeof result.data === "string" ? result.data : JSON.stringify(result.data)),
    toolCalls: [],
  });
}
