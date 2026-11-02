"use client";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCcw, Sprout } from "lucide-react";

// Shown when a page fails to render. The site header and footer stay in place.
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <section className="grid min-h-[65vh] place-items-center px-6 py-20 text-center"><div className="max-w-lg"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#eaf1e6] text-[#1b5e20]"><Sprout size={30}/></span><p className="mt-7 text-xs font-bold uppercase tracking-[.2em] text-[#4caf50]">Something went wrong</p><h1 className="mt-3 text-4xl font-bold tracking-tight">We couldn’t load this page.</h1><p className="mt-4 text-sm leading-7 text-[#68756a]">This is usually temporary. Please try again — if the problem continues, contact us at <a className="font-semibold text-[#1b5e20]" href="mailto:hello@agrobridgeconsult.com">hello@agrobridgeconsult.com</a>{error.digest ? <> and quote reference <span className="font-mono text-xs">{error.digest}</span></> : null}.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><button type="button" onClick={reset} className="btn btn-primary"><RotateCcw size={17}/> Try again</button><Link href="/" className="btn btn-light border border-[#dce5d9]"><ArrowLeft size={17}/> Back to home</Link></div></div></section>;
}
