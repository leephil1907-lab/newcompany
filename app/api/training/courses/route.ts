import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
export const runtime="nodejs";
export async function GET(){
 try{const items=await getDb()`SELECT id,title,slug,summary,description,level,duration FROM courses WHERE published=true ORDER BY created_at DESC`;return NextResponse.json({items});}
 catch{return NextResponse.json({error:"Course catalogue is unavailable."},{status:503});}
}
export async function POST(request:Request){
 const staff=await requireStaff();if(!staff)return NextResponse.json({error:"Staff access required."},{status:403});
 const schema=z.object({title:z.string().trim().min(3).max(160),slug:z.string().trim().regex(/^[a-z0-9-]+$/).max(160),summary:z.string().trim().min(10).max(500),description:z.string().max(10000).optional(),level:z.enum(["beginner","intermediate","advanced"]).default("beginner"),duration:z.string().max(80).optional(),published:z.boolean().default(false)});
 const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Invalid course details."},{status:400});
 try{const d=parsed.data;const rows=await getDb()`INSERT INTO courses(title,slug,summary,description,level,duration,published) VALUES(${d.title},${d.slug},${d.summary},${d.description??""},${d.level},${d.duration??""},${d.published}) RETURNING id,title,slug`;return NextResponse.json({ok:true,item:rows[0]},{status:201});}
 catch{return NextResponse.json({error:"Could not create course. Check that its slug is unique."},{status:503});}
}
