import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { getDb } from "@/lib/db";
export const runtime="nodejs";
export async function GET() {
  const staff=await requireStaff(); if(!staff)return NextResponse.json({error:"Staff access required."},{status:403});
  try { const rows=await getDb()`SELECT * FROM farm_plans ORDER BY created_at DESC LIMIT 200`; return NextResponse.json({items:rows}); }
  catch{return NextResponse.json({error:"Unable to load farm plans."},{status:503});}
}
