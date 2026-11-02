import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
const schema=z.object({id:z.uuid(),status:z.enum(["submitted","reviewing","expert_response_sent","closed"]),expertNotes:z.string().max(5000).optional()});
export const runtime="nodejs";
export async function GET() {
  const staff=await requireStaff(); if(!staff) return NextResponse.json({error:"Staff access required."},{status:403});
  try { const rows=await getDb()`SELECT id,name,email,phone,location,crop,variety,growth_stage,symptoms,affected_area,onset,recent_weather,recent_inputs,image_mime,triage_summary,urgency,status,expert_notes,created_at FROM crop_cases ORDER BY created_at DESC LIMIT 200`; return NextResponse.json({items:rows}); }
  catch{return NextResponse.json({error:"Unable to load crop cases."},{status:503});}
}
export async function PATCH(request:Request) {
  const staff=await requireStaff(); if(!staff) return NextResponse.json({error:"Staff access required."},{status:403});
  const parsed=schema.safeParse(await request.json()); if(!parsed.success) return NextResponse.json({error:"Invalid case update."},{status:400});
  try { const d=parsed.data; const rows=await getDb()`UPDATE crop_cases SET status=${d.status},expert_notes=${d.expertNotes??null},updated_at=NOW() WHERE id=${d.id} RETURNING id,status`; if(!rows[0])return NextResponse.json({error:"Case not found."},{status:404}); return NextResponse.json({ok:true,item:rows[0]}); }
  catch{return NextResponse.json({error:"Unable to update crop case."},{status:503});}
}
