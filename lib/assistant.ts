export type ChatMessage = { role: "user" | "assistant"; content: string };
const system = `You are the AgroBridge Consult Farm Assistant. Help visitors identify the right consultancy service and collect useful context. Ask one concise question at a time. Useful fields include location, farm size, crop or livestock, production stage, symptoms or goal, budget and preferred contact. Do not invent credentials, prices, project results, weather observations or availability. For crop diagnosis, describe possibilities as preliminary only; never prescribe pesticide products, dosages or chemical mixes. Ask the user to avoid handling unknown chemicals and route urgent or unclear cases to a qualified agronomist. For investment decisions, state that a site-specific feasibility review is needed. Services: farm planning, crop production, soil management, pest and disease advisory, inspection, management, farmer training, agribusiness advisory, market linkage, climate-smart agriculture, livestock/poultry/aquaculture and project support. Offer the consultation form when appropriate.`;
export async function assistantReply(messages: ChatMessage[]) {
  const key = process.env.AI_API_KEY;
  const base = process.env.AI_BASE_URL;
  const model = process.env.AI_MODEL;
  if (key && base && model) {
    const response = await fetch(base.replace(/\/$/,"") + "/chat/completions", {
      method:"POST", headers:{ Authorization:`Bearer ${key}`, "Content-Type":"application/json" },
      body:JSON.stringify({ model, temperature:0.35, max_tokens:450, messages:[{role:"system",content:system},...messages.slice(-12)] }), cache:"no-store", signal:AbortSignal.timeout(12000)
    });
    if (!response.ok) throw new Error("The configured AI provider did not respond successfully.");
    const data = await response.json() as { choices?: { message?: { content?: string } }[] };
    return data.choices?.[0]?.message?.content?.trim() || "Tell me a little more about your farm or agricultural project so I can guide you to the right next step.";
  }
  const last = messages.at(-1)?.content.toLowerCase() ?? "";
  if (/pest|disease|yellow|wilt|spot|insect|fungus|leaf/.test(last)) return "I can help organise a preliminary crop-health case. Which crop is affected, where is the farm located, and what growth stage is it in? If you have a clear photo, submit it through Crop Health Review so an agricultural professional can assess it. Any diagnosis here is preliminary.";
  if (/land|start|setup|farm plan|budget|hectare|acre/.test(last)) return "A good farm plan starts with the land, water, enterprise and market. What is the farm location and approximate land size? You can also complete our Farm Planning Intake to prepare a structured brief for review.";
  if (/train|workshop|cooperative|ngo/.test(last)) return "We support farmer workshops, field demonstrations, Good Agricultural Practices and institutional programmes. Is this training for an individual farmer, a cooperative, or an organisation?";
  if (/price|cost|fee|charge/.test(last)) return "Consultancy fees depend on the service, location, farm scale and scope of work. Share the support you need and your location through the consultation form so the team can assess the engagement.";
  return "Welcome to AgroBridge Consult. What would you like help with: farm planning, crop production, soil management, crop health, farm management, training, agribusiness or market access? Tell me your location and a little about your goal.";
}
