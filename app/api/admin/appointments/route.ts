import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { emailLayout,paragraph,sendEmail } from "@/lib/email";
const schema=z.object({id:z.uuid(),status:z.enum(["requested","confirmed","rescheduled","cancelled","completed"])});
export const runtime="nodejs";
export async function GET(){const staff=await requireStaff();if(!staff)return NextResponse.json({error:"Staff access required."},{status:403});try{return NextResponse.json({items:await getDb()`SELECT * FROM appointments ORDER BY preferred_date ASC,preferred_time ASC LIMIT 200`});}catch{return NextResponse.json({error:"Unable to load appointments."},{status:503});}}
export async function PATCH(request:Request){
 const staff=await requireStaff();if(!staff)return NextResponse.json({error:"Staff access required."},{status:403});
 const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Invalid appointment update."},{status:400});
 try{
  const d=parsed.data;const sql=getDb();
  const a=await sql.begin(async tx=>{
   const [current]=await tx`SELECT id,name,email,preferred_date,preferred_time,meeting_type,status FROM appointments WHERE id=${d.id} FOR UPDATE`;
   if(!current)return null;
   if(d.status==="confirmed"){
    const slot=String(current.preferred_date).slice(0,10)+" "+current.preferred_time;
    await tx`SELECT pg_advisory_xact_lock(hashtext(${slot}))`;
    const [occupied]=await tx`SELECT COUNT(*)::int AS total FROM appointments WHERE preferred_date=${current.preferred_date} AND preferred_time=${current.preferred_time} AND status='confirmed' AND id<>${d.id}`;
    if(occupied.total>0)throw new Error("APPOINTMENT_SLOT_TAKEN");
   }
   const rows=await tx`UPDATE appointments SET status=${d.status},confirmed_at=CASE WHEN ${d.status}='confirmed' THEN NOW() ELSE confirmed_at END,updated_at=NOW() WHERE id=${d.id} RETURNING id,name,email,preferred_date,preferred_time,meeting_type,status`;
   return rows[0];
  });
  if(!a)return NextResponse.json({error:"Appointment not found."},{status:404});
  if(d.status==="confirmed")await sendEmail({to:a.email,subject:"Your AgroBridge consultation is confirmed",html:emailLayout("Your consultation is confirmed",paragraph(`Hello ${a.name}, your consultation has been confirmed for ${a.preferred_date} at ${a.preferred_time} WAT. Our team will contact you with the meeting details.`)),text:`Your AgroBridge consultation is confirmed for ${a.preferred_date} at ${a.preferred_time} WAT.`});
  return NextResponse.json({ok:true,item:a});
 }catch(error){if(error instanceof Error&&error.message==="APPOINTMENT_SLOT_TAKEN")return NextResponse.json({error:"That date and time already has a confirmed consultation. Review another request or contact the client to agree a new time."},{status:409});return NextResponse.json({error:"Unable to update appointment."},{status:503});}
}
