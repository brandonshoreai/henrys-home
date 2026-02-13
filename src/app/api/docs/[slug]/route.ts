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

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const filePath = path.join(DOCS_DIR, `${slug}.md`);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Doc not found" }, { status: 404 });
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const stat = fs.statSync(filePath);
    const { meta, body } = parseFrontmatter(raw);

    const title = meta.title || (() => {
      const h1Match = body.match(/^#\s+(.+)$/m);
      return h1Match ? h1Match[1] : slug.replace(/-/g, " ");
    })();

    return NextResponse.json({
      slug,
      title,
      category: meta.category || "Uncategorized",
      summary: meta.summary || "",
      content: body,
      createdAt: meta.createdAt || stat.mtime.toISOString(),
    });
  } catch (error) {
    console.error("Error reading doc:", error);
    return NextResponse.json({ error: "Failed to read doc" }, { status: 500 });
  }
}
