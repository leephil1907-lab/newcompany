import type { MetadataRoute } from "next";
import { services } from "@/lib/services";
import { getDb } from "@/lib/db";
export const dynamic="force-dynamic";
export default async function sitemap():Promise<MetadataRoute.Sitemap>{
 const base="https://agrobridgeconsult.com";
 const pages=["","/about","/services","/projects","/insights","/academy","/programmes","/contact","/book-consultation","/farm-planner","/crop-health","/pricing","/faq"];
 const urls:MetadataRoute.Sitemap=pages.map(path=>({url:base+path,lastModified:new Date(),changeFrequency:"monthly" as const,priority:path===""?1:0.7}));
 urls.push(...services.map(service=>({url:base+"/services/"+service.slug,lastModified:new Date(),changeFrequency:"monthly" as const,priority:0.65})));
 try{
  const sql=getDb();
  const [projects,articles,courses,programmes]=await Promise.all([
   sql`SELECT slug,updated_at FROM projects WHERE published=true`,
   sql`SELECT slug,updated_at FROM articles WHERE published=true`,
   sql`SELECT slug,updated_at FROM courses WHERE published=true`,
   sql`SELECT slug,updated_at FROM training_programs WHERE status='published' AND start_date>=CURRENT_DATE`
  ]);
  urls.push(...projects.map(x=>({url:base+"/projects/"+x.slug,lastModified:new Date(x.updated_at),changeFrequency:"monthly" as const,priority:0.6})));
  urls.push(...articles.map(x=>({url:base+"/insights/"+x.slug,lastModified:new Date(x.updated_at),changeFrequency:"weekly" as const,priority:0.65})));
  urls.push(...courses.map(x=>({url:base+"/academy/"+x.slug,lastModified:new Date(x.updated_at),changeFrequency:"monthly" as const,priority:0.55})));
 }catch{}
 return urls;
}
