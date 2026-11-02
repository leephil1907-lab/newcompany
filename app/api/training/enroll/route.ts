import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
export const runtime="nodejs";
export async function POST(request:Request){
 const user=await getSession();if(!user)return NextResponse.json({error:"Sign in to enrol."},{status:401});
 const parsed=z.object({courseId:z.uuid()}).safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Invalid course."},{status:400});
 try{const rows=await getDb()`INSERT INTO enrollments(user_id,course_id) SELECT ${user.id},id FROM courses WHERE id=${parsed.data.courseId} AND published=true ON CONFLICT(user_id,course_id) DO UPDATE SET user_id=EXCLUDED.user_id RETURNING id`;if(!rows[0])return NextResponse.json({error:"Course not found."},{status:404});return NextResponse.json({ok:true});}
 catch{return NextResponse.json({error:"Unable to enrol right now."},{status:503});}
}
