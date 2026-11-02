import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { registerSchema } from "@/lib/validators";
import { createSession } from "@/lib/auth";
import { emailLayout, paragraph, sendEmail } from "@/lib/email";
import { clientKey, rateLimit } from "@/lib/rate-limit";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!rateLimit("register:"+clientKey(request),4,60_000)) return NextResponse.json({error:"Too many attempts. Try again shortly."},{status:429});
  try {
    const parsed=registerSchema.safeParse(await request.json());
    if(!parsed.success) return NextResponse.json({error:"Enter a valid name, email and password of at least 10 characters.",fields:parsed.error.flatten().fieldErrors},{status:400});
    const data=parsed.data;
    const passwordHash=await bcrypt.hash(data.password,12);
    const sql=getDb();
    const [user]=await sql`INSERT INTO users(name,email,phone,password_hash) VALUES(${data.name},${data.email.toLowerCase()},${data.phone},${passwordHash}) ON CONFLICT(email) DO NOTHING RETURNING id,name,email,role`;
    if(!user) return NextResponse.json({error:"An account with this email already exists."},{status:409});
    await createSession({id:user.id,name:user.name,email:user.email,role:user.role});
    const html=emailLayout("Welcome to AgroBridge Consult",paragraph(`Hello ${user.name},`)+paragraph("Your client account is ready. You can now submit farm planning briefs, request crop-health reviews and track your enquiries from your workspace."));
    await sendEmail({to:user.email,subject:"Welcome to AgroBridge Consult",html,text:`Welcome ${user.name}. Your AgroBridge client account is ready.`});
    return NextResponse.json({ok:true,user:{id:user.id,name:user.name,email:user.email,role:user.role}},{status:201});
  } catch(error) {
    console.error("Registration failed:",error instanceof Error?error.message:error);
    return NextResponse.json({error:"Registration is temporarily unavailable. Check database configuration and try again."},{status:503});
  }
}
