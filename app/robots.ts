import type { MetadataRoute } from "next";
export default function robots(): MetadataRoute.Robots {
 return { rules: { userAgent:"*",allow:"/",disallow:["/admin/","/workspace","/api/","/login","/register","/forgot-password","/reset-password"] }, sitemap:"https://agrobridgeconsult.com/sitemap.xml" };
}
