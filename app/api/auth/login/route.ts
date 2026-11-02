import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { loginSchema } from "@/lib/validators";
import { createSession } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!rateLimit("login:"+clientKey(request),8,60_000)) return NextResponse.json({error:"Too many sign-in attempts. Try again later."},{status:429});
  try {
    const parsed=loginSchema.safeParse(await request.json());
    if(!parsed.success) return NextResponse.json({error:"Enter a valid email and password."},{status:400});
    const data=parsed.data;
    const sql=getDb();
    const [user]=await sql`SELECT id,name,email,role,password_hash FROM users WHERE email=${data.email.toLowerCase()} LIMIT 1`;
    if(!user || !(await bcrypt.compare(data.password,user.password_hash))) return NextResponse.json({error:"Email or password is incorrect."},{status:401});
    await createSession({id:user.id,name:user.name,email:user.email,role:user.role});
    return NextResponse.json({ok:true,user:{id:user.id,name:user.name,email:user.email,role:user.role}});
  } catch(error) {
    console.error("Login failed:",error instanceof Error?error.message:error);
    return NextResponse.json({error:"Sign-in is temporarily unavailable."},{status:503});
  }
}
