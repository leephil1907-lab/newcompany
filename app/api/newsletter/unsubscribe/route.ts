import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { verifyNewsletterToken } from "@/lib/newsletter";
export const runtime="nodejs";
export async function GET(request:Request){const token=new URL(request.url).searchParams.get("token");if(!token)return NextResponse.redirect(new URL("/newsletter/confirmed?status=invalid",request.url));return NextResponse.redirect(new URL("/newsletter/unsubscribe?token="+encodeURIComponent(token),request.url));}
export async function POST(request:Request){const parsed=z.object({token:z.string().min(20).max(2000)}).safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Invalid unsubscribe link."},{status:400});try{const email=await verifyNewsletterToken(parsed.data.token,"unsubscribe");const rows=await getDb()`UPDATE newsletter_subscribers SET unsubscribed_at=NOW() WHERE email=${email} RETURNING id`;if(!rows[0])return NextResponse.json({error:"Subscription not found."},{status:404});return NextResponse.json({ok:true});}catch{return NextResponse.json({error:"This unsubscribe link is invalid or has expired."},{status:400});}}
