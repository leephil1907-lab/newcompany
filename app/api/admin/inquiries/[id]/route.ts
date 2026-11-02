import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
export const runtime="nodejs";
export async function GET(_request:Request,{params}:{params:Promise<{id:string}>}){const staff=await requireStaff();if(!staff)return NextResponse.json({error:"Staff access required."},{status:403});const {id}=await params;try{const rows=await getDb()`SELECT * FROM inquiries WHERE id=${id} LIMIT 1`;return rows[0]?NextResponse.json({item:rows[0]}):NextResponse.json({error:"Enquiry not found."},{status:404});}catch{return NextResponse.json({error:"Unable to load enquiry."},{status:503});}}
