import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { clientKey,rateLimit } from "@/lib/rate-limit";
import { emailLayout,paragraph,sendEmail } from "@/lib/email";
const schema=z.object({programId:z.uuid(),name:z.string().trim().min(2).max(120),email:z.email().max(254),phone:z.string().max(40).optional().default(""),organisation:z.string().max(160).optional().default(""),farmerGroup:z.string().max(160).optional().default(""),notes:z.string().max(1500).optional().default("")});
export const runtime="nodejs";
export async function POST(request:Request){
 if(!rateLimit("programme-register:"+clientKey(request),5,60_000))return NextResponse.json({error:"Please wait before registering again."},{status:429});
 const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Complete your name, email and programme details."},{status:400});
 try{
  const d=parsed.data;const user=await getSession();const sql=getDb();
  const todayWAT=new Intl.DateTimeFormat("en-CA",{timeZone:"Africa/Lagos",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
  const result=await sql.begin(async tx=>{
   const [program]=await tx`SELECT id,title,start_date,location,capacity,status,registration_deadline FROM training_programs WHERE id=${d.programId} FOR UPDATE`;
   if(!program||program.status!=="published")return {error:"This programme is not open for registration."};
   if(program.registration_deadline&&String(program.registration_deadline).slice(0,10)<todayWAT)return {error:"Registration for this programme has closed."};
   if(program.capacity){const [count]=await tx`SELECT COUNT(*)::int AS total FROM training_registrations WHERE program_id=${d.programId} AND attendance_status<>'cancelled'`;if(count.total>=program.capacity)return {error:"This programme has reached its registration capacity."};}
   const rows=await tx`INSERT INTO training_registrations(program_id,user_id,name,email,phone,organisation,farmer_group,notes) VALUES(${d.programId},${user?.id??null},${d.name},${d.email.toLowerCase()},${d.phone},${d.organisation},${d.farmerGroup},${d.notes}) ON CONFLICT(program_id,email) DO NOTHING RETURNING id`;
   if(!rows[0])return {error:"This email is already registered for the programme."};
   return {program};
  });
  if("error" in result)return NextResponse.json({error:result.error},{status:409});
  const program=result.program;
  await Promise.all([
   sendEmail({to:d.email,subject:"AgroBridge training registration received",html:emailLayout("Your programme registration is received",paragraph(`Hello ${d.name}, your registration request for ${program.title} has been received. The programme team will share participation details before the session.`)),text:`Your registration for ${program.title} has been received.`}),
   sendEmail({to:process.env.ADMIN_NOTIFICATION_EMAIL||"hello@agrobridgeconsult.com",subject:"New farmer training registration",html:emailLayout("New programme registration",paragraph(`${d.name} registered for ${program.title}. Email: ${d.email}. Phone: ${d.phone||"Not provided"}.`)),text:`${d.name} registered for ${program.title}.`})
  ]);
  return NextResponse.json({ok:true,message:"Your programme registration has been received."},{status:201});
 }catch(error){console.error("Programme registration failed:",error instanceof Error?error.message:error);return NextResponse.json({error:"Unable to register for this programme."},{status:503});}
}
