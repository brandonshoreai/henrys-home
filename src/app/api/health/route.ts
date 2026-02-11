import { NextResponse } from "next/server";
import { checkGatewayHealth } from "@/lib/openclaw";

export async function GET() {
  const health = await checkGatewayHealth();
  return NextResponse.json(health);
}
