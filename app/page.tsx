"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Clapperboard, Image as ImageIcon, Menu, MessageCircle, Play, Sparkles, WandSparkles, X } from "lucide-react";

const samples = [
  ["Neon Portrait", "Portrait / 9:16", "from-fuchsia-500/35 via-violet-500/20 to-cyan-400/20"],
  ["Dream Landscape", "Landscape / 16:9", "from-cyan-400/30 via-blue-500/20 to-violet-500/30"],
  ["Future Product", "Commercial / 1:1", "from-orange-400/25 via-rose-500/20 to-fuchsia-500/25"],
  ["Anime World", "Illustration / 4:3", "from-emerald-400/30 via-teal-500/20 to-sky-500/25"],
];

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"image" | "video">("image");

  function generate() {
    if (prompt.trim()) window.location.href = `/create?mode=${mode}`;
    else document.getElementById("prompt")?.focus();
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#050507] text-white selection:bg-violet-400/30">
      <div className="pointer-events-none fixed inset-0 -z-0 opacity-60 [background-image:radial-gradient(circle_at_20%_10%,rgba(124,58,237,.16),transparent_30%),radial-gradient(circle_at_80%_25%,rgba(34,211,238,.10),transparent_25%)]" />
      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <div className="relative grid h-11 w-11 place-items-center rounded-2xl border border-white/15 bg-white/[.06] shadow-[0_0_40px_rgba(139,92,246,.18)]">
            <div className="absolute inset-1 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 opacity-80 blur-sm" />
            <Sparkles className="relative" size={19} />
          </div>
          <div><div className="text-lg font-black tracking-tight">CreateX <span className="text-violet-300">AI</span></div><div className="text-[8px] uppercase tracking-[.3em] text-white/35">Create. Imagine. Generate.</div></div>
        </Link>
        <div className="hidden items-center gap-7 text-sm text-white/50 md:flex"><a href="#studio" className="hover:text-white">Studio</a><Link href="/chat" className="hover:text-white">AI Chat</Link><a href="#gallery" className="hover:text-white">Explore</a><a href="#features" className="hover:text-white">Features</a></div>
        <div className="hidden items-center gap-3 md:flex"><Link href="/chat" className="rounded-xl border border-white/10 bg-white/[.04] px-4 py-2 text-sm text-white/70 hover:bg-white/[.08]">Chat</Link><Link href="/auth" className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-black hover:bg-white/90">Start free</Link></div>
        <button className="rounded-xl border border-white/10 bg-white/[.04] p-2 md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={20}/> : <Menu size={20}/>}</button>
      </nav>
      {mobileOpen && <div className="relative z-20 mx-5 rounded-2xl border border-white/10 bg-[#101015]/95 p-4 backdrop-blur-xl md:hidden"><div className="grid gap-3 text-sm text-white/70"><a href="#studio">Studio</a><Link href="/chat">AI Chat</Link><a href="#gallery">Explore</a><a href="#features">Features</a><Link href="/auth">Start free</Link></div></div>}

      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-16 md:px-8 md:pb-28 md:pt-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[.08] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.18em] text-violet-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.8)]"/> AI creative workspace <span className="text-white/30">·</span> Free</div>
            <h1 className="max-w-4xl text-5xl font-black leading-[.95] tracking-[-.065em] sm:text-6xl md:text-8xl">Your ideas.<br/><span className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-cyan-200 bg-clip-text text-transparent">Unlimited imagination.</span></h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/45 md:text-lg">Generate visuals, chat with AI, analyze images and work with files — all inside one beautifully simple creative workspace.</p>
            <div className="mt-8 flex flex-wrap gap-3"><Link href="/create" className="group inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-black">Open Studio <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"/></Link><Link href="/chat" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[.04] px-6 py-3.5 text-sm font-semibold text-white/80 hover:bg-white/[.08]"><MessageCircle size={16}/> Talk to AI</Link></div>
            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/30"><span>✦ 10 images/day</span><span>✦ 10 videos/day</span><span>✦ Unlimited chat</span></div>
          </div>
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-10 rounded-full bg-violet-500/10 blur-3xl" />
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-white/[.035] p-3 shadow-2xl shadow-violet-950/30 backdrop-blur-xl">
              <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/25 px-4 py-3"><div className="flex items-center gap-2 text-xs text-white/50"><span className="h-2 w-2 rounded-full bg-violet-400"/> CreateX Studio</div><span className="text-[10px] text-white/25">LIVE WORKSPACE</span></div>
              <div className="mt-3 overflow-hidden rounded-3xl border border-white/10 bg-[#0b0b10]">
                <div className="aspect-[4/3] bg-[radial-gradient(circle_at_70%_30%,rgba(217,70,239,.38),transparent_20%),radial-gradient(circle_at_25%_70%,rgba(34,211,238,.25),transparent_28%),linear-gradient(135deg,#17121e,#0b1017)] p-5"><div className="flex h-full items-end"><div><div className="text-[9px] uppercase tracking-[.3em] text-white/35">Preview</div><div className="mt-2 text-2xl font-black">Imagine. Then make it real.</div></div></div></div>
                <div className="border-t border-white/10 p-4"><div className="mb-3 flex gap-2"><button onClick={()=>setMode("image")} className={`rounded-lg px-3 py-1.5 text-[10px] font-bold ${mode==="image"?"bg-white text-black":"bg-white/5 text-white/40"}`}><ImageIcon size={13} className="mr-1 inline"/>Image</button><button onClick={()=>setMode("video")} className={`rounded-lg px-3 py-1.5 text-[10px] font-bold ${mode==="video"?"bg-white text-black":"bg-white/5 text-white/40"}`}><Clapperboard size={13} className="mr-1 inline"/>Video</button></div><textarea id="prompt" value={prompt} onChange={e=>setPrompt(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();generate()}}} placeholder="Describe anything..." className="min-h-20 w-full resize-none bg-transparent text-sm leading-6 outline-none placeholder:text-white/20"/><button onClick={generate} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 px-4 py-3 text-sm font-bold"><WandSparkles size={15}/> Generate {mode}</button></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="studio" className="relative z-10 mx-auto max-w-7xl px-5 pb-24 md:px-8"><div className="mb-8 flex items-end justify-between gap-5"><div><p className="text-[10px] font-bold uppercase tracking-[.25em] text-violet-300">One workspace</p><h2 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Everything you need to create.</h2></div><Link href="/create" className="hidden items-center gap-2 text-sm text-white/50 hover:text-white sm:flex">Open studio <ArrowUpRight size={15}/></Link></div><div className="grid gap-4 md:grid-cols-3"><ToolCard icon={<ImageIcon/>} number="01" title="Generate Images" text="Turn a thought into polished artwork, portraits, concepts and product visuals." href="/create"/><ToolCard icon={<Play/>} number="02" title="Generate Videos" text="Create cinematic motion from simple prompts and bring your ideas to life." href="/create"/><ToolCard icon={<MessageCircle/>} number="03" title="Chat + Analyze" text="Discuss ideas, upload images, work with files and ask your AI anything." href="/chat"/></div></section>

      <section id="gallery" className="relative z-10 mx-auto max-w-7xl px-5 pb-24 md:px-8"><div className="flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[.25em] text-cyan-300">Explore</p><h2 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Made with CreateX.</h2></div><span className="hidden text-xs text-white/25 sm:block">A glimpse of what&apos;s possible</span></div><div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{samples.map(([title,sub,gradient],i)=><div key={title} className="group overflow-hidden rounded-[28px] border border-white/10 bg-white/[.025] transition hover:-translate-y-1 hover:border-white/20"><div className={`relative aspect-[4/5] bg-gradient-to-br ${gradient}`}><div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,.14),transparent_22%)]"/><div className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/25 px-2.5 py-1 text-[9px] text-white/50 backdrop-blur">0{i+1}</div></div><div className="p-4"><div className="text-sm font-bold">{title}</div><div className="mt-1 text-[10px] text-white/30">{sub}</div></div></div>)}</div></section>

      <section id="features" className="relative z-10 mx-auto max-w-5xl px-5 pb-28 text-center"><div className="rounded-[34px] border border-white/10 bg-gradient-to-b from-white/[.055] to-white/[.02] p-8 md:p-16"><div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-violet-500/15"><Sparkles className="text-violet-300" size={22}/></div><h2 className="mt-6 text-3xl font-black tracking-tight md:text-5xl">Create without the complicated workflow.</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/40">Make visuals. Ask questions. Analyze files. Build ideas. Everything stays together in one AI workspace.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Link href="/chat" className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-black"><MessageCircle size={15}/> Open AI Chat</Link><Link href="/create" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[.04] px-6 py-3 text-sm font-semibold text-white/70">Start creating <ArrowUpRight size={15}/></Link></div></div></section>

      <footer className="relative z-10 border-t border-white/10 px-5 py-8 md:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-4 text-xs text-white/30 sm:flex-row sm:items-center sm:justify-between"><div>© 2026 CreateX AI · Create. Imagine. Generate.</div><div className="flex gap-5"><Link href="/developer" className="font-semibold text-violet-300 hover:text-white">Developer: Somesh Koli</Link><Link href="/chat" className="hover:text-white">AI Chat</Link></div></div></footer>
    </main>
  );
}

function ToolCard({icon,number,title,text,href}:{icon:React.ReactNode;number:string;title:string;text:string;href:string}){return <Link href={href} className="group rounded-[28px] border border-white/10 bg-white/[.025] p-6 transition hover:-translate-y-1 hover:border-violet-400/25 hover:bg-white/[.04]"><div className="flex items-center justify-between"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-500/10 text-violet-200">{icon}</div><span className="text-[10px] text-white/20">{number}</span></div><h3 className="mt-6 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/40">{text}</p><div className="mt-5 flex items-center gap-2 text-xs font-semibold text-white/35 group-hover:text-violet-200">Open <ArrowUpRight size={14}/></div></Link>}
