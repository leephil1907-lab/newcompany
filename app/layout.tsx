import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { FarmAssistant } from "@/components/farm-assistant";

export const metadata: Metadata = {
  metadataBase: new URL("https://agrobridgeconsult.com"),
  title: { default: "AgroBridge Consult | Connecting Farmers to Smarter Growth", template: "%s | AgroBridge Consult" },
  description: "Practical agricultural consultancy for farm planning, crop production, soil management, farmer training and agribusiness development.",
  openGraph: { title: "AgroBridge Consult", description: "Connecting Farmers to Smarter Growth.", type: "website" }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><SiteHeader/><main>{children}</main><SiteFooter/><FarmAssistant/></body></html>;
}
