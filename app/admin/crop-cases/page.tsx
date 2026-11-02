import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { AdminCropCaseManager } from "@/components/admin-crop-case-manager";
export const dynamic="force-dynamic";
export default async function AdminCropCasesPage(){const user=await getSession();if(!user)redirect("/login");if(user.role!=="admin"&&user.role!=="consultant")redirect("/workspace");return <section className="section"><div className="container"><Link href="/admin" className="text-sm font-bold text-[#1b5e20]">← Dashboard</Link><h1 className="mt-4 text-3xl font-bold">Crop-health case review</h1><p className="mt-2 mb-8 text-sm text-[#68756a]">Review submitted symptoms and images, add expert notes and notify clients when a review is ready.</p><AdminCropCaseManager/></div></section>}
