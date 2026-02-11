import { NextResponse } from "next/server";
import { invokeGateway } from "@/lib/openclaw";

export async function GET() {
  const result = await invokeGateway("cron", { action: "list" });
  if (!result.ok) {
    return NextResponse.json({ jobs: [], error: result.error });
  }
  const data = result.data as Record<string, unknown> | unknown[];
  const jobs = Array.isArray(data) ? data : (data as Record<string, unknown>)?.jobs || data;
  return NextResponse.json({ jobs: jobs || [] });
}
