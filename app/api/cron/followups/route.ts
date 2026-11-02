import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { emailLayout, paragraph, sendEmail } from "@/lib/email";
export const runtime="nodejs";
export async function GET(request:Request) {
  const secret=process.env.CRON_SECRET;
  if(!secret || request.headers.get("authorization")!==`Bearer ${secret}`) return NextResponse.json({error:"Unauthorized."},{status:401});
  if(!process.env.RESEND_API_KEY || !process.env.EMAIL_FROM) return NextResponse.json({error:"Email provider is not configured."},{status:503});
  try {
    const sql=getDb();
    const due=await sql`SELECT id,name,email,service_slug FROM inquiries WHERE followup_sent_at IS NULL AND status IN ('new','reviewing') AND created_at < NOW()-INTERVAL '24 hours' ORDER BY created_at ASC LIMIT 50`;
    let sent=0;
    for(const item of due) {
      const html=emailLayout("Following up on your AgroBridge enquiry",paragraph(`Hello ${item.name}, we are following up on the agricultural support request you sent to AgroBridge Consult. If you would still like to discuss your project, reply to this email or submit an update through our website.`));
      const ok=await sendEmail({to:item.email,subject:"Following up on your AgroBridge consultation request",html,text:`Hello ${item.name}, we are following up on your AgroBridge consultation request. Reply to this email if you would like to continue.`});
      if(ok) { await sql`UPDATE inquiries SET followup_sent_at=NOW(),updated_at=NOW() WHERE id=${item.id}`; sent++; }
    }
    return NextResponse.json({ok:true,eligible:due.length,sent});
  } catch(error){console.error("Follow-up job failed:",error instanceof Error?error.message:error);return NextResponse.json({error:"Follow-up job failed."},{status:503});}
}
