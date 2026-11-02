import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){const staff=await requireStaff();if(!staff)return NextResponse.json({error:"Staff access required."},{status:403});const parsed=z.object({status:z.enum(["draft","published","registration_closed","completed","cancelled"])}).safeParse(await request.json());if(!parsed.success)return NextResponse.json({error:"Invalid programme status."},{status:400});const {id}=await params;try{const rows=await getDb()`UPDATE training_programs SET status=${parsed.data.status},updated_at=NOW() WHERE id=${id} RETURNING id,status`;if(!rows[0])return NextResponse.json({error:"Programme not found."},{status:404});return NextResponse.json({ok:true,item:rows[0]});}catch{return NextResponse.json({error:"Unable to update programme."},{status:503});}}
