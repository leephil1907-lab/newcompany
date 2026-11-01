import Link from "next/link";
import { Sprout, ArrowUpRight, Mail, MapPin } from "lucide-react";

const groups = [
  { title: "Services", links: [{ label: "Farm Planning", href: "/services/farm-planning-and-setup" }, { label: "Crop Production", href: "/services/crop-production-consultancy" }, { label: "Soil Management", href: "/services/soil-management-and-fertility" }, { label: "Farmer Training", href: "/services/farmer-training-and-extension" }, { label: "Agribusiness Advisory", href: "/services/agribusiness-and-investment-advisory" }] },
  { title: "Company", links: [{ label: "About Us", href: "/about" }, { label: "Projects", href: "/projects" }, { label: "Insights", href: "/insights" }, { label: "Contact", href: "/contact" }] },
  { title: "Get in touch", links: [{ label: "Contact Us", href: "/contact" }, { label: "Book a Consultation", href: "/contact" }, { label: "All Services", href: "/services" }, { label: "Project Partnerships", href: "/projects" }] }
];

export function SiteFooter() {
  return <footer className="bg-[#102d17] text-white">
    <div className="container py-16">
      <div className="mb-14 flex flex-col justify-between gap-8 rounded-[28px] bg-[#1b5e20] p-8 md:flex-row md:items-center md:p-10">
        <div><span className="text-xs font-bold uppercase tracking-[.18em] text-[#c6e8a8]">Let's grow together</span><h2 className="mt-3 max-w-xl text-3xl font-semibold leading-tight tracking-tight md:text-4xl">Build a more productive agricultural future.</h2><p className="mt-3 max-w-lg text-sm leading-7 text-white/75">Tell us what you are planning, growing or working to improve.</p></div>
        <Link href="/contact" className="btn shrink-0 bg-white text-[#1b5e20]">Book a Consultation <ArrowUpRight size={17}/></Link>
      </div>
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div><Link href="/" className="inline-flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10"><Sprout size={23}/></span><span><strong className="block text-lg">AgroBridge</strong><small className="text-[10px] uppercase tracking-[.22em] text-[#b5c9b5]">Consult</small></span></Link><p className="mt-5 max-w-xs text-sm leading-7 text-[#c2d0c2]">Agricultural consultancy connecting farmers, land, markets and expertise for smarter growth.</p><p className="mt-5 flex items-center gap-2 text-sm text-[#c2d0c2]"><MapPin size={15}/> Lagos, Nigeria</p><a href="mailto:hello@agrobridgeconsult.com" className="mt-2 flex items-center gap-2 text-sm text-[#c2d0c2] hover:text-white"><Mail size={15}/> hello@agrobridgeconsult.com</a></div>
        {groups.map(group => <div key={group.title}><h3 className="mb-5 text-sm font-bold">{group.title}</h3><ul className="space-y-3">{group.links.map(link => <li key={link.href}><Link className="text-sm text-[#c2d0c2] transition hover:text-white" href={link.href}>{link.label}</Link></li>)}</ul></div>)}
      </div>
      <div className="mt-14 flex flex-col justify-between gap-3 border-t border-white/15 pt-6 text-xs text-[#b5c9b5] md:flex-row"><span>© {new Date().getFullYear()} AgroBridge Consult. All rights reserved.</span><span>Connecting Farmers to Smarter Growth.</span></div>
    </div>
  </footer>;
}
