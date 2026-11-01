import type { MetadataRoute } from "next";
import { services } from "@/lib/services";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://agrobridgeconsult.com";
  const pages = ["", "/about", "/services", "/projects", "/insights", "/contact"];
  return [
    ...pages.map(path => ({ url: base + path, lastModified: new Date(), changeFrequency: "monthly" as const, priority: path === "" ? 1 : 0.7 })),
    ...services.map(service => ({ url: base + "/services/" + service.slug, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.65 }))
  ];
}
