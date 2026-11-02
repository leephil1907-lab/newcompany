import { NextResponse } from "next/server";
import { createHash,randomBytes } from "node:crypto";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { sendEmail,emailLayout,paragraph } from "@/lib/email";
import { clientKey,rateLimit } from "@/lib/rate-limit";
export const runtime="nodejs";
export async function POST(request:Request){
 if(!rateLimit("forgot:"+clientKey(request),4,60_000))return NextResponse.json({message:"If an account exists for that address, a reset link will be sent."});
 const parsed=z.object({email:z.email().max(254)}).safeParse(await request.json());
 if(!parsed.success)return NextResponse.json({error:"Enter a valid email address."},{status:400});
 try{
  const sql=getDb();
  const rows=await sql`SELECT id,name,email FROM users WHERE email=${parsed.data.email.toLowerCase()} LIMIT 1`;
  if(rows[0]){
   const token=randomBytes(32).toString("hex");
   const hash=createHash("sha256").update(token).digest("hex");
   await sql`UPDATE password_reset_tokens SET used_at=NOW() WHERE user_id=${rows[0].id} AND used_at IS NULL`;
   await sql`INSERT INTO password_reset_tokens(user_id,token_hash,expires_at) VALUES(${rows[0].id},${hash},NOW()+INTERVAL '30 minutes')`;
   const base=process.env.NEXT_PUBLIC_SITE_URL||"https://agrobridgeconsult.com";
   const link=base+"/reset-password?token="+token;
   const html=emailLayout("Password reset request",paragraph(`Hello ${rows[0].name}, we received a request to reset your AgroBridge account password. This link expires in 30 minutes.`)+`<p style="margin:24px 0"><a href="${link}" style="display:inline-block;background:#1b5e20;color:#fff;padding:14px 22px;border-radius:28px;text-decoration:none;font-weight:bold">Reset password</a></p>`+paragraph("If you did not request this, you can ignore this email."));
   await sendEmail({to:rows[0].email,subject:"Reset your AgroBridge password",html,text:"Reset your AgroBridge password within 30 minutes: "+link});
  }
  return NextResponse.json({message:"If an account exists for that address, a reset link will be sent."});
 }catch(error){
  console.error("Password reset request failed:",error instanceof Error?error.message:error);
  return NextResponse.json({error:"Password reset is temporarily unavailable."},{status:503});
 }
}
