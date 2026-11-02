import { NextResponse } from "next/server";
import { z } from "zod";
import { assistantReply } from "@/lib/assistant";
import { clientKey, rateLimit } from "@/lib/rate-limit";
const schema=z.object({messages:z.array(z.object({role:z.enum(["user","assistant"]),content:z.string().trim().min(1).max(2000)})).min(1).max(20)});
export async function POST(request:Request) {
  if(!rateLimit("assistant:"+clientKey(request),20,60_000)) return NextResponse.json({error:"Please slow down and try again."},{status:429});
  try {
    const parsed=schema.safeParse(await request.json()); if(!parsed.success) return NextResponse.json({error:"Invalid chat message."},{status:400});
    const reply=await assistantReply(parsed.data.messages);
    return NextResponse.json({reply,mode:process.env.AI_API_KEY&&process.env.AI_BASE_URL&&process.env.AI_MODEL?"ai_provider":"guided_fallback"});
  } catch(error){console.error("Assistant request failed:",error instanceof Error?error.message:error);return NextResponse.json({error:"The assistant is temporarily unavailable. Please use the consultation form."},{status:503});}
}
