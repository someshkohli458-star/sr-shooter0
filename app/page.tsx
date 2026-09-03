"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, ChevronRight, Clapperboard, Image as ImageIcon, Menu, MessageCircle, Sparkles, WandSparkles, X, Zap } from "lucide-react";

const ideas=["A cinematic cyberpunk city in rain","Luxury sneaker campaign, studio lighting","Anime hero portrait, electric blue energy"];
const tools=[
 {title:"Create",desc:"Generate images and video from a single prompt.",icon:WandSparkles,href:"/create",tag:"10 images + 10 videos / day"},
 {title:"Chat",desc:"Think, analyze, code and work with files in one AI thread.",icon:MessageCircle,href:"/chat",tag:"Unlimited"},
 {title:"Creations",desc:"Keep your generated work organized in your private gallery.",icon:ImageIcon,href:"/creations",tag:"Private workspace"},
];

export default function Home(){
 const [menu,setMenu]=useState(false); const [prompt,setPrompt]=useState(""); const [mode,setMode]=useState<"image"|"video">("image");
 const open=()=>{window.location.href=`/create?mode=${mode}${prompt?`&prompt=${encodeURIComponent(prompt)}`:""}`};
 return <main className="cx-app min-h-screen bg-[#050507] text-white">
  <div className="cx-aurora"/><div className="cx-noise"/>
  <header className="cx-topbar">
   <Link href="/" className="cx-brand"><img src="/createx-logo.svg" alt="CreateX AI"/><span>CreateX <b>AI</b></span></Link>
   <nav className="cx-nav"><Link href="/create">Create</Link><Link href="/chat">Chat</Link><Link href="/creations">Creations</Link><Link href="/developer">Developer</Link></nav>
   <div className="cx-actions"><Link href="/auth?mode=signin" className="cx-ghost">Sign in</Link><Link href="/auth?mode=signup" className="cx-button">Get started <ArrowUpRight size={15}/></Link></div>
   <button className="cx-menu" onClick={()=>setMenu(!menu)} aria-label="Open menu">{menu?<X size={19}/>:<Menu size={19}/>}</button>
  </header>
  {menu&&<div className="cx-mobile-menu"><Link href="/create">Create</Link><Link href="/chat">AI Chat</Link><Link href="/creations">Creations</Link><Link href="/developer">Developer</Link><Link href="/auth?mode=signup">Get started</Link></div>}

  <section className="cx-hero">
   <div className="cx-hero-copy">
    <div className="cx-live"><i/> CREATE. IMAGINE. GENERATE.</div>
    <h1>Your ideas,<br/><span>made real.</span></h1>
    <p>One intelligent workspace for images, video, chat, code and files. No credits. No clutter. Just create.</p>
    <div className="cx-hero-buttons"><Link href="/create" className="cx-main-button"><Sparkles size={17}/> Start creating <ArrowUpRight size={16}/></Link><Link href="/chat" className="cx-outline-button"><MessageCircle size={17}/> Talk to AI</Link></div>
    <div className="cx-trust"><span><Zap size={13}/> Fast creative workspace</span><span>10 images/day</span><span>10 videos/day</span><span>∞ chat</span></div>
   </div>

   <div className="cx-composer-wrap">
    <div className="cx-composer-glow"/>
    <div className="cx-composer">
      <div className="cx-composer-head"><div className="cx-window-dots"><i/><i/><i/></div><span>CREATEX / STUDIO</span><span className="cx-status">READY</span></div>
      <div className="cx-preview-art"><div className="cx-preview-grid"/><div className="cx-preview-center"><div className="cx-orbit"><Sparkles size={24}/></div><strong>{mode==="image"?"Visual intelligence":"Motion intelligence"}</strong><small>Describe anything. Create something.</small></div><div className="cx-preview-corner">CX-01<br/><b>AI ENGINE</b></div></div>
      <div className="cx-prompt-box">
       <div className="cx-mode-tabs"><button className={mode==="image"?"active":""} onClick={()=>setMode("image")}><ImageIcon size={14}/> Image</button><button className={mode==="video"?"active":""} onClick={()=>setMode("video")}><Clapperboard size={14}/> Video</button></div>
       <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="What do you want to create?" onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();open()}}}/>
       <div className="cx-suggestions">{ideas.map(x=><button key={x} onClick={()=>setPrompt(x)}>{x}</button>)}</div>
       <button className="cx-generate" onClick={open}><WandSparkles size={16}/> Generate {mode}<ChevronRight size={16}/></button>
      </div>
    </div>
   </div>
  </section>

  <section className="cx-workspace-section"><div className="cx-section-head"><div><span>THE WORKSPACE</span><h2>Everything you need.<br/><em>Nothing you don&apos;t.</em></h2></div><Link href="/create">Open studio <ArrowUpRight size={15}/></Link></div><div className="cx-tool-grid">{tools.map(({title,desc,icon:Icon,href,tag},i)=><Link href={href} className="cx-tool" key={title}><div className="cx-tool-top"><div className="cx-tool-icon"><Icon size={19}/></div><small>0{i+1}</small></div><h3>{title}</h3><p>{desc}</p><div className="cx-tool-foot"><span>{tag}</span><ArrowUpRight size={15}/></div></Link>)}</div></section>

  <section className="cx-developer-section"><div className="cx-dev-card"><div className="cx-dev-image"><img src="/developer-logo.svg" alt="Somesh Koli developer logo"/></div><div className="cx-dev-copy"><span>BUILT BY</span><h2>Somesh Koli</h2><p>Developer &amp; Creator behind CreateX AI.</p><div className="cx-dev-links"><a href="https://instagram.com/offx.somesh" target="_blank" rel="noreferrer">@offx.somesh</a><a href="https://instagram.com/developer.somesh" target="_blank" rel="noreferrer">@developer.somesh</a><a href="mailto:someshkoli442288@gmail.com">Email</a></div></div><Link href="/developer" className="cx-dev-arrow"><ArrowUpRight size={20}/></Link></div></section>

  <footer className="cx-footer"><div><img src="/createx-logo.svg" alt=""/> <span>CreateX AI</span></div><span>© 2026 · Create. Imagine. Generate.</span><div><Link href="/auth">Login / Signup</Link><Link href="/developer">Developer</Link></div></footer>
 </main>
}