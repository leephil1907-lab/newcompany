import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
export const runtime="nodejs";
export async function GET() {
  const staff=await requireStaff(); if(!staff) return NextResponse.json({error:"Staff access required."},{status:403});
  try {
    const sql=getDb();
    const [inquiries]=await sql`SELECT COUNT(*)::int AS total,COUNT(*) FILTER(WHERE status='new')::int AS new,COUNT(*) FILTER(WHERE status='reviewing')::int AS reviewing,COUNT(*) FILTER(WHERE status='completed')::int AS completed FROM inquiries`;
    const [plans]=await sql`SELECT COUNT(*)::int AS total FROM farm_plans`;
    const [cases]=await sql`SELECT COUNT(*)::int AS total,COUNT(*) FILTER(WHERE status='submitted')::int AS pending FROM crop_cases`;
    const [clients]=await sql`SELECT COUNT(*)::int AS total FROM users WHERE role='client'`;
    const [appointments]=await sql`SELECT COUNT(*)::int AS total,COUNT(*) FILTER(WHERE status='requested')::int AS requested FROM appointments`;
    const recent=await sql`SELECT id,name,email,service_slug,status,created_at FROM inquiries ORDER BY created_at DESC LIMIT 8`;
    return NextResponse.json({metrics:{inquiries,plans:plans.total,cropCases:cases,clients:clients.total,appointments},recent});
  } catch(error){console.error("Admin overview failed:",error instanceof Error?error.message:error);return NextResponse.json({error:"Database unavailable."},{status:503});}
}
