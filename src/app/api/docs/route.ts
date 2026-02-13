import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const DOCS_DIR = path.join(process.cwd(), "data", "docs");

function parseFrontmatter(content: string) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: content };
  
  const meta: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const m = line.match(/^(\w+):\s*"?(.*?)"?\s*$/);
    if (m) meta[m[1]] = m[2];
  }
  return { meta, body: match[2] };
}

export async function GET() {
  try {
    if (!fs.existsSync(DOCS_DIR)) {
      return NextResponse.json([]);
    }

    const files = fs.readdirSync(DOCS_DIR).filter((f) => f.endsWith(".md"));

    const docs = files.map((file) => {
      const filePath = path.join(DOCS_DIR, file);
      const content = fs.readFileSync(filePath, "utf-8");
      const stat = fs.statSync(filePath);
      const slug = file.replace(/\.md$/, "");
      const { meta, body } = parseFrontmatter(content);

      const title = meta.title || (() => {
        const h1Match = body.match(/^#\s+(.+)$/m);
        return h1Match ? h1Match[1] : slug.replace(/-/g, " ");
      })();

      const summary = meta.summary || (() => {
        const h1Match = body.match(/^#\s+(.+)$/m);
        const bodyStart = h1Match ? body.indexOf(h1Match[0]) + h1Match[0].length : 0;
        const cleaned = body.slice(bodyStart).replace(/^[\s#]+/, "").replace(/[#*_`>\-\[\]]/g, "");
        return cleaned.slice(0, 200).trim();
      })();

      return {
        slug,
        title,
        category: meta.category || "Uncategorized",
        summary,
        order: parseInt(meta.order || "99"),
        createdAt: meta.createdAt || stat.mtime.toISOString(),
      };
    });

    // Sort by category then order
    docs.sort((a, b) => {
      if (a.category !== b.category) return a.category.localeCompare(b.category);
      return a.order - b.order;
    });

    return NextResponse.json(docs);
  } catch (error) {
    console.error("Error listing docs:", error);
    return NextResponse.json([]);
  }
}
