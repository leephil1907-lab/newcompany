import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
export const runtime = "nodejs";
export async function GET() {
  const checks: Record<string,string> = { application:"ok", database: process.env.DATABASE_URL ? "configured" : "missing", email: process.env.RESEND_API_KEY && process.env.EMAIL_FROM ? "configured" : "not_configured", ai: process.env.AI_API_KEY && process.env.AI_BASE_URL && process.env.AI_MODEL ? "configured" : "guided_fallback" };
  if (process.env.DATABASE_URL) {
    try { await getDb()`SELECT 1`; checks.database = "connected"; }
    catch { checks.database = "unavailable"; }
  }
  const healthy = checks.application === "ok" && checks.database === "connected";
  return NextResponse.json({ status:healthy ? "ok" : "configuration_required", checks, timestamp:new Date().toISOString() },{status:healthy?200:503});
}
