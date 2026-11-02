"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronDown, Sprout, UserRound } from "lucide-react";

const links = [{ href: "/", label: "Home" }, { href: "/about", label: "About" }, { href: "/services", label: "Services", children: [{ href: "/services", label: "All Services" }, { href: "/services/farm-planning-and-setup", label: "Farm Planning" }, { href: "/services/crop-production-consultancy", label: "Crop Production" }, { href: "/services/soil-management-and-fertility", label: "Soil Management" }, { href: "/services/pest-and-disease-control", label: "Pest & Disease Support" }, { href: "/services/farmer-training-and-extension", label: "Farmer Training" }] }, { href: "/projects", label: "Projects" }, { href: "/insights", label: "Insights" }, { href: "/academy", label: "Academy" }];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  return <header className="sticky top-0 z-50 border-b border-[#e5eae2]/80 bg-[#f7f8f5]/90 backdrop-blur-xl">
    <div className="container flex h-[76px] items-center justify-between gap-6">
      <Link href="/" className="flex items-center gap-3" aria-label="AgroBridge Consult home">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#1b5e20] text-white"><Sprout size={23}/></span>
        <span className="leading-tight"><strong className="block text-[17px] tracking-tight text-[#173d1b]">AgroBridge</strong><span className="text-[10px] font-bold uppercase tracking-[.22em] text-[#71806f]">Consult</span></span>
      </Link>
      <nav className="hidden items-center gap-7 lg:flex">
        {links.map(link => <div key={link.href + link.label} className="group relative">
          <Link href={link.href} className="flex items-center gap-1 py-5 text-sm font-semibold text-[#354638] transition hover:text-[#1b5e20]">{link.label}{link.children && <ChevronDown size={14}/>}</Link>
          {link.children && <div className="invisible absolute left-0 top-full w-56 translate-y-2 rounded-2xl border border-[#e5eae2] bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">{link.children.map(child => <Link key={child.href + child.label} href={child.href} className="block rounded-xl px-3 py-2.5 text-sm text-[#354638] hover:bg-[#f0f6ed] hover:text-[#1b5e20]">{child.label}</Link>)}</div>}
        </div>)}
      </nav>
      <div className="hidden items-center gap-3 lg:flex"><Link href="/login" aria-label="Client sign in" className="inline-flex items-center gap-2 text-sm font-semibold text-[#354638] hover:text-[#1b5e20]"><UserRound size={17}/> Sign in</Link><Link className="btn btn-primary !px-5 !py-3 text-sm" href="/book-consultation">Book a Consultation <span aria-hidden>↗</span></Link></div>
      <button className="grid h-11 w-11 place-items-center rounded-xl border border-[#dce5d9] text-[#1b5e20] lg:hidden" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"}>{open ? <X/> : <Menu/>}</button>
    </div>
    {open && <nav className="border-t border-[#e5eae2] bg-white px-5 py-4 lg:hidden">{links.map(link => <div key={link.href + link.label} className="border-b border-[#edf0eb]"><Link onClick={() => setOpen(false)} href={link.href} className="block py-3 font-semibold text-[#243d28]">{link.label}</Link>{link.children&&<div className="grid grid-cols-2 gap-2 pb-3 pl-3">{link.children.map(child=><Link key={child.href+child.label} onClick={()=>setOpen(false)} href={child.href} className="py-1 text-xs text-[#68756a]">{child.label}</Link>)}</div>}</div>)}<Link onClick={() => setOpen(false)} className="btn btn-primary mt-4 w-full" href="/book-consultation">Book a Consultation</Link><Link onClick={() => setOpen(false)} className="mt-3 flex items-center justify-center gap-2 py-2 text-sm font-semibold text-[#1b5e20]" href="/login"><UserRound size={16}/> Client sign in</Link></nav>}
  </header>;
}
