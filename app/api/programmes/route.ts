import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
export const dynamic="force-dynamic";
export async function GET(){try{const items=await getDb()`SELECT id,title,slug,summary,location,delivery_mode,start_date,end_date,registration_deadline,capacity FROM training_programs WHERE status='published' AND (registration_deadline IS NULL OR registration_deadline>=CURRENT_DATE) ORDER BY start_date ASC LIMIT 50`;return NextResponse.json({items});}catch{return NextResponse.json({error:"Training programme catalogue is unavailable."},{status:503});}}
