import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
export const runtime="nodejs";
export async function GET(){const staff=await requireStaff();if(!staff)return NextResponse.json({error:"Staff access required."},{status:403});try{const items=await getDb()`SELECT r.id,r.name,r.email,r.phone,r.organisation,r.farmer_group,r.attendance_status,r.registered_at,p.title AS programme_title,p.start_date FROM training_registrations r JOIN training_programs p ON p.id=r.program_id ORDER BY p.start_date DESC,r.registered_at DESC LIMIT 500`;return NextResponse.json({items});}catch{return NextResponse.json({error:"Unable to load training registrations."},{status:503});}}
