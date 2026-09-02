"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, ChevronDown, Clapperboard, Image as ImageIcon, Menu, Play, Sparkles, WandSparkles, X } from "lucide-react";

const samples = [
  ["Cinematic Portrait", "Portrait / 9:16", "from-fuchsia-500/30 via-purple-500/20 to-indigo-500/30"],
  ["Dream Landscape", "Landscape / 16:9", "from-cyan-400/25 via-blue-500/20 to-violet-500/30"],
  ["Product Studio", "Commercial / 1:1", "from-orange-400/25 via-pink-500/20 to-red-500/25"],
  ["Anime World", "Illustration / 4:3", "from-emerald-400/25 via-teal-500/20 to-sky-500/30"],
];

export default function Home() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<"image" | "video">("image");
  const [generated, setGenerated] = useState(false);

  function generate() {
    if (!prompt.trim()) return;
    setGenerated(true);
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#07070a] text-white selection:bg-violet-500/40">
      <div className="pointer-events-none fixed inset-0 -z-0 bg-[radial-gradient(circle_at_50%_0%,rgba(124,58,237,.16),transparent_34%),radial-gradient(circle_at_80%_40%,rgba(6,182,212,.09),transparent_30%)]" />

      <nav className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-8">
        <Link href="/" className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/20">
            <Sparkles size={20} />
          </div>
          <div><div className="text-lg font-black tracking-tight">CreateX <span className="text-violet-300">AI</span></div><div className="text-[9px] uppercase tracking-[.28em] text-white/40">Create. Imagine. Generate.</div></div>
        </Link>
        <div className="hidden items-center gap-7 text-sm text-white/60 md:flex">
          <a href="#generate" className="hover:text-white">Generate</a><a href="#features" className="hover:text-white">Features</a><a href="#gallery" className="hover:text-white">Gallery</a><a href="#pricing" className="hover:text-white">Pricing</a>
        </div>
        <div className="hidden items-center gap-3 md:flex"><Link href="/admin" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5">Admin</Link><button className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black">Get Started</button></div>
        <button className="rounded-xl border border-white/10 p-2 md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? <X size={20}/> : <Menu size={20}/>}</button>
      </nav>
      {mobileOpen && <div className="relative z-20 mx-5 rounded-2xl border border-white/10 bg-[#101015]/95 p-4 md:hidden"><div className="grid gap-3 text-sm text-white/70"><a href="#generate">Generate</a><a href="#features">Features</a><a href="#gallery">Gallery</a><a href="#pricing">Pricing</a></div></div>}

      <section className="relative z-10 mx-auto max-w-5xl px-5 pb-14 pt-14 text-center md:pt-24">
        <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/10 px-4 py-2 text-[11px] font-medium text-violet-200"><Sparkles size={14}/> AI CREATION STUDIO <span className="rounded-full bg-white/10 px-2 py-0.5">BETA</span></div>
        <h1 className="text-5xl font-black tracking-[-.055em] sm:text-6xl md:text-8xl">Turn ideas into <span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">visuals.</span></h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-white/50 md:text-lg">Create stunning images and cinematic videos from simple prompts. One creative workspace for your next idea.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3"><a href="#generate" className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-sm font-bold text-black">Start Creating <ArrowRight size={16}/></a><a href="#gallery" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white/80"><Play size={15} fill="currentColor"/> Explore creations</a></div>
      </section>

      <section id="generate" className="relative z-10 mx-auto max-w-5xl px-5 pb-24">
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[.035] p-3 shadow-2xl shadow-violet-950/20 backdrop-blur md:p-4">
          <div className="flex items-center justify-between border-b border-white/10 px-3 pb-3"><div className="flex gap-2"><button onClick={()=>setMode("image")} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${mode==="image"?"bg-white text-black":"text-white/50 hover:bg-white/5"}`}><ImageIcon size={15}/> Image</button><button onClick={()=>setMode("video")} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold ${mode==="video"?"bg-white text-black":"text-white/50 hover:bg-white/5"}`}><Clapperboard size={15}/> Video</button></div><span className="text-[10px] text-white/30">{mode === "image" ? "TEXT → IMAGE" : "TEXT → VIDEO"}</span></div>
          <div className="p-4 md:p-7"><div className="mb-3 flex items-center gap-2 text-xs text-white/50"><WandSparkles size={15} className="text-violet-300"/> Describe what you want to create</div><textarea value={prompt} onChange={e=>{setPrompt(e.target.value);setGenerated(false)}} placeholder={mode === "image" ? "A futuristic city at sunset, cinematic lighting, ultra detailed..." : "A cinematic drone shot flying through a futuristic city at sunset..."} className="min-h-36 w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white outline-none placeholder:text-white/20 focus:border-violet-400/50" />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div className="flex flex-wrap gap-2 text-[10px] text-white/40"><span className="rounded-lg border border-white/10 px-3 py-2">16:9</span><span className="rounded-lg border border-white/10 px-3 py-2">HD</span><span className="rounded-lg border border-white/10 px-3 py-2">Creative</span></div><button onClick={generate} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-bold shadow-lg shadow-violet-500/20">{generated ? <Check size={16}/> : <Sparkles size={16}/>} {generated ? "Prompt ready" : `Generate ${mode === "image" ? "Image" : "Video"}`}</button></div>
          </div>
        </div>
        {generated && <div className="mt-3 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-center text-xs text-emerald-200">Demo generation request prepared — connect an AI provider in the next step to render the actual {mode}.</div>}
      </section>

      <section id="features" className="relative z-10 mx-auto max-w-7xl px-5 pb-24 md:px-8"><div className="mb-8 max-w-xl"><div className="text-xs font-bold uppercase tracking-[.25em] text-violet-300">Everything you need</div><h2 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">One studio. Every format.</h2><p className="mt-3 text-sm leading-6 text-white/45">A clean workspace designed for fast experimentation, creators, and polished results.</p></div><div className="grid gap-4 md:grid-cols-3"><Feature icon={<ImageIcon/>} title="AI Images" text="Turn natural language into polished artwork, portraits, product shots and concepts."/><Feature icon={<Clapperboard/>} title="AI Videos" text="Bring prompts and images to life with cinematic motion and short-form video creation."/><Feature icon={<WandSparkles/>} title="Smart Prompts" text="Improve rough ideas with prompt assistance, styles, formats and creative presets."/></div></section>

      <section id="gallery" className="relative z-10 mx-auto max-w-7xl px-5 pb-24 md:px-8"><div className="mb-8 flex items-end justify-between"><div><div className="text-xs font-bold uppercase tracking-[.25em] text-cyan-300">Inspiration</div><h2 className="mt-3 text-3xl font-bold md:text-5xl">Made with CreateX</h2></div><span className="hidden text-xs text-white/30 sm:block">SAMPLE GALLERY</span></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{samples.map(([title,sub,gradient])=><div key={title} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[.035]"><div className={`relative aspect-[4/5] bg-gradient-to-br ${gradient}`}><div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,.18),transparent_28%),linear-gradient(135deg,transparent,rgba(0,0,0,.45))]"/><div className="absolute inset-x-5 bottom-5 h-24 rounded-2xl border border-white/10 bg-black/20 backdrop-blur-sm"/></div><div className="p-4"><div className="text-sm font-semibold">{title}</div><div className="mt-1 text-[10px] text-white/35">{sub}</div></div></div>)}</div></section>

      <section id="pricing" className="relative z-10 mx-auto max-w-5xl px-5 pb-24 text-center"><div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-violet-500/10 via-white/[.03] to-cyan-500/10 p-8 md:p-14"><div className="text-xs font-bold uppercase tracking-[.25em] text-violet-300">Built for creators</div><h2 className="mt-4 text-3xl font-black md:text-5xl">Create without the complicated workflow.</h2><p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/45">Start with the interface today. Image/video provider integrations, accounts, credits and generation history come next.</p><a href="#generate" className="mt-7 inline-flex rounded-2xl bg-white px-6 py-3 text-sm font-bold text-black">Open CreateX Studio</a></div></section>

      <footer className="relative z-10 border-t border-white/10 px-5 py-8 md:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-4 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between"><div>© 2026 CreateX AI. Create. Imagine. Generate.</div><div className="flex gap-5"><a href="#features" className="hover:text-white">Features</a><a href="#pricing" className="hover:text-white">Pricing</a><Link href="/developer" className="hover:text-white">Developer</Link></div></div></footer>
    </main>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-3xl border border-white/10 bg-white/[.03] p-6 transition hover:-translate-y-1 hover:border-violet-400/30"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10 text-violet-200">{icon}</div><h3 className="mt-5 text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-white/40">{text}</p></div>;
}
