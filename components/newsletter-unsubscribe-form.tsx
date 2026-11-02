"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
export function NewsletterUnsubscribeForm({token}:{token:string}){const [busy,setBusy]=useState(false);const [error,setError]=useState("");const router=useRouter();async function submit(){setBusy(true);setError("");try{const r=await fetch("/api/newsletter/unsubscribe",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token})});const d=await r.json();if(!r.ok)throw new Error(d.error);router.push("/newsletter/confirmed?status=unsubscribed");}catch(e){setError(e instanceof Error?e.message:"Unable to process this request.");}finally{setBusy(false);}}return <div><button onClick={submit} disabled={busy} className="btn btn-primary">{busy?<LoaderCircle className="animate-spin"/>:"Confirm unsubscribe"}</button>{error&&<p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}</div>}
