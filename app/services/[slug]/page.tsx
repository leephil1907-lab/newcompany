import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, CheckCircle2 } from "lucide-react";
import { services } from "@/lib/services";

type Props = { params: Promise<{ slug: string }> };
export function generateStaticParams() { return services.map(service => ({ slug: service.slug })); }
export async function generateMetadata({ params }: Props): Promise<Metadata> { const { slug } = await params; const service = services.find(item => item.slug === slug); return { title: service?.title ?? "Service", description: service?.description }; }

export default async function ServiceDetailPage({ params }: Props) {
  const { slug } = await params;
  const service = services.find(item => item.slug === slug);
  if (!service) notFound();
  const Icon = service.icon;
  return <><section className="bg-[#153b1d] py-20 text-white md:py-28"><div className="container"><Link href="/services" className="mb-10 inline-flex items-center gap-2 text-sm text-white/70 hover:text-white"><ArrowLeft size={16}/> All services</Link><span className="eyebrow !text-[#c6e8a8]">AgroBridge Consult services</span><div className="mt-6 flex max-w-4xl items-start gap-5"><span className="hidden h-16 w-16 shrink-0 place-items-center rounded-2xl bg-white/10 text-[#c6e8a8] sm:grid"><Icon size={31}/></span><div><h1 className="text-4xl font-semibold leading-tight tracking-[-.045em] md:text-6xl">{service.title}</h1><p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">{service.intro}</p></div></div><Link href={"/contact?service="+service.slug} className="btn mt-9 bg-[#b8df8e] text-[#153d1c]">{service.cta} <ArrowUpRight size={18}/></Link></div></section><section className="section"><div className="container grid gap-12 lg:grid-cols-[1.1fr_.9fr]"><div><span className="eyebrow">How we can support you</span><h2 className="section-title">A practical approach shaped around your farm and goals.</h2><p className="section-copy">{service.description}</p><p className="mt-5 max-w-2xl text-base leading-8 text-[#68756a]">The exact scope depends on your location, production system, current challenges and desired outcomes. We begin by understanding your situation before recommending an appropriate engagement.</p></div><div className="card p-7 md:p-9"><h2 className="text-2xl font-bold tracking-tight">Typical areas of support</h2><ul className="mt-7 space-y-4">{service.includes.map(item=><li key={item} className="flex gap-3 text-sm leading-6 text-[#435347]"><CheckCircle2 size={18} className="mt-0.5 shrink-0 text-[#4caf50]"/>{item}</li>)}</ul><Link href={"/contact?service="+service.slug} className="btn btn-primary mt-8 w-full">{service.cta} <ArrowUpRight size={17}/></Link></div></div></section><section className="bg-[#eaf1e6] py-16"><div className="container flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><h2 className="text-2xl font-bold">Let’s discuss what your project needs.</h2><p className="mt-2 text-sm text-[#68756a]">Share a few details and we’ll guide you on the next step.</p></div><Link href="/contact" className="btn btn-primary">Request a consultation <ArrowUpRight size={17}/></Link></div></section></>;
}
