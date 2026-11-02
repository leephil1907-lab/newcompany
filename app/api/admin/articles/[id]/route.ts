import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){const staff=await requireStaff();if(!staff)return NextResponse.json({error:"Staff access required."},{status:403});const parsed=z.object({published:z.boolean()}).safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Invalid publication setting."},{status:400});const {id}=await params;try{const rows=await getDb()`UPDATE articles SET published=${parsed.data.published},published_at=CASE WHEN ${parsed.data.published} THEN COALESCE(published_at,NOW()) ELSE NULL END,updated_at=NOW() WHERE id=${id} RETURNING id,published`;if(!rows[0])return NextResponse.json({error:"Article not found."},{status:404});return NextResponse.json({ok:true,item:rows[0]});}catch{return NextResponse.json({error:"Unable to update article."},{status:503});}}
