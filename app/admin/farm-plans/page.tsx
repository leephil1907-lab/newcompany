import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { AdminFarmPlanManager } from "@/components/admin-farm-plan-manager";
export const dynamic="force-dynamic";
export default async function AdminFarmPlansPage(){const user=await getSession();if(!user)redirect("/login");if(user.role!=="admin"&&user.role!=="consultant")redirect("/workspace");return <section className="section"><div className="container"><Link href="/admin" className="text-sm font-bold text-[#1b5e20]">← Dashboard</Link><h1 className="mt-4 text-3xl font-bold">Farm planning briefs</h1><p className="mt-2 mb-8 text-sm text-[#68756a]">Review farm location, land, water, enterprise and market information before scoping a professional plan.</p><AdminFarmPlanManager/></div></section>}
