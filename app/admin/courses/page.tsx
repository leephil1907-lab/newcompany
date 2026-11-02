import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { AdminContentForms } from "@/components/admin-content-forms";
export const dynamic="force-dynamic";
export default async function AdminCoursesPage(){const user=await getSession();if(!user)redirect("/login");if(user.role!=="admin"&&user.role!=="consultant")redirect("/workspace");return <section className="section"><div className="container"><Link href="/admin" className="text-sm font-bold text-[#1b5e20]">← Dashboard</Link><h1 className="mt-4 text-3xl font-bold">Academy course publishing</h1><p className="mb-8 mt-2 text-sm text-[#68756a]">Create course catalogue entries. Add lesson content through the database until the lesson editor is enabled.</p><AdminContentForms kind="course"/></div></section>}
