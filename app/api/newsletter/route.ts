import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { emailLayout,paragraph,sendEmail } from "@/lib/email";
import { createNewsletterToken } from "@/lib/newsletter";
import { clientKey,rateLimit } from "@/lib/rate-limit";
const schema=z.object({email:z.email().max(254),name:z.string().trim().max(120).optional().default(""),consent:z.literal(true)});
export async function POST(request:Request){
 if(!rateLimit("newsletter:"+clientKey(request),5,60_000))return NextResponse.json({error:"Please try again later."},{status:429});
 const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"A valid email and consent are required."},{status:400});
 if(!process.env.SESSION_SECRET)return NextResponse.json({error:"Newsletter confirmation is not configured yet."},{status:503});
 try{
  const {email,name}=parsed.data;const normalized=email.toLowerCase();const sql=getDb();
  await sql`INSERT INTO newsletter_subscribers(email,name,confirmed_at,unsubscribed_at) VALUES(${normalized},${name},NULL,NULL) ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name,confirmed_at=NULL,unsubscribed_at=NULL`;
  const token=await createNewsletterToken(normalized,"confirm");const base=process.env.NEXT_PUBLIC_SITE_URL||"https://agrobridgeconsult.com";const link=base+"/api/newsletter/confirm?token="+token;
  const html=emailLayout("Confirm your AgroBridge subscription",paragraph("Please confirm that you would like to receive agricultural insights, seasonal guidance and training updates from AgroBridge Consult.")+`<p style="margin:26px 0"><a href="${link}" style="display:inline-block;background:#1b5e20;color:#fff;padding:14px 22px;border-radius:28px;text-decoration:none;font-weight:bold">Confirm subscription</a></p>`+paragraph("If you did not request these updates, you can ignore this message."));
  const sent=await sendEmail({to:normalized,subject:"Confirm your AgroBridge newsletter subscription",html,text:"Confirm your AgroBridge newsletter subscription: "+link});
  return NextResponse.json({ok:true,message:sent?"Check your inbox to confirm your subscription.":"Your request was recorded, but the confirmation email could not be sent. Please try again later."},{status:201});
 }catch(error){console.error("Newsletter signup failed:",error instanceof Error?error.message:error);return NextResponse.json({error:"Newsletter signup is temporarily unavailable."},{status:503});}
}
