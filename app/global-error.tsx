"use client";
import { useEffect } from "react";
import "./globals.css";

// Last-resort error screen for failures in the root layout itself. It replaces the whole document,
// so it renders its own <html> and <body> and avoids depending on other components. "Back to home" does a
// full page load because client-side navigation would reuse the layout that just failed.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return <html lang="en"><body><main className="grid min-h-screen place-items-center px-6 py-20 text-center"><div className="max-w-lg"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#4caf50]">AgroBridge Consult</p><h1 className="mt-3 text-4xl font-bold tracking-tight">Something went wrong.</h1><p className="mt-4 text-sm leading-7 text-[#68756a]">Please try again. If the problem continues, email <a className="font-semibold text-[#1b5e20]" href="mailto:hello@agrobridgeconsult.com">hello@agrobridgeconsult.com</a>{error.digest ? <> and quote reference <span className="font-mono text-xs">{error.digest}</span></> : null}.</p><div className="mt-7 flex flex-wrap justify-center gap-3"><button type="button" onClick={reset} className="btn btn-primary">Try again</button><button type="button" onClick={() => window.location.assign("/")} className="btn btn-light border border-[#dce5d9]">Back to home</button></div></div></main></body></html>;
}
