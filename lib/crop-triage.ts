type CropInput={crop:string;location:string;growthStage:string;symptoms:string;weather:string;recentInputs:string};
export async function preliminaryCropTriage(input:CropInput,image?:{base64:string;mime:string}){
 const key=process.env.AI_API_KEY,base=process.env.AI_BASE_URL,model=process.env.AI_MODEL;
 if(!key||!base||!model)return null;
 const prompt=`You are assisting an agricultural consultant with preliminary crop-health triage. This is not a diagnosis. Use only the information provided. Clearly separate visible observations from possible explanations, mention uncertainty, and list useful follow-up questions. Never prescribe pesticides, brands, dosages, mixtures, or chemical treatments. Do not claim certainty from a photo. Recommend qualified local agronomist or extension review before treatment. If symptoms appear rapidly spreading or severe, flag prompt professional review. Keep the response under 180 words.\nCrop: ${input.crop}\nLocation: ${input.location}\nGrowth stage: ${input.growthStage||"Not provided"}\nSymptoms: ${input.symptoms}\nRecent weather: ${input.weather||"Not provided"}\nRecent inputs: ${input.recentInputs||"Not provided"}`;
 const content:Array<Record<string,unknown>>=[{type:"text",text:prompt}];
 if(image)content.push({type:"image_url",image_url:{url:`data:${image.mime};base64,${image.base64}`,detail:"low"}});
 try{
  const response=await fetch(base.replace(/\/$/,"")+"/chat/completions",{method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model,temperature:0.2,max_tokens:300,messages:[{role:"user",content}]}),cache:"no-store",signal:AbortSignal.timeout(15000)});
  if(!response.ok)return null;
  const data=await response.json() as {choices?:{message?:{content?:string}}[]};
  return data.choices?.[0]?.message?.content?.trim()||null;
 }catch(error){console.error("Crop triage provider error:",error instanceof Error?error.message:error);return null;}
}
