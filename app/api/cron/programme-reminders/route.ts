import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { emailLayout,paragraph,sendEmail } from "@/lib/email";
export const runtime="nodejs";
export async function GET(request:Request){
 const secret=process.env.CRON_SECRET;if(!secret||request.headers.get("authorization")!==`Bearer ${secret}`)return NextResponse.json({error:"Unauthorized."},{status:401});
 if(!process.env.RESEND_API_KEY||!process.env.EMAIL_FROM)return NextResponse.json({error:"Email provider is not configured."},{status:503});
 try{
  const sql=getDb();const due=await sql`SELECT r.id,r.name,r.email,p.title,p.start_date,p.location,p.delivery_mode FROM training_registrations r JOIN training_programs p ON p.id=r.program_id WHERE r.attendance_status='registered' AND r.reminder_sent_at IS NULL AND p.status IN ('published','registration_closed') AND p.start_date BETWEEN CURRENT_DATE AND CURRENT_DATE+2 ORDER BY p.start_date ASC LIMIT 200`;
  let sent=0;for(const r of due){const ok=await sendEmail({to:r.email,subject:"Reminder: your AgroBridge training programme is approaching",html:emailLayout("Your training programme is approaching",paragraph(`Hello ${r.name}, this is a reminder that ${r.title} is scheduled for ${r.start_date}. Delivery mode: ${r.delivery_mode}. Location: ${r.location||"Details will be shared by the programme team"}. Please contact AgroBridge Consult if your attendance plans have changed.`)),text:`Reminder: ${r.title} is scheduled for ${r.start_date}. Location: ${r.location||"Details to follow"}.`});if(ok){await sql`UPDATE training_registrations SET reminder_sent_at=NOW() WHERE id=${r.id}`;sent++;}}
  return NextResponse.json({ok:true,eligible:due.length,sent});
 }catch(error){console.error("Programme reminder job failed:",error instanceof Error?error.message:error);return NextResponse.json({error:"Programme reminder job failed."},{status:503});}
}
