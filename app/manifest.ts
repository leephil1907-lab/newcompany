import type { MetadataRoute } from "next";
export default function manifest():MetadataRoute.Manifest{return {name:"AgroBridge Consult",short_name:"AgroBridge",description:"Connecting Farmers to Smarter Growth.",start_url:"/",display:"standalone",background_color:"#F7F8F5",theme_color:"#1B5E20",icons:[{src:"/icon.svg",sizes:"any",type:"image/svg+xml",purpose:"any"}]};}
