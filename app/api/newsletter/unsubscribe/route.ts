import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { verifyNewsletterToken } from "@/lib/newsletter";
export const runtime="nodejs";
export async function GET(request:Request){const token=new URL(request.url).searchParams.get("token");if(!token)return NextResponse.redirect(new URL("/newsletter/confirmed?status=invalid",request.url));try{const email=await verifyNewsletterToken(token,"unsubscribe");await getDb()`UPDATE newsletter_subscribers SET unsubscribed_at=NOW() WHERE email=${email}`;return NextResponse.redirect(new URL("/newsletter/confirmed?status=unsubscribed",request.url));}catch{return NextResponse.redirect(new URL("/newsletter/confirmed?status=invalid",request.url));}}
