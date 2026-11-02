import { AuthForm } from "@/components/auth-form";
import { Sprout } from "lucide-react";
export const metadata={title:"Client Sign In"};
export default function LoginPage(){return <section className="grid min-h-[75vh] place-items-center px-5 py-16"><div className="card w-full max-w-md p-7 md:p-9"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eaf1e6] text-[#1b5e20]"><Sprout/></span><span className="eyebrow mt-6">AgroBridge workspace</span><h1 className="mt-3 text-3xl font-bold tracking-tight">Welcome back.</h1><p className="mb-8 mt-2 text-sm leading-6 text-[#68756a]">Sign in to follow your consultation requests, farm plans and crop-health cases.</p><AuthForm mode="login"/></div></section>}
