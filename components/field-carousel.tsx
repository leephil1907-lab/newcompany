"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence,motion,useReducedMotion } from "framer-motion";
import { ArrowLeft,ArrowRight,Pause,Play } from "lucide-react";
const slides=[
 {title:"Farm planning and land preparation",copy:"Make early decisions about land, water, enterprise and farm layout.",image:"https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1500&q=82"},
 {title:"Crop production and field monitoring",copy:"Support healthier crops with planned production and regular observation.",image:"https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?auto=format&fit=crop&w=1500&q=82"},
 {title:"Soil health and fertility",copy:"Build a practical approach to soil testing, nutrient management and conservation.",image:"https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=1500&q=82"},
 {title:"Farmer training and demonstrations",copy:"Turn useful agricultural knowledge into skills farmers can apply.",image:"https://images.unsplash.com/photo-1592982537447-6f2a6a0a4a6a?auto=format&fit=crop&w=1500&q=82"},
 {title:"Irrigation and protected agriculture",copy:"Explore water-efficient production and appropriate growing systems.",image:"https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1500&q=82"}
];
export function FieldCarousel(){
 const [index,setIndex]=useState(0);const [paused,setPaused]=useState(false);const reduce=useReducedMotion();
 useEffect(()=>{if(paused||reduce)return;const id=window.setInterval(()=>setIndex(v=>(v+1)%slides.length),5500);return()=>window.clearInterval(id);},[paused,reduce]);
 const slide=slides[index];
 return <div className="overflow-hidden rounded-[28px] bg-[#102d17] text-white" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocus={()=>setPaused(true)} onBlur={()=>setPaused(false)}>
  <div className="grid min-h-[390px] md:grid-cols-[1.1fr_.9fr]">
   <div className="relative min-h-[260px] overflow-hidden"><AnimatePresence mode="wait"><motion.div key={slide.image} initial={{opacity:0,scale:1.04}} animate={{opacity:1,scale:1}} exit={{opacity:0}} transition={{duration:reduce?0:.65}} className="absolute inset-0"><Image src={slide.image} alt={slide.title} fill sizes="(max-width: 768px) 100vw, 55vw" className="object-cover"/></motion.div></AnimatePresence><div className="absolute inset-0 bg-gradient-to-t from-[#102d17]/35 to-transparent"/></div>
   <div className="flex flex-col justify-between p-7 md:p-10"><div><span className="text-xs font-bold uppercase tracking-[.18em] text-[#b8df8e]">Our work in the field · 0{index+1}/{slides.length}</span><AnimatePresence mode="wait"><motion.div key={slide.title} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:reduce?0:.3}}><h3 className="mt-5 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">{slide.title}</h3><p className="mt-4 text-sm leading-7 text-white/70">{slide.copy}</p></motion.div></AnimatePresence></div>
    <div className="mt-8 flex items-center justify-between"><div className="flex gap-2">{slides.map((s,i)=><button key={s.title} onClick={()=>setIndex(i)} aria-label={"Show slide "+(i+1)} aria-current={index===i} className={"h-2 rounded-full transition-all "+(index===i?"w-8 bg-[#b8df8e]":"w-2 bg-white/35")}/>)}</div><div className="flex gap-2"><button onClick={()=>setPaused(v=>!v)} aria-label={paused?"Play carousel":"Pause carousel"} className="grid h-10 w-10 place-items-center rounded-full border border-white/20">{paused?<Play size={16}/>:<Pause size={16}/>}</button><button onClick={()=>setIndex(v=>(v+slides.length-1)%slides.length)} aria-label="Previous slide" className="grid h-10 w-10 place-items-center rounded-full border border-white/20"><ArrowLeft size={17}/></button><button onClick={()=>setIndex(v=>(v+1)%slides.length)} aria-label="Next slide" className="grid h-10 w-10 place-items-center rounded-full bg-[#b8df8e] text-[#153b1d]"><ArrowRight size={17}/></button></div></div>
   </div>
  </div>
 </div>;
}
