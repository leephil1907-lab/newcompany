import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { emailLayout, paragraph, sendEmail } from "@/lib/email";
import { clientKey, rateLimit } from "@/lib/rate-limit";
const schema=z.object({email:z.email().max(254),name:z.string().trim().max(120).optional().default(""),consent:z.literal(true)});
export async function POST(request:Request) {
  if(!rateLimit("newsletter:"+clientKey(request),5,60_000)) return NextResponse.json({error:"Please try again later."},{status:429});
  try {
    const parsed=schema.safeParse(await request.json()); if(!parsed.success) return NextResponse.json({error:"A valid email and consent are required."},{status:400});
    const {email,name}=parsed.data; const sql=getDb();
    const rows=await sql`INSERT INTO newsletter_subscribers(email,name) VALUES(${email.toLowerCase()},${name}) ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name,unsubscribed_at=NULL RETURNING id,email`;
    await sendEmail({to:email,subject:"Welcome to the AgroBridge farming community",html:emailLayout("Welcome to AgroBridge Consult",paragraph("You are subscribed to receive practical agricultural insights, training updates and agribusiness resources. You can unsubscribe at any time by contacting hello@agrobridgeconsult.com.")),text:"Welcome to AgroBridge Consult. You are subscribed to our agricultural insights."});
    return NextResponse.json({ok:true,message:"You have been added to the AgroBridge insights list."},{status:201});
  } catch(error){console.error("Newsletter signup failed:",error instanceof Error?error.message:error);return NextResponse.json({error:"Newsletter signup is temporarily unavailable."},{status:503});}
}
