"use client";
import { useState } from "react";
import { ArrowUpRight, LoaderCircle } from "lucide-react";
export function ContactForm({defaultService=""}:{defaultService?:string}) {
  const [busy,setBusy]=useState(false); const [message,setMessage]=useState(""); const [error,setError]=useState("");
  async function submit(form:FormData) {
    setBusy(true);setError("");setMessage("");
    const payload=Object.fromEntries(form.entries());
    try { const response=await fetch("/api/inquiries",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
      const data=await response.json(); if(!response.ok) throw new Error(data.error||"Unable to submit your request.");
      (document.getElementById("consultation-form") as HTMLFormElement)?.reset();setMessage(data.message||"Your request has been received.");
    } catch(e){setError(e instanceof Error?e.message:"Please try again.");} finally{setBusy(false);}
  }
  return <form id="consultation-form" action={submit} className="space-y-5">
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Full name" name="name" required placeholder="Your name"/><Field label="Email address" name="email" type="email" required placeholder="you@example.com"/></div>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Phone / WhatsApp" name="phone" placeholder="+234..."/><Field label="Location" name="location" placeholder="Town, state, country"/></div>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Farm / organisation" name="organisation" placeholder="Optional"/><label className="block"><span className="field-label">Service required</span><select name="serviceSlug" defaultValue={defaultService} className="field"><option value="">Select a service</option>{["farm-planning-and-setup","crop-production-consultancy","soil-management-and-fertility","pest-and-disease-control","farm-inspection-and-audit","farm-management-support","farmer-training-and-extension","agribusiness-and-investment-advisory","market-linkage-and-value-chain","climate-smart-and-sustainable-agriculture","livestock-poultry-and-aquaculture","agricultural-project-support"].map(v=><option key={v} value={v}>{v.replaceAll("-"," ").replace(/\b\w/g,c=>c.toUpperCase())}</option>)}</select></label></div>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Farm size (if applicable)" name="farmSize" placeholder="e.g. 2 hectares"/><Field label="Crop / livestock enterprise" name="enterprise" placeholder="e.g. maize, poultry, catfish"/></div>
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Production stage" name="productionStage" placeholder="Planning, planting, growing..."/><label className="block"><span className="field-label">Preferred contact</span><select name="preferredContact" className="field"><option value="email">Email</option><option value="phone">Phone call</option><option value="whatsapp">WhatsApp</option></select></label></div>
    <label className="block"><span className="field-label">Budget range (optional)</span><input name="budgetRange" className="field" placeholder="Your approximate budget"/></label>
    <label className="block"><span className="field-label">Tell us about your goals or challenge</span><textarea name="message" required minLength={10} rows={5} className="field resize-y" placeholder="Describe the farm, project or support you need..."/></label>
    <div className="hidden" aria-hidden="true"><label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
    {error&&<p role="alert" className="text-sm text-red-700">{error}</p>}{message&&<p role="status" className="rounded-xl bg-[#edf6e9] p-4 text-sm font-semibold text-[#1b5e20]">{message}</p>}
    <button disabled={busy} className="btn btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">{busy?<><LoaderCircle className="animate-spin" size={18}/> Sending…</>:<>Submit consultation request <ArrowUpRight size={18}/></>}</button>
    <p className="text-xs leading-6 text-[#829082]">Your details are used to respond to this enquiry. Please do not include passwords, payment-card details or other sensitive information.</p>
  </form>;
}
function Field({label,name,type="text",required=false,placeholder=""}:{label:string;name:string;type?:string;required?:boolean;placeholder?:string}){return <label className="block"><span className="field-label">{label}</span><input name={name} type={type} required={required} placeholder={placeholder} className="field"/></label>}
