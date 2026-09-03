"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight, Check, ChevronRight, Clapperboard, Image as ImageIcon,
  Menu, MessageCircle, Play, Sparkles, WandSparkles, X
} from "lucide-react";

const samples = [
  ["Neon Portrait", "Portrait · 9:16", "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=900&q=85"],
  ["Dream Landscape", "Landscape · 16:9", "https://images.unsplash.com/photo-1500534623283-312aade485b7?auto=format&fit=crop&w=1200&q=85"],
  ["Future Product", "Commercial · 1:1", "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=85"],
  ["Anime World", "Illustration · 4:3", "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1100&q=85"],
];

const quickIdeas = ["Cyberpunk city at midnight", "Luxury product campaign", "Anime hero portrait"];

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"image" | "video">("image");

  function generate() {
    if (prompt.trim()) window.location.href = `/create?mode=${mode}`;
    else document.getElementById("prompt")?.focus();
  }

  return (
    <main className="cx-home min-h-screen overflow-x-hidden bg-[#050507] text-white selection:bg-violet-400/30">
      <div className="cx-grid pointer-events-none fixed inset-0 -z-0" />
      <div className="cx-orb cx-orb-a pointer-events-none fixed -z-0" />
      <div className="cx-orb cx-orb-b pointer-events-none fixed -z-0" />

      <nav className="relative z-30 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="cx-logo-mark"><Sparkles size={18} /></div>
          <div>
            <div className="text-lg font-black tracking-tight">CreateX <span className="text-violet-300">AI</span></div>
            <div className="text-[8px] uppercase tracking-[.3em] text-white/35">Create · Imagine · Generate</div>
          </div>
        </Link>
        <div className="hidden items-center gap-8 text-sm text-white/45 md:flex">
          <a href="#studio" className="transition hover:text-white">Studio</a>
          <Link href="/chat" className="transition hover:text-white">AI Chat</Link>
          <a href="#explore" className="transition hover:text-white">Explore</a>
          <a href="#features" className="transition hover:text-white">Features</a>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <Link href="/chat" className="rounded-xl border border-white/10 bg-white/[.035] px-4 py-2 text-sm text-white/65 transition hover:bg-white/[.08] hover:text-white">Chat</Link>
          <Link href="/auth" className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black transition hover:-translate-y-0.5 hover:bg-white/90">Start free</Link>
        </div>
        <button aria-label="Menu" className="rounded-xl border border-white/10 bg-white/[.04] p-2 md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={20}/> : <Menu size={20}/>}</button>
      </nav>
      {mobileOpen && <div className="relative z-30 mx-4 rounded-2xl border border-white/10 bg-[#0d0d12]/95 p-4 shadow-2xl backdrop-blur-xl md:hidden"><div className="grid gap-4 text-sm text-white/70"><a href="#studio" onClick={()=>setMobileOpen(false)}>Studio</a><Link href="/chat">AI Chat</Link><a href="#explore" onClick={()=>setMobileOpen(false)}>Explore</a><a href="#features" onClick={()=>setMobileOpen(false)}>Features</a><Link href="/auth" className="font-bold text-white">Start free</Link></div></div>}

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-12 md:px-8 md:pb-24 md:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.02fr_.98fr]">
          <div className="animate-fade-up">
            <div className="cx-pill mb-7"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,.9)]"/> Free AI creative workspace <span className="text-white/20">/</span> No credits</div>
            <h1 className="max-w-4xl text-[3.35rem] font-black leading-[.91] tracking-[-.075em] sm:text-6xl md:text-[6.5rem]">Create what<br/><span className="cx-gradient-text">you imagine.</span></h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/45 md:text-lg">Images, video, conversation and file intelligence — brought together in one fast creative workspace.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/create" className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-black text-black shadow-[0_12px_50px_rgba(255,255,255,.08)] transition hover:-translate-y-0.5">Open Studio <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/></Link><Link href="/chat" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[.04] px-6 py-3.5 text-sm font-semibold text-white/75 transition hover:bg-white/[.08] hover:text-white"><MessageCircle size={16}/> Talk to AI</Link></div>
            <div className="mt-9 grid max-w-xl grid-cols-3 gap-2 text-center sm:text-left"><Stat value="10" label="images / day"/><Stat value="10" label="videos / day"/><Stat value="∞" label="AI chat"/></div>
          </div>

          <div className="relative mx-auto w-full max-w-xl animate-fade-up delay-1">
            <div className="cx-studio-window overflow-hidden rounded-[30px] border border-white/10 bg-[#0a0a0f]/90 shadow-[0_30px_100px_rgba(0,0,0,.5)] backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><div className="flex items-center gap-2 text-xs text-white/55"><span className="h-2 w-2 rounded-full bg-violet-400 shadow-[0_0_12px_rgba(139,92,246,.8)]"/> CreateX Studio</div><div className="flex gap-1.5"><span className="h-2 w-2 rounded-full bg-white/10"/><span className="h-2 w-2 rounded-full bg-white/10"/><span className="h-2 w-2 rounded-full bg-white/10"/></div></div>
              <div className="p-3">
                <div className="cx-preview relative overflow-hidden rounded-[23px] border border-white/10 p-5 sm:p-6"><div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_24%,rgba(236,72,153,.32),transparent_18%),radial-gradient(circle_at_20%_78%,rgba(34,211,238,.2),transparent_28%)]"/><div className="relative flex h-64 flex-col justify-between sm:h-72"><div className="flex items-center justify-between"><span className="rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[9px] uppercase tracking-[.2em] text-white/40">Live preview</span><span className="text-[9px] text-white/30">CX-01</span></div><div><div className="text-[10px] uppercase tracking-[.35em] text-white/30">Visual engine</div><div className="mt-2 max-w-sm text-2xl font-black tracking-tight sm:text-3xl">Ideas in.<br/><span className="text-white/55">Something real out.</span></div></div></div></div>
                <div className="mt-3 rounded-[23px] border border-white/10 bg-white/[.025] p-4"><div className="mb-3 flex gap-2"><ModeButton active={mode==="image"} onClick={()=>setMode("image")} icon={<ImageIcon size={13}/>} text="Image"/><ModeButton active={mode==="video"} onClick={()=>setMode("video")} icon={<Clapperboard size={13}/>} text="Video"/></div><textarea id="prompt" value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();generate()}}} placeholder="Describe your next idea..." className="min-h-[72px] w-full resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-white/20"/><div className="mt-3 flex flex-wrap gap-2">{quickIdeas.map(idea=><button key={idea} onClick={()=>setPrompt(idea)} className="rounded-full border border-white/10 px-2.5 py-1.5 text-[9px] text-white/35 transition hover:border-violet-400/20 hover:text-violet-200">{idea}</button>)}</div><button onClick={generate} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-4 py-3 text-sm font-black shadow-lg shadow-violet-950/30"><WandSparkles size={15}/> Generate {mode}</button></div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-white/10 bg-[#111117]/90 px-4 py-3 shadow-xl backdrop-blur-xl sm:block"><div className="flex items-center gap-2 text-[10px] text-white/45"><Check size={13} className="text-emerald-300"/> No subscription required</div></div>
          </div>
        </div>
      </section>

      <section id="studio" className="relative z-10 mx-auto max-w-7xl px-5 pb-24 md:px-8"><div className="mb-8 flex items-end justify-between gap-5"><div><p className="section-kicker">The workspace</p><h2 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Three modes. One flow.</h2></div><Link href="/create" className="hidden items-center gap-2 text-sm text-white/45 transition hover:text-white sm:flex">Enter studio <ArrowUpRight size={15}/></Link></div><div className="grid gap-4 md:grid-cols-3"><FeatureCard number="01" icon={<ImageIcon/>} title="Image Lab" text="Build portraits, worlds, products and concepts with flexible visual controls." href="/create"/><FeatureCard number="02" icon={<Play/>} title="Motion Lab" text="Turn descriptions into cinematic motion and save results to your private gallery." href="/create"/><FeatureCard number="03" icon={<MessageCircle/>} title="AI Workspace" text="Chat, analyze images, work with files and generate code in the same conversation." href="/chat"/></div></section>

      <section id="explore" className="relative z-10 mx-auto max-w-7xl px-5 pb-24 md:px-8"><div className="flex items-end justify-between"><div><p className="section-kicker cyan">Explore</p><h2 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">A different kind of AI studio.</h2></div><span className="hidden text-xs text-white/25 sm:block">Visual inspiration</span></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{samples.map(([title,sub,image],i)=><div key={title} className="group overflow-hidden rounded-[26px] border border-white/10 bg-white/[.025] transition duration-500 hover:-translate-y-1.5 hover:border-violet-400/25 hover:shadow-2xl hover:shadow-violet-950/20"><div className="relative aspect-[4/5] overflow-hidden bg-black"><img src={image} alt={title} loading="lazy" className="h-full w-full object-cover opacity-85 transition duration-700 group-hover:scale-105 group-hover:opacity-100"/><div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-white/5"/><div className="absolute left-3 top-3 rounded-full border border-white/15 bg-black/35 px-2 py-1 text-[8px] font-bold tracking-[.2em] text-white/50 backdrop-blur">0{i+1}</div><div className="absolute bottom-3 left-3 right-3 flex items-end justify-between"><div><div className="text-sm font-bold">{title}</div><div className="mt-1 text-[9px] text-white/35">{sub}</div></div><ArrowUpRight size={15} className="text-white/40"/></div></div></div>)}</div></section>

      <section id="features" className="relative z-10 mx-auto max-w-7xl px-5 pb-28 md:px-8"><div className="cx-cta overflow-hidden rounded-[34px] border border-white/10 p-7 md:p-14"><div className="grid items-end gap-10 md:grid-cols-[1fr_auto]"><div><p className="section-kicker">Made for creators</p><h2 className="mt-3 max-w-3xl text-4xl font-black tracking-[-.045em] md:text-6xl">Stop switching tools.<br/><span className="cx-gradient-text">Start creating.</span></h2><p className="mt-5 max-w-xl text-sm leading-6 text-white/40">Your free CreateX AI workspace keeps generation, conversation and your creations in one place.</p></div><div className="flex flex-wrap gap-3"><Link href="/chat" className="inline-flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-black text-black"><MessageCircle size={15}/> Open AI Chat</Link><Link href="/create" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-sm font-semibold text-white/70">Create now <ChevronRight size={15}/></Link></div></div></div></section>

      <footer className="relative z-10 border-t border-white/10 px-5 py-8 md:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-4 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between"><div>© 2026 CreateX AI · Create. Imagine. Generate.</div><div className="flex gap-5"><Link href="/developer" className="font-semibold text-violet-300 transition hover:text-white">Developer: Somesh Koli</Link><Link href="/chat" className="transition hover:text-white">AI Chat</Link></div></div></footer>
    </main>
  );
}

function Stat({value,label}:{value:string;label:string}){return <div className="rounded-2xl border border-white/10 bg-white/[.025] px-3 py-3"><div className="text-lg font-black text-white">{value}</div><div className="mt-0.5 text-[9px] uppercase tracking-[.16em] text-white/25">{label}</div></div>}
function ModeButton({active,onClick,icon,text}:{active:boolean;onClick:()=>void;icon:React.ReactNode;text:string}){return <button onClick={onClick} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[10px] font-bold transition ${active?"bg-white text-black":"bg-white/5 text-white/35 hover:text-white"}`}>{icon}{text}</button>}
function FeatureCard({number,icon,title,text,href}:{number:string;icon:React.ReactNode;title:string;text:string;href:string}){return <Link href={href} className="cx-card group rounded-[28px] border border-white/10 bg-white/[.025] p-6 transition duration-500 hover:-translate-y-1 hover:border-violet-400/25 hover:bg-white/[.04]"><div className="flex items-center justify-between"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-500/10 text-violet-200">{icon}</div><span className="text-[10px] tracking-[.2em] text-white/20">{number}</span></div><h3 className="mt-7 text-xl font-black">{title}</h3><p className="mt-2 text-sm leading-6 text-white/40">{text}</p><div className="mt-6 flex items-center gap-2 text-xs font-semibold text-white/30 transition group-hover:text-violet-200">Open <ArrowUpRight size={14}/></div></Link>}
