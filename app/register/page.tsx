import { AuthForm } from "@/components/auth-form";
import { Sprout } from "lucide-react";
export const metadata={title:"Create a Client Account"};
export default function RegisterPage(){return <section className="grid min-h-[75vh] place-items-center px-5 py-16"><div className="card w-full max-w-md p-7 md:p-9"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eaf1e6] text-[#1b5e20]"><Sprout/></span><span className="eyebrow mt-6">AgroBridge workspace</span><h1 className="mt-3 text-3xl font-bold tracking-tight">Create your account.</h1><p className="mb-8 mt-2 text-sm leading-6 text-[#68756a]">Keep your agricultural enquiries, planning briefs and crop-health cases together.</p><AuthForm mode="register"/></div></section>}
