import { NextResponse } from "next/server";
import { invokeGateway } from "@/lib/openclaw";

export async function GET() {
  const result = await invokeGateway("exec", { command: "openclaw skills list --json 2>/dev/null || openclaw skills list" });
  if (!result.ok) {
    // Fallback: try reading skills from the workspace
    return NextResponse.json({ skills: [], error: result.error });
  }
  // Try to parse as JSON array of skills
  let skills = result.data;
  if (!skills && result.text) {
    try {
      skills = JSON.parse(result.text);
    } catch {
      // Parse text output line by line
      const lines = result.text.split("\n").filter(Boolean);
      skills = lines.map((line: string) => ({ name: line.trim(), enabled: true }));
    }
  }
  return NextResponse.json({ skills: Array.isArray(skills) ? skills : [] });
}
