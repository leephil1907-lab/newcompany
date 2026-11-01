import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, CheckCircle2, Sprout, Wheat, Droplets, GraduationCap, Bug, Tractor } from "lucide-react";
import { services } from "@/lib/services";
import { Reveal } from "@/components/reveal";

const highlights = [
  { icon: Sprout, title: "Farm Planning", text: "Build a practical foundation before production begins." },
  { icon: Wheat, title: "Crop Production", text: "Make informed decisions throughout the growing season." },
  { icon: Droplets, title: "Soil Management", text: "Improve soil health and use farm inputs wisely." },
  { icon: Bug, title: "Crop Health", text: "Identify risks early and plan responsible interventions." },
  { icon: Tractor, title: "Farm Management", text: "Organise operations, resources and farm records." },
  { icon: GraduationCap, title: "Farmer Training", text: "Turn useful agricultural knowledge into field practice." }
];

export default function HomePage() {
  return <>
    <Reveal><section className="relative isolate min-h-[690px] overflow-hidden bg-[#102d17] text-white">
      <Image src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2200&q=85" alt="Expansive green agricultural fields at sunrise" fill priority sizes="100vw" className="object-cover opacity-45"/>
      <div className="absolute inset-0 bg-gradient-to-r from-[#0c2814] via-[#12381dcc] to-[#153a1c55]"/>
      <div className="container relative flex min-h-[690px] items-center py-24">
        <div className="max-w-3xl">
          <span className="eyebrow !text-[#c6e8a8]">Agricultural expertise. Practical growth.</span>
          <h1 className="mt-7 text-5xl font-semibold leading-[1.04] tracking-[-.055em] sm:text-6xl lg:text-7xl">Connecting farmers to <span className="text-[#b8df8e]">smarter growth.</span></h1>
          <p className="mt-7 max-w-2xl text-lg leading-8 text-white/80">Expert agricultural consultancy for productive farms, sustainable food systems and stronger agribusinesses.</p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Link href="/contact" className="btn bg-[#b8df8e] text-[#153d1c]">Book a Free Consultation <ArrowUpRight size={18}/></Link><Link href="/services" className="btn border border-white/35 text-white hover:bg-white/10">Explore Our Services <ArrowRight size={17}/></Link></div>
          <div className="mt-14 flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/75"><span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#b8df8e]"/> Practical field-focused guidance</span><span className="flex items-center gap-2"><CheckCircle2 size={16} className="text-[#b8df8e]"/> Support from planning to market</span></div>
        </div>
      </div>
      <div className="absolute bottom-0 right-0 hidden h-40 w-40 translate-x-1/3 translate-y-1/3 rounded-full border border-white/15 lg:block"/>
    </section></Reveal>

    <Reveal><section className="border-b border-[#e5eae2] bg-white py-7"><div className="container grid gap-5 text-center sm:grid-cols-3 sm:text-left"><div><p className="text-sm font-bold text-[#1b5e20]">For farmers</p><p className="mt-1 text-sm text-[#68756a]">Practical support for everyday production decisions.</p></div><div><p className="text-sm font-bold text-[#1b5e20]">For agribusinesses</p><p className="mt-1 text-sm text-[#68756a]">Planning and advisory for stronger farm businesses.</p></div><div><p className="text-sm font-bold text-[#1b5e20]">For institutions</p><p className="mt-1 text-sm text-[#68756a]">Training and project support for agricultural programmes.</p></div></div></section></Reveal>

    <Reveal><section className="section"><div className="container"><div className="max-w-2xl"><span className="eyebrow">What we do</span><h2 className="section-title">Practical agricultural consultancy for smarter, more profitable farming.</h2><p className="section-copy">From farm setup to harvest, training and market access, we help clients make informed decisions across the agricultural value chain.</p></div><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{highlights.map(item => <div key={item.title} className="card group p-7 transition duration-300 hover:-translate-y-1 hover:shadow-xl"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#edf6e9] text-[#1b5e20] transition group-hover:bg-[#1b5e20] group-hover:text-white"><item.icon size={23}/></span><h3 className="mt-6 text-xl font-bold tracking-tight">{item.title}</h3><p className="mt-2 text-sm leading-7 text-[#68756a]">{item.text}</p></div>)}</div><div className="mt-9"><Link href="/services" className="inline-flex items-center gap-2 font-bold text-[#1b5e20]">View all 12 services <ArrowRight size={17}/></Link></div></div></section></Reveal>

    <Reveal><section className="bg-[#eaf1e6] py-20"><div className="container grid items-center gap-12 lg:grid-cols-[.95fr_1.05fr]"><div><span className="eyebrow">How we work</span><h2 className="section-title">Clear advice. Practical action. Better-informed decisions.</h2><p className="section-copy">Every engagement starts by understanding your farm, your goals and the conditions you are working with. We then agree on the right scope of support.</p><Link href="/about" className="btn btn-primary mt-7">Discover our approach <ArrowUpRight size={17}/></Link></div><div className="grid gap-3 sm:grid-cols-2">{["Understand your goals","Assess the situation","Agree on a practical plan","Support and review progress"].map((step,i)=><div key={step} className="rounded-2xl border border-[#dce7d7] bg-white p-6"><span className="text-xs font-extrabold tracking-[.15em] text-[#4caf50]">STEP 0{i+1}</span><h3 className="mt-4 text-lg font-bold">{step}</h3></div>)}</div></div></section></Reveal>

    <Reveal><section className="section"><div className="container"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><span className="eyebrow">Our services</span><h2 className="section-title">Support for every stage of your agricultural journey.</h2></div><Link href="/services" className="font-bold text-[#1b5e20]">Explore the full catalogue ↗</Link></div><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{services.slice(0,6).map(service=><Link key={service.slug} href={"/services/"+service.slug} className="card group p-6 transition hover:-translate-y-1 hover:shadow-xl"><div className="flex items-start justify-between"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#edf6e9] text-[#1b5e20]"><service.icon size={21}/></span><ArrowUpRight size={19} className="text-[#8b9a8a] transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#1b5e20]"/></div><h3 className="mt-5 text-lg font-bold">{service.title}</h3><p className="mt-2 text-sm leading-7 text-[#68756a]">{service.intro}</p></Link>)}</div></div></section></Reveal>

    <Reveal><section className="bg-[#153b1d] py-20 text-white"><div className="container flex flex-col items-start justify-between gap-8 md:flex-row md:items-center"><div><span className="text-xs font-bold uppercase tracking-[.18em] text-[#b8df8e]">Your next step starts here</span><h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight md:text-4xl">Tell us what you want to grow. We’ll help you plan the next move.</h2></div><Link href="/contact" className="btn bg-[#b8df8e] text-[#153d1c]">Talk to AgroBridge <ArrowUpRight size={18}/></Link></div></section></Reveal>
  </>;
}
