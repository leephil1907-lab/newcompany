import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
export const runtime="nodejs";
export async function POST(request:Request){
 const user=await getSession();if(!user)return NextResponse.json({error:"Sign in to save progress."},{status:401});
 const parsed=z.object({lessonId:z.uuid()}).safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Invalid lesson."},{status:400});
 try{const rows=await getDb()`INSERT INTO lesson_progress(user_id,lesson_id) SELECT ${user.id},l.id FROM lessons l JOIN enrollments e ON e.course_id=l.course_id AND e.user_id=${user.id} WHERE l.id=${parsed.data.lessonId} ON CONFLICT(user_id,lesson_id) DO UPDATE SET completed_at=NOW() RETURNING id`;if(!rows[0])return NextResponse.json({error:"Enrol in the course before completing this lesson."},{status:403});return NextResponse.json({ok:true});}
 catch{return NextResponse.json({error:"Unable to save lesson progress."},{status:503});}
}
