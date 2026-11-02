import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { clientKey,rateLimit } from "@/lib/rate-limit";
export const runtime="nodejs";
export async function POST(request:Request){
 if(!rateLimit("reset:"+clientKey(request),5,60_000))return NextResponse.json({error:"Too many attempts. Request a new reset link later."},{status:429});
 const parsed=z.object({token:z.string().min(32).max(200),password:z.string().min(10).max(128)}).safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Use a valid reset link and a password of at least 10 characters."},{status:400});
 const hash=createHash("sha256").update(parsed.data.token).digest("hex");const passwordHash=await bcrypt.hash(parsed.data.password,12);
 try{
  const sql=getDb();
  await sql.begin(async tx=>{
   const rows=await tx`SELECT id,user_id FROM password_reset_tokens WHERE token_hash=${hash} AND used_at IS NULL AND expires_at>NOW() FOR UPDATE`;
   if(!rows[0])throw new Error("RESET_TOKEN_INVALID");
   await tx`UPDATE users SET password_hash=${passwordHash},updated_at=NOW() WHERE id=${rows[0].user_id}`;
   await tx`UPDATE password_reset_tokens SET used_at=NOW() WHERE id=${rows[0].id}`;
   await tx`UPDATE password_reset_tokens SET used_at=NOW() WHERE user_id=${rows[0].user_id} AND used_at IS NULL`;
  });
  return NextResponse.json({ok:true,message:"Your password has been reset. You can now sign in."});
 }catch(error){if(error instanceof Error&&error.message==="RESET_TOKEN_INVALID")return NextResponse.json({error:"This reset link is invalid or has expired. Request a new one."},{status:400});console.error("Password reset failed:",error instanceof Error?error.message:error);return NextResponse.json({error:"Unable to reset the password right now."},{status:503});}
}
