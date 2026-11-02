import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
const statusSchema=z.enum(["new","reviewing","qualified","scheduled","in_progress","completed","closed"]);
export const runtime="nodejs";
export async function GET(request:Request) {
  const staff=await requireStaff(); if(!staff) return NextResponse.json({error:"Staff access required."},{status:403});
  const url=new URL(request.url); const status=url.searchParams.get("status");
  try {
    const sql=getDb();
    const rows=status&&statusSchema.safeParse(status).success
      ? await sql`SELECT * FROM inquiries WHERE status=${status} ORDER BY created_at DESC LIMIT 200`
      : await sql`SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 200`;
    return NextResponse.json({items:rows});
  } catch{return NextResponse.json({error:"Unable to load enquiries."},{status:503});}
}
export async function PATCH(request:Request) {
  const staff=await requireStaff(); if(!staff) return NextResponse.json({error:"Staff access required."},{status:403});
  const parsed=z.object({id:z.uuid(),status:statusSchema,assignedTo:z.uuid().nullable().optional()}).safeParse(await request.json());
  if(!parsed.success) return NextResponse.json({error:"Invalid enquiry update."},{status:400});
  try {
    const sql=getDb(); const {id,status,assignedTo}=parsed.data;
    const rows=await sql`UPDATE inquiries SET status=${status},assigned_to=${assignedTo??null},updated_at=NOW() WHERE id=${id} RETURNING id,status,assigned_to`;
    if(!rows[0]) return NextResponse.json({error:"Enquiry not found."},{status:404});
    return NextResponse.json({ok:true,item:rows[0]});
  } catch{return NextResponse.json({error:"Unable to update enquiry."},{status:503});}
}
