import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { farmPlanSchema } from "@/lib/validators";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { emailLayout, paragraph, safeText, sendEmail } from "@/lib/email";
export const runtime="nodejs";
export async function POST(request:Request) {
  if(!rateLimit("farm-plan:"+clientKey(request),5,60_000)) return NextResponse.json({error:"Please wait before submitting another farm brief."},{status:429});
  try {
    const parsed=farmPlanSchema.safeParse(await request.json());
    if(!parsed.success) return NextResponse.json({error:"Please complete the required farm planning fields.",fields:parsed.error.flatten().fieldErrors},{status:400});
    const d=parsed.data; const user=await getSession(); const sql=getDb();
    const brief={land:{size:d.landSize,status:d.landStatus,location:d.location},water:{source:d.waterSource,irrigation:d.irrigationStatus},enterprise:{type:d.enterpriseType,cropsOrAnimals:d.cropsOrAnimals},resources:{budget:d.budgetRange,labour:d.labourAvailability},marketGoal:d.marketGoal,experience:d.experienceLevel,challenges:d.challenges,extraDetails:d.extraDetails};
    const [row]=await sql`INSERT INTO farm_plans(user_id,client_name,email,phone,location,land_size,land_status,water_source,irrigation_status,enterprise_type,crops_or_animals,budget_range,labour_availability,market_goal,experience_level,challenges,extra_details,brief) VALUES(${user?.id??null},${d.clientName},${d.email},${d.phone},${d.location},${d.landSize},${d.landStatus},${d.waterSource},${d.irrigationStatus},${d.enterpriseType},${d.cropsOrAnimals},${d.budgetRange},${d.labourAvailability},${d.marketGoal},${d.experienceLevel},${d.challenges},${d.extraDetails},${JSON.stringify(brief)}::jsonb) RETURNING id`;
    const adminHtml=emailLayout("New farm planning brief",paragraph("A new farm planning intake is ready for review.")+`<p><b>Client:</b> ${safeText(d.clientName)}<br><b>Location:</b> ${safeText(d.location)}<br><b>Land:</b> ${safeText(d.landSize)}<br><b>Enterprise:</b> ${safeText(d.enterpriseType)} — ${safeText(d.cropsOrAnimals)}<br><b>Budget:</b> ${safeText(d.budgetRange||"Not provided")}<br><b>Goal:</b> ${safeText(d.marketGoal||"Not provided")}</p>`);
    await Promise.all([sendEmail({to:process.env.ADMIN_NOTIFICATION_EMAIL||"hello@agrobridgeconsult.com",subject:"New AgroBridge farm planning brief",html:adminHtml,text:`Farm plan from ${d.clientName}, ${d.location}, ${d.landSize}, ${d.cropsOrAnimals}`}),sendEmail({to:d.email,subject:"Your AgroBridge farm brief has been received",html:emailLayout("Your farm brief is with our team",paragraph(`Hello ${d.clientName}, we have received your farm planning information. Our team will review the details before recommending next steps.`)),text:"Your AgroBridge farm planning brief has been received."})]);
    return NextResponse.json({ok:true,id:row.id,message:"Your farm planning brief has been submitted for review."},{status:201});
  } catch(error){console.error("Farm plan submission failed:",error instanceof Error?error.message:error);return NextResponse.json({error:"The farm brief could not be saved. Please try again."},{status:503});}
}
