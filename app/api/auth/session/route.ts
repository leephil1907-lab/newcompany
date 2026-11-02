import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
export const runtime = "nodejs";
// Lightweight session probe for client UI such as the site header.
// Always responds 200 so signed-out visitors don't log failed requests in the browser console.
export async function GET() {
  const user = await getSession();
  return NextResponse.json({ user: user ? { name: user.name, role: user.role } : null }, { headers: { "Cache-Control": "private, no-store" } });
}
