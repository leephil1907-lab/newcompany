import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getDb } from "@/lib/db";
export const runtime="nodejs";
export async function GET(){
 const user=await getSession();if(!user)return NextResponse.json({error:"Sign in to view your workspace."},{status:401});
 try{
  const sql=getDb();
  const [inquiries,plans,cases,enrollments]=await Promise.all([
   sql`SELECT id,service_slug,status,created_at FROM inquiries WHERE user_id=${user.id} ORDER BY created_at DESC LIMIT 20`,
   sql`SELECT id,location,enterprise_type,crops_or_animals,status,created_at FROM farm_plans WHERE user_id=${user.id} ORDER BY created_at DESC LIMIT 20`,
   sql`SELECT id,crop,location,status,urgency,created_at FROM crop_cases WHERE user_id=${user.id} ORDER BY created_at DESC LIMIT 20`,
   sql`SELECT e.id,c.title,c.slug,e.enrolled_at FROM enrollments e JOIN courses c ON c.id=e.course_id WHERE e.user_id=${user.id} ORDER BY e.enrolled_at DESC`
  ]);
  return NextResponse.json({user,inquiries,plans,cases,enrollments});
 }catch(error){console.error("Workspace load failed:",error instanceof Error?error.message:error);return NextResponse.json({error:"Workspace data is unavailable until the database is configured."},{status:503});}
}
