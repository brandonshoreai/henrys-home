import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const configPath = path.join(process.env.HOME || "/Users/brandonai", ".openclaw/openclaw.json");
    const raw = fs.readFileSync(configPath, "utf8");
    const config = JSON.parse(raw);
    
    const agentsList = config.agents?.list || [];
    const defaultModel = config.defaultModel || config.agents?.defaults?.model || "unknown";
    
    const agents = agentsList.map((a: Record<string, unknown>) => {
      const identity = a.identity as Record<string, string> | undefined;
      return {
        id: a.id || a.name,
        name: identity?.name || a.name || a.id,
        emoji: identity?.emoji || "🤖",
        model: a.model || defaultModel,
        status: "online",
        role: identity?.theme || "",
        workspace: a.workspace || "",
      };
    });

    return NextResponse.json({ agents });
  } catch (e) {
    return NextResponse.json({ agents: [], error: String(e) });
  }
}
