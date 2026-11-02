import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { emailLayout,paragraph,safeText,sendEmail } from "@/lib/email";
import { clientKey,rateLimit } from "@/lib/rate-limit";
export const runtime="nodejs";
const schema=z.object({name:z.string().trim().min(2).max(120),email:z.email().max(254),phone:z.string().max(40).optional().default(""),serviceSlug:z.string().max(120).optional().default(""),preferredDate:z.iso.date(),preferredTime:z.enum(["09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00"]),meetingType:z.enum(["online","phone","office","farm_visit"]),location:z.string().max(180).optional().default(""),notes:z.string().max(2000).optional().default("")});
export async function POST(request:Request){
 if(!rateLimit("appointment:"+clientKey(request),4,60_000))return NextResponse.json({error:"Please wait before submitting another booking request."},{status:429});
 const parsed=schema.safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Check the booking details and try again."},{status:400});
 const d=parsed.data;if(d.preferredDate<new Date().toISOString().slice(0,10))return NextResponse.json({error:"Choose a future date."},{status:400});
 try{
  const user=await getSession();const rows=await getDb()`INSERT INTO appointments(user_id,name,email,phone,service_slug,preferred_date,preferred_time,meeting_type,location,notes) VALUES(${user?.id??null},${d.name},${d.email},${d.phone},${d.serviceSlug},${d.preferredDate},${d.preferredTime},${d.meetingType},${d.location},${d.notes}) RETURNING id`;
  const adminHtml=emailLayout("New consultation booking request",paragraph("A client has requested an appointment. This is a request, not a confirmed booking.")+`<p><b>Name:</b> ${safeText(d.name)}<br><b>Email:</b> ${safeText(d.email)}<br><b>Date:</b> ${safeText(d.preferredDate)}<br><b>Time:</b> ${safeText(d.preferredTime)}<br><b>Meeting:</b> ${safeText(d.meetingType)}<br><b>Service:</b> ${safeText(d.serviceSlug||"General consultation")}</p>`);
  await Promise.all([sendEmail({to:process.env.ADMIN_NOTIFICATION_EMAIL||"hello@agrobridgeconsult.com",subject:"New AgroBridge consultation booking request",html:adminHtml,text:`Booking request from ${d.name} for ${d.preferredDate} at ${d.preferredTime}.`}),sendEmail({to:d.email,subject:"We received your AgroBridge booking request",html:emailLayout("Your appointment request has been received",paragraph(`Hello ${d.name}, we have received your preferred date and time. Our team will review availability and contact you to confirm. Your appointment is not confirmed until you receive a confirmation from AgroBridge Consult.`)),text:"We received your preferred date and time. Our team will contact you to confirm availability."})]);
  return NextResponse.json({ok:true,id:rows[0].id,message:"Your preferred appointment time has been submitted for confirmation."},{status:201});
 }catch(error){console.error("Appointment request failed:",error instanceof Error?error.message:error);return NextResponse.json({error:"Unable to save your appointment request."},{status:503});}
}
