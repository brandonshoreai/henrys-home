import { NextResponse } from "next/server";
import { invokeGateway } from "@/lib/openclaw";

export async function GET() {
  const result = await invokeGateway("exec", { command: "openclaw agents list --json 2>/dev/null || echo '[]'" });
  if (!result.ok) {
    const sessResult = await invokeGateway("sessions_list", {});
    if (sessResult.ok) {
      const data = sessResult.data as Record<string, unknown> | unknown[];
      const sessions = (Array.isArray(data) ? data : (data as Record<string, unknown>)?.sessions || []) as Record<string, unknown>[];
      const agentMap = new Map();
      for (const s of sessions) {
        const agentId = (s.agentId || s.agent_id || "main") as string;
        if (!agentMap.has(agentId)) {
          agentMap.set(agentId, { id: agentId, name: agentId, status: "online", model: s.model || "unknown" });
        }
      }
      return NextResponse.json({ agents: Array.from(agentMap.values()) });
    }
    return NextResponse.json({ agents: [], error: result.error });
  }
  let agents = result.data;
  if (!agents && result.text) {
    try { agents = JSON.parse(result.text); } catch { agents = []; }
  }
  return NextResponse.json({ agents: Array.isArray(agents) ? agents : [] });
}
