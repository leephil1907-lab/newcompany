import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
export async function GET(){const staff=await requireStaff();if(!staff)return NextResponse.json({error:"Staff access required."},{status:403});try{return NextResponse.json({items:await getDb()`SELECT id,title,slug,summary,level,duration,published,created_at FROM courses ORDER BY created_at DESC`});}catch{return NextResponse.json({error:"Unable to load courses."},{status:503});}}
