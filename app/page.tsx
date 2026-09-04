"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, ChevronRight, Clapperboard, Image as ImageIcon, Menu, MessageCircle, Sparkles, WandSparkles, X } from "lucide-react";

const ideas=["Cinematic cyberpunk city in rain","Luxury sneaker campaign, studio lighting","Anime hero portrait, electric blue energy"];

export default function Home(){
 const [menu,setMenu]=useState(false); const [prompt,setPrompt]=useState(""); const [mode,setMode]=useState<"image"|"video">("image");
 const open=()=>{window.location.href=`/create?mode=${mode}${prompt?`&prompt=${encodeURIComponent(prompt)}`:""}`};
 return <main className="cx-app">
  <header className="cx-topbar">
   <Link href="/" className="cx-brand"><img src="/createx-logo.svg" alt="CreateX AI"/><span>CreateX <b>AI</b></span></Link>
   <nav className="cx-nav"><Link href="/create">Create</Link><Link href="/chat">Chat</Link><Link href="/creations">Creations</Link><Link href="/developer">Developer</Link></nav>
   <div className="cx-actions"><Link href="/auth?mode=signin" className="cx-ghost">Login</Link><Link href="/auth?mode=signup" className="cx-button">Sign up <ArrowUpRight size={14}/></Link></div>
   <button className="cx-menu" onClick={()=>setMenu(!menu)} aria-label="Menu">{menu?<X size={18}/>:<Menu size={18}/>}</button>
  </header>
  {menu&&<div className="cx-mobile-menu"><Link onClick={()=>setMenu(false)} href="/create">Create</Link><Link onClick={()=>setMenu(false)} href="/chat">AI Chat</Link><Link onClick={()=>setMenu(false)} href="/creations">Creations</Link><Link onClick={()=>setMenu(false)} href="/developer">Developer</Link><Link onClick={()=>setMenu(false)} href="/auth?mode=signin">Login</Link><Link onClick={()=>setMenu(false)} href="/auth?mode=signup">Sign up</Link></div>}

  <section className="cx-hero">
   <div className="cx-hero-copy">
    <div className="cx-live"><i/> AI CREATIVE WORKSPACE</div>
    <h1>Turn ideas<br/><span>into reality.</span></h1>
    <p>Create images, videos, code and conversations in one calm, focused workspace. Built to feel simple on mobile and powerful on desktop.</p>
    <div className="cx-hero-buttons"><Link href="/create" className="cx-main-button"><Sparkles size={16}/> Start creating <ArrowUpRight size={15}/></Link><Link href="/chat" className="cx-outline-button"><MessageCircle size={16}/> Open AI chat</Link></div>
    <div className="cx-trust"><span>10 images / day</span><span>10 videos / day</span><span>Unlimited chat</span></div>
   </div>

   <div className="cx-composer-wrap">
    <div className="cx-composer">
      <div className="cx-composer-head"><div className="cx-window-dots"><i/><i/><i/></div><span>CREATEX STUDIO</span><span className="cx-status">READY</span></div>
      <div className="cx-preview-art"><div className="cx-preview-grid"/><div className="cx-preview-center"><div className="cx-orbit"><Sparkles size={20}/></div><strong>{mode==="image"?"Create an image":"Create a video"}</strong><small>Your prompt becomes the starting point.</small></div></div>
      <div className="cx-prompt-box">
       <div className="cx-mode-tabs"><button className={mode==="image"?"active":""} onClick={()=>setMode("image")}><ImageIcon size={14}/> Image</button><button className={mode==="video"?"active":""} onClick={()=>setMode("video")}><Clapperboard size={14}/> Video</button></div>
       <textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Describe what you want to create…" onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();open()}}}/>
       <div className="cx-suggestions">{ideas.map(x=><button key={x} onClick={()=>setPrompt(x)}>{x}</button>)}</div>
       <button className="cx-generate" onClick={open}><WandSparkles size={15}/> Generate <ChevronRight size={15}/></button>
      </div>
    </div>
   </div>
  </section>

  <section className="cx-workspace-section"><div className="cx-section-head"><div><span>WORKSPACE</span><h2>One place for<br/><em>everything.</em></h2></div><Link href="/create">Open studio <ArrowUpRight size={14}/></Link></div><div className="cx-tool-grid">
   <Link href="/create" className="cx-tool"><div className="cx-tool-top"><div className="cx-tool-icon"><WandSparkles size={18}/></div><small>01</small></div><h3>Create</h3><p>Generate images and videos with a focused, distraction-free studio.</p><div className="cx-tool-foot"><span>10 + 10 daily</span><ArrowUpRight size={14}/></div></Link>
   <Link href="/chat" className="cx-tool"><div className="cx-tool-top"><div className="cx-tool-icon"><MessageCircle size={18}/></div><small>02</small></div><h3>Chat</h3><p>Think, analyze, code, work with files and keep conversations together.</p><div className="cx-tool-foot"><span>Unlimited</span><ArrowUpRight size={14}/></div></Link>
   <Link href="/creations" className="cx-tool"><div className="cx-tool-top"><div className="cx-tool-icon"><ImageIcon size={18}/></div><small>03</small></div><h3>Creations</h3><p>Keep your generated work organized in your private gallery.</p><div className="cx-tool-foot"><span>Private gallery</span><ArrowUpRight size={14}/></div></Link>
  </div></section>

  <section className="cx-developer-section"><div className="cx-dev-card"><div className="cx-dev-image"><img src="/developer-logo.svg" alt="Somesh Koli developer logo"/></div><div className="cx-dev-copy"><span>BUILT BY</span><h2>Somesh Koli</h2><p>Developer &amp; Creator behind CreateX AI.</p><div className="cx-dev-links"><a href="https://instagram.com/offx.somesh" target="_blank" rel="noreferrer">@offx.somesh</a><a href="https://instagram.com/developer.somesh" target="_blank" rel="noreferrer">@developer.somesh</a><a href="mailto:someshkoli442288@gmail.com">Email</a></div></div><Link href="/developer" className="cx-dev-arrow"><ArrowUpRight size={19}/></Link></div></section>
  <footer className="cx-footer"><div><img src="/createx-logo.svg" alt=""/><span>CreateX AI</span></div><span>© 2026 · Create. Imagine. Generate.</span><div><Link href="/auth">Login / Signup</Link><Link href="/developer">Developer</Link></div></footer>
 </main>
}