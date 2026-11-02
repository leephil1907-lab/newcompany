import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { emailLayout, paragraph, safeText, sendEmail } from "@/lib/email";
export const runtime="nodejs";
const val=(form:FormData,key:string)=>String(form.get(key)||"").trim();
export async function POST(request:Request) {
  if(!rateLimit("crop-case:"+clientKey(request),4,60_000)) return NextResponse.json({error:"Please wait before submitting another crop-health case."},{status:429});
  try {
    const form=await request.formData();
    const name=val(form,"name"),email=val(form,"email"),location=val(form,"location"),crop=val(form,"crop"),symptoms=val(form,"symptoms");
    if(name.length<2||name.length>120||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||location.length<2||crop.length<2||symptoms.length<10||symptoms.length>3000) return NextResponse.json({error:"Name, valid email, location, crop and a clear symptom description are required."},{status:400});
    const file=form.get("photo"); let bytes:Buffer|null=null; let mime:string|null=null; let filename:string|null=null;
    if(file instanceof File && file.size>0) {
      if(file.size>5*1024*1024) return NextResponse.json({error:"Crop photos must be 5 MB or smaller."},{status:400});
      if(!["image/jpeg","image/png","image/webp"].includes(file.type)) return NextResponse.json({error:"Upload a JPG, PNG or WebP crop photo."},{status:400});
      bytes=Buffer.from(await file.arrayBuffer()); mime=file.type; filename=file.name.slice(0,180);
    }
    const urgency=val(form,"urgent")==="yes"?"priority":val(form,"urgency")==="urgent"?"urgent":"standard";
    const user=await getSession(); const sql=getDb();
    const [row]=await sql`INSERT INTO crop_cases(user_id,name,email,phone,location,crop,variety,growth_stage,symptoms,affected_area,onset,recent_weather,recent_inputs,image_data,image_mime,image_name,urgency) VALUES(${user?.id??null},${name},${email},${val(form,"phone")},${location},${crop},${val(form,"variety")},${val(form,"growthStage")},${symptoms},${val(form,"affectedArea")},${val(form,"onset")},${val(form,"recentWeather")},${val(form,"recentInputs")},${bytes},${mime},${filename},${urgency}) RETURNING id`;
    const html=emailLayout("New crop-health case",paragraph("A crop-health report has been submitted and needs professional review.")+`<p><b>Client:</b> ${safeText(name)}<br><b>Crop:</b> ${safeText(crop)}<br><b>Location:</b> ${safeText(location)}<br><b>Urgency:</b> ${safeText(urgency)}<br><b>Symptoms:</b> ${safeText(symptoms)}</p>`);
    await sendEmail({to:process.env.ADMIN_NOTIFICATION_EMAIL||"hello@agrobridgeconsult.com",subject:"Crop-health case submitted for review",html,text:`Crop-health case ${row.id}: ${crop}, ${location}, ${symptoms}`});
    return NextResponse.json({ok:true,id:row.id,message:"Your crop-health case has been submitted for expert review. This is not a confirmed diagnosis."},{status:201});
  } catch(error){console.error("Crop case failed:",error instanceof Error?error.message:error);return NextResponse.json({error:"The crop-health case could not be saved."},{status:503});}
}
