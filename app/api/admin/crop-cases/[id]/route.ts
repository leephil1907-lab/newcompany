import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { emailLayout,paragraph,sendEmail } from "@/lib/email";
export const runtime="nodejs";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){
 const staff=await requireStaff();if(!staff)return NextResponse.json({error:"Staff access required."},{status:403});
 const parsed=z.object({status:z.enum(["submitted","reviewing","expert_response_sent","closed"]),expertNotes:z.string().trim().min(5).max(5000)}).safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"A status and expert review note are required."},{status:400});
 const {id}=await params;try{const sql=getDb();const rows=await sql`UPDATE crop_cases SET status=${parsed.data.status},expert_notes=${parsed.data.expertNotes},updated_at=NOW() WHERE id=${id} RETURNING id,name,email,crop`;if(!rows[0])return NextResponse.json({error:"Crop case not found."},{status:404});const row=rows[0];if(parsed.data.status==="expert_response_sent")await sendEmail({to:row.email,subject:"AgroBridge crop-health review update",html:emailLayout("Your crop-health case has been reviewed",paragraph(`Hello ${row.name}, our team has added a professional review note to your crop-health case for ${row.crop}. Please sign in to your AgroBridge workspace to view the update.`)),text:`Your AgroBridge crop-health case for ${row.crop} has a new expert review note. Sign in to your workspace.`});return NextResponse.json({ok:true,item:{id:row.id,status:parsed.data.status}});}catch{return NextResponse.json({error:"Unable to save expert review."},{status:503});}
}
