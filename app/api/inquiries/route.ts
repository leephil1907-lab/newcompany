import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { inquirySchema } from "@/lib/validators";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { emailLayout, paragraph, safeText, sendEmail } from "@/lib/email";
import { getSession } from "@/lib/auth";
export const runtime = "nodejs";
export async function POST(request: Request) {
  if (!rateLimit("inquiry:"+clientKey(request),5,60_000)) return NextResponse.json({error:"Please wait before submitting another enquiry."},{status:429});
  try {
    const body = await request.json();
    const parsed = inquirySchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({error:"Please check the form fields and try again.",fields:parsed.error.flatten().fieldErrors},{status:400});
    const data = parsed.data;
    if (data.website) return NextResponse.json({ok:true});
    const sql = getDb();
    const user = await getSession();
    const [row] = await sql`INSERT INTO inquiries (user_id,name,email,phone,organisation,location,service_slug,farm_size,enterprise,production_stage,budget_range,message,preferred_contact) VALUES (${user?.id ?? null},${data.name},${data.email},${data.phone},${data.organisation},${data.location},${data.serviceSlug},${data.farmSize},${data.enterprise},${data.productionStage},${data.budgetRange},${data.message},${data.preferredContact}) RETURNING id`;
    const admin = process.env.ADMIN_NOTIFICATION_EMAIL || "hello@agrobridgeconsult.com";
    const adminHtml = emailLayout("New consultation enquiry",paragraph("A new request has been submitted through the AgroBridge website.")+`<p><b>Name:</b> ${safeText(data.name)}<br><b>Email:</b> ${safeText(data.email)}<br><b>Phone:</b> ${safeText(data.phone || "Not provided")}<br><b>Service:</b> ${safeText(data.serviceSlug || "Not specified")}<br><b>Location:</b> ${safeText(data.location || "Not provided")}<br><b>Farm / enterprise:</b> ${safeText(data.enterprise || "Not provided")}<br><b>Message:</b> ${safeText(data.message)}</p>`);
    const clientHtml = emailLayout("Thank you for contacting AgroBridge Consult",paragraph(`Dear ${data.name},`)+paragraph("Thank you for reaching out. We have received your consultation request and will review the information before getting back to you.")+paragraph("If you have additional farm details, photographs or project documents, you can reply to this email.")+paragraph("Warm regards,<br>AgroBridge Consult Team"));
    await Promise.all([
      sendEmail({to:admin,subject:"New AgroBridge consultation enquiry",html:adminHtml,text:`New enquiry from ${data.name} <${data.email}>: ${data.message}`}),
      sendEmail({to:data.email,subject:"Thank you for contacting AgroBridge Consult",html:clientHtml,text:`Dear ${data.name}, we received your consultation request. AgroBridge Consult Team.`})
    ]);
    return NextResponse.json({ok:true,id:row.id,message:"Your consultation request has been received."},{status:201});
  } catch(error) {
    console.error("Inquiry submission failed:",error instanceof Error?error.message:error);
    return NextResponse.json({error:"The enquiry could not be saved. Please try again or email hello@agrobridgeconsult.com."},{status:503});
  }
}
