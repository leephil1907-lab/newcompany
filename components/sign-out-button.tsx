"use client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
export function SignOutButton(){const router=useRouter();async function logout(){await fetch("/api/auth/logout",{method:"POST"});router.push("/");router.refresh();}return <button onClick={logout} className="inline-flex items-center gap-2 text-sm font-bold text-[#1b5e20]"><LogOut size={16}/> Sign out</button>}
