import { NextResponse } from "next/server";

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || "http://127.0.0.1:18789";
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

export async function POST(req: Request) {
  const { message } = await req.json();

  try {
    const res = await fetch(`${GATEWAY_URL}/tools/invoke`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(GATEWAY_TOKEN ? { Authorization: `Bearer ${GATEWAY_TOKEN}` } : {}),
      },
      body: JSON.stringify({
        tool: "sessions_send",
        args: {
          message,
          sessionKey: "agent:main:main",
          timeoutSeconds: 120,
        },
      }),
      signal: AbortSignal.timeout(130000),
    });

    const data = await res.json();
    
    // Handle gateway error responses
    if (data?.error) {
      return NextResponse.json({ 
        response: `Error: ${data.error.message || data.error}` 
      }, { status: 502 });
    }

    // Extract reply from the response
    // Response shape: { ok: true, result: { content: [{ type: "text", text: "..." }] } }
    // Or direct: { runId, status, reply, ... }
    let reply = "";

    if (data?.result?.content) {
      const textPart = data.result.content.find((c: any) => c.type === "text");
      if (textPart?.text) {
        try {
          const parsed = JSON.parse(textPart.text);
          reply = parsed.reply || parsed.response || textPart.text;
        } catch {
          reply = textPart.text;
        }
      }
    } else if (data?.reply) {
      reply = data.reply;
    } else if (data?.result) {
      try {
        const r = typeof data.result === "string" ? JSON.parse(data.result) : data.result;
        reply = r.reply || r.response || JSON.stringify(r);
      } catch {
        reply = JSON.stringify(data.result);
      }
    } else {
      reply = JSON.stringify(data);
    }

    return NextResponse.json({ response: reply });
  } catch (e: any) {
    if (e?.name === "TimeoutError") {
      return NextResponse.json({ response: "Henry is still thinking... try again in a moment." }, { status: 504 });
    }
    return NextResponse.json({ 
      response: `Failed to reach gateway: ${e?.message || "unknown error"}` 
    }, { status: 502 });
  }
}
