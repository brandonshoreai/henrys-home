import { NextRequest } from "next/server";

const GATEWAY_URL = process.env.OPENCLAW_GATEWAY_URL || "http://127.0.0.1:18789";
const GATEWAY_TOKEN = process.env.OPENCLAW_GATEWAY_TOKEN || "";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const wsUrl = GATEWAY_URL.replace(/^http/, "ws");

  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();
      const send = (data: object) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        } catch {}
      };

      try {
        const { WebSocket } = await import("ws");
        const ws = new WebSocket(wsUrl, { headers: { origin: 'http://127.0.0.1:18789' } });
        let reqId = 1;
        const crypto = await import("crypto");
        const instanceId = crypto.randomUUID();

        ws.on("message", (raw: Buffer) => {
          try {
            const msg = JSON.parse(raw.toString());

            if (msg.type === "event" && msg.event === "connect.challenge") {
              // Use "control-ui" as the client ID — this is what the built-in Control UI uses
              ws.send(JSON.stringify({
                type: "req",
                id: String(reqId++),
                method: "connect",
                params: {
                  minProtocol: 3,
                  maxProtocol: 3,
                  client: {
                    id: "webchat",
                    displayName: "Mission Control",
                    version: "1.0.0",
                    platform: "web",
                    mode: "ui",
                    instanceId
                  },
                  role: "operator",
                  scopes: ["operator.read", "operator.write"],
                  caps: [],
                  commands: [],
                  permissions: {},
                  auth: { token: GATEWAY_TOKEN },
                  locale: "en-US",
                  userAgent: "mission-control/1.0.0"
                }
              }));
            } else if (msg.type === "res" && msg.ok && msg.payload?.type === "hello-ok") {
              send({ type: "connected", payload: msg.payload });
              // Request chat history
              ws.send(JSON.stringify({
                type: "req",
                id: String(reqId++),
                method: "chat.history",
                params: { sessionKey: "main", limit: 50 }
              }));
              // Request sessions list
              ws.send(JSON.stringify({
                type: "req",
                id: String(reqId++),
                method: "sessions.list",
                params: {}
              }));
            } else if (msg.type === "res" && !msg.ok) {
              // Connection failed — try alternate client ID
              send({ type: "error", message: JSON.stringify(msg.error) });
            } else {
              // Forward everything else
              send(msg);
            }
          } catch {}
        });

        ws.on("error", (err) => send({ type: "error", message: err.message || "WebSocket error" }));
        ws.on("close", (code, reason) => {
          send({ type: "disconnected", code, reason: reason?.toString() });
          try { controller.close(); } catch {}
        });

        req.signal.addEventListener("abort", () => ws.close());
      } catch (e) {
        send({ type: "error", message: String(e) });
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    }
  });
}
