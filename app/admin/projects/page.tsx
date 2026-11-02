import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { AdminContentForms } from "@/components/admin-content-forms";
export const dynamic="force-dynamic";
export default async function AdminProjectsPage(){const user=await getSession();if(!user)redirect("/login");if(user.role!=="admin"&&user.role!=="consultant")redirect("/workspace");return <section className="section"><div className="container"><Link href="/admin" className="text-sm font-bold text-[#1b5e20]">← Dashboard</Link><h1 className="mt-4 text-3xl font-bold">Projects and case studies</h1><p className="mb-8 mt-2 text-sm text-[#68756a]">Publish only completed work with client permission. Do not enter invented outcomes or testimonials.</p><AdminContentForms kind="project"/></div></section>}
