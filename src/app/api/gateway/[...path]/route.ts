import { NextRequest, NextResponse } from "next/server";
import { invokeGateway } from "@/lib/openclaw";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const tool = path.join("_");
  const args = await req.json();
  const result = await invokeGateway(tool, args);
  return NextResponse.json(result);
}
