import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { AdminAppointmentManager } from "@/components/admin-appointment-manager";
export const dynamic="force-dynamic";
export default async function AdminAppointmentsPage(){const user=await getSession();if(!user)redirect("/login");if(user.role!=="admin"&&user.role!=="consultant")redirect("/workspace");return <section className="section"><div className="container"><Link href="/admin" className="text-sm font-bold text-[#1b5e20]">← Dashboard</Link><h1 className="mt-4 text-3xl font-bold">Consultation appointments</h1><p className="mb-8 mt-2 text-sm text-[#68756a]">Review requested dates, confirm a suitable time and send confirmation emails. Requests are not bookings until confirmed by staff.</p><AdminAppointmentManager/></div></section>}
