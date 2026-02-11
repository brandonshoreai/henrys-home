import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Read skills directly from the filesystem since the dashboard runs on the host
const SKILL_DIRS = [
  path.join(process.env.HOME || "/Users/brandonai", "clawd/skills"),
  "/opt/homebrew/lib/node_modules/openclaw/skills",
  path.join(process.env.HOME || "/Users/brandonai", ".openclaw/workspace/skills"),
];

export async function GET() {
  try {
    const skills: Array<{ name: string; description: string; enabled: boolean; type: string }> = [];
    const seen = new Set<string>();

    for (const dir of SKILL_DIRS) {
      try {
        if (!fs.existsSync(dir)) continue;
        const entries = fs.readdirSync(dir);
        
        for (const entry of entries) {
          if (seen.has(entry) || entry.startsWith(".")) continue;
          const skillDir = path.join(dir, entry);
          const skillMd = path.join(skillDir, "SKILL.md");
          
          if (fs.existsSync(skillMd)) {
            seen.add(entry);
            // Read first few lines for description
            let description = "";
            try {
              const content = fs.readFileSync(skillMd, "utf8");
              const lines = content.split("\n").slice(0, 10);
              const descLine = lines.find(l => l.startsWith("description:") || (l.length > 10 && !l.startsWith("#") && !l.startsWith("-")));
              description = descLine?.replace(/^description:\s*/i, "").trim() || "";
            } catch {}
            
            const type = dir.includes("node_modules") ? "bundled" : dir.includes(".openclaw") ? "managed" : "workspace";
            skills.push({ name: entry, description, enabled: true, type });
          }
        }
      } catch {}
    }

    return NextResponse.json({ skills });
  } catch (e) {
    return NextResponse.json({ skills: [], error: String(e) });
  }
}
