import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { AdminUserManager } from "@/components/admin-user-manager";
export const dynamic="force-dynamic";
export default async function AdminUsersPage(){const user=await getSession();if(!user)redirect("/login");if(user.role!=="admin")redirect("/workspace");return <section className="section"><div className="container"><Link href="/admin" className="text-sm font-bold text-[#1b5e20]">← Dashboard</Link><h1 className="mt-4 text-3xl font-bold">User and access management</h1><p className="mb-8 mt-2 text-sm text-[#68756a]">Review client accounts and manage staff roles. Only administrators can change account access.</p><AdminUserManager/></div></section>}
