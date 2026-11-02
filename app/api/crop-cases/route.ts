import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { emailLayout, paragraph, safeText, sendEmail } from "@/lib/email";
import { preliminaryCropTriage } from "@/lib/crop-triage";
export const runtime="nodejs";
const val=(form:FormData,key:string)=>String(form.get(key)||"").trim();
// Keep in sync with MAX_PHOTO_BYTES in lib/photo-upload.ts (stays below Vercel's 4.5 MB request limit).
const MAX_PHOTO_BYTES=4*1024*1024;
// Identify the real image type from its file signature rather than trusting the browser-supplied MIME type.
function detectImageType(bytes:Buffer):string|null {
  if(bytes.length>3&&bytes[0]===0xff&&bytes[1]===0xd8&&bytes[2]===0xff) return "image/jpeg";
  if(bytes.length>8&&bytes.subarray(0,8).equals(Buffer.from([0x89,0x50,0x4e,0x47,0x0d,0x0a,0x1a,0x0a]))) return "image/png";
  if(bytes.length>12&&bytes.toString("ascii",0,4)==="RIFF"&&bytes.toString("ascii",8,12)==="WEBP") return "image/webp";
  return null;
}
export async function POST(request:Request) {
  if(!rateLimit("crop-case:"+clientKey(request),4,60_000)) return NextResponse.json({error:"Please wait before submitting another crop-health case."},{status:429});
  try {
    const form=await request.formData();
    const name=val(form,"name"),email=val(form,"email"),location=val(form,"location"),crop=val(form,"crop"),symptoms=val(form,"symptoms");
    if(name.length<2||name.length>120||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||location.length<2||crop.length<2||symptoms.length<10||symptoms.length>3000) return NextResponse.json({error:"Name, valid email, location, crop and a clear symptom description are required."},{status:400});
    const file=form.get("photo"); let bytes:Buffer|null=null; let mime:string|null=null; let filename:string|null=null;
    if(file instanceof File && file.size>0) {
      if(file.size>MAX_PHOTO_BYTES) return NextResponse.json({error:"Crop photos must be 4 MB or smaller."},{status:400});
      bytes=Buffer.from(await file.arrayBuffer()); mime=detectImageType(bytes); filename=file.name.slice(0,180);
      if(!mime) return NextResponse.json({error:"Upload a JPG, PNG or WebP crop photo."},{status:400});
    }
    const urgency=val(form,"urgent")==="yes"?"priority":val(form,"urgency")==="urgent"?"urgent":"standard";
    const user=await getSession(); const sql=getDb();
    const [row]=await sql`INSERT INTO crop_cases(user_id,name,email,phone,location,crop,variety,growth_stage,symptoms,affected_area,onset,recent_weather,recent_inputs,image_data,image_mime,image_name,urgency) VALUES(${user?.id??null},${name},${email},${val(form,"phone")},${location},${crop},${val(form,"variety")},${val(form,"growthStage")},${symptoms},${val(form,"affectedArea")},${val(form,"onset")},${val(form,"recentWeather")},${val(form,"recentInputs")},${bytes},${mime},${filename},${urgency}) RETURNING id`;
    const triage = val(form,"aiConsent")==="yes" ? await preliminaryCropTriage({crop,location,growthStage:val(form,"growthStage"),symptoms,weather:val(form,"recentWeather"),recentInputs:val(form,"recentInputs")},bytes&&mime?{base64:bytes.toString("base64"),mime}:undefined) : null;
    if(triage) await sql`UPDATE crop_cases SET triage_summary=${triage},updated_at=NOW() WHERE id=${row.id}`;
    const html=emailLayout("New crop-health case",paragraph("A crop-health report has been submitted and needs professional review.")+`<p><b>Client:</b> ${safeText(name)}<br><b>Crop:</b> ${safeText(crop)}<br><b>Location:</b> ${safeText(location)}<br><b>Urgency:</b> ${safeText(urgency)}<br><b>Symptoms:</b> ${safeText(symptoms)}</p>`+(triage?`<p><b>Preliminary AI triage (not a diagnosis):</b><br>${safeText(triage)}</p>`:""));
    await sendEmail({to:process.env.ADMIN_NOTIFICATION_EMAIL||"hello@agrobridgeconsult.com",subject:"Crop-health case submitted for review",html,text:`Crop-health case ${row.id}: ${crop}, ${location}, ${symptoms}`});
    return NextResponse.json({ok:true,id:row.id,message:"Your crop-health case has been submitted for expert review. This is not a confirmed diagnosis."},{status:201});
  } catch(error){console.error("Crop case failed:",error instanceof Error?error.message:error);return NextResponse.json({error:"The crop-health case could not be saved."},{status:503});}
}
