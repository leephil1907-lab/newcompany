import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";
export const runtime="nodejs";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}) {
  const user=await getSession(); if(!user) return new NextResponse("Unauthorized",{status:401});
  const {id}=await params;
  try {
    const sql=getDb();
    const rows=user.role==="admin"||user.role==="consultant"
      ? await sql`SELECT image_data,image_mime FROM crop_cases WHERE id=${id} LIMIT 1`
      : await sql`SELECT image_data,image_mime FROM crop_cases WHERE id=${id} AND user_id=${user.id} LIMIT 1`;
    const row=rows[0]; if(!row?.image_data) return new NextResponse("Image not found",{status:404});
    return new NextResponse(row.image_data as Buffer,{headers:{"Content-Type":row.image_mime||"application/octet-stream","Cache-Control":"private, no-store","X-Content-Type-Options":"nosniff"}});
  } catch { return new NextResponse("Unable to retrieve image",{status:503}); }
}
