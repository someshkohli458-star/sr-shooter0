"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Check, Clapperboard, Image as ImageIcon, Sparkles, Upload, WandSparkles } from "lucide-react";

export default function CreatePage() {
  const [mode, setMode] = useState<"image" | "video">("image");
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState("16:9");
  const [quality, setQuality] = useState("HD");
  const [duration, setDuration] = useState("5s");
  const [enhanced, setEnhanced] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  function enhancePrompt() { if (!prompt.trim()) return; setPrompt(`${prompt.trim()}, cinematic composition, professional lighting, highly detailed, polished visual quality`); setEnhanced(true); setStatus("Prompt enhanced"); }
  function chooseReference(event: React.ChangeEvent<HTMLInputElement>) { const file = event.target.files?.[0]; if (!file) return; setReference(file.name); setStatus(`Reference selected: ${file.name}`); }

  async function generate() {
    if (!prompt.trim() || busy) return;
    setBusy(true); setStatus("Checking credits and creating generation...");
    try {
      const response = await fetch("/api/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type: mode, prompt: prompt.trim(), aspect, quality, duration }) });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) { setStatus(data.error || "Generation could not be started."); return; }
      const generationId = data.generation?.id;
      if (mode === "video" && generationId) {
        setStatus("Video job queued • generating with Sora 2...");
        for (let attempt = 0; attempt < 60; attempt++) {
          await new Promise(resolve => setTimeout(resolve, 5000));
          const poll = await fetch(`/api/generate/video-status?id=${encodeURIComponent(generationId)}`, { cache: "no-store" });
          const result = await poll.json().catch(() => ({}));
          if (result.status === "completed") { setStatus("Video completed and saved to your private gallery. Opening creations..."); window.location.href = "/creations"; return; }
          if (result.status === "failed") { setStatus(result.error || "Video generation failed. Credits were refunded."); return; }
          setStatus(`Video generating... ${Math.round(Number(result.progress || 0))}%`);
        }
        setStatus("Video is still processing. You can check My Creations later.");
        return;
      }
      setStatus(`Image created and saved • ${data.generation?.id?.slice(0, 8) || "ready"}`);
    } catch { setStatus("Network error. Please try again."); } finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#07070a] text-white"><header className="border-b border-white/10 bg-[#09090d]/90 px-5 py-4 backdrop-blur md:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between"><Link href="/" className="flex items-center gap-2 text-sm text-white/60 hover:text-white"><ArrowLeft size={16}/> CreateX AI</Link><div className="text-[10px] uppercase tracking-[.25em] text-white/30">Creation Studio</div></div></header>
    <div className="mx-auto grid max-w-7xl gap-5 px-5 py-6 md:grid-cols-[280px_1fr] md:px-8 md:py-8"><aside className="rounded-3xl border border-white/10 bg-white/[.03] p-4"><div className="mb-5 text-xs font-bold uppercase tracking-[.2em] text-white/40">Create</div><button onClick={()=>{setMode("image");setStatus("")}} className={`mb-2 flex w-full items-center gap-3 rounded-2xl p-4 text-left text-sm ${mode==="image"?"bg-white text-black":"text-white/60 hover:bg-white/5"}`}><ImageIcon size={18}/> AI Image</button><button onClick={()=>{setMode("video");setStatus("")}} className={`flex w-full items-center gap-3 rounded-2xl p-4 text-left text-sm ${mode==="video"?"bg-white text-black":"text-white/60 hover:bg-white/5"}`}><Clapperboard size={18}/> AI Video</button><div className="mt-8 border-t border-white/10 pt-5 text-[11px] leading-5 text-white/35">AI images use GPT Image. Video jobs use Sora 2 and are processed asynchronously.</div></aside>
      <section className="rounded-3xl border border-white/10 bg-white/[.025] p-5 md:p-8"><div className="mb-7"><div className="flex items-center gap-2 text-xs font-semibold text-violet-300"><WandSparkles size={15}/> {mode==="image"?"IMAGE GENERATOR":"VIDEO GENERATOR"}</div><h1 className="mt-3 text-3xl font-black tracking-tight md:text-5xl">What will you create?</h1><p className="mt-2 text-sm text-white/40">Describe your idea and configure the output.</p></div><div className="grid gap-5 lg:grid-cols-[1fr_320px]"><div><label className="text-xs font-semibold text-white/60">Prompt</label><textarea value={prompt} onChange={e=>{setPrompt(e.target.value);setEnhanced(false)}} className="mt-2 min-h-56 w-full resize-none rounded-2xl border border-white/10 bg-black/20 p-5 text-sm leading-7 outline-none placeholder:text-white/20 focus:border-violet-400/50" placeholder={mode==="image"?"A futuristic Indian city after rain, cinematic neon reflections, detailed architecture...":"A slow cinematic camera movement through a futuristic city after rain, neon reflections..."}/><div className="mt-4 flex flex-wrap gap-2"><button onClick={enhancePrompt} disabled={!prompt.trim()} className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/50 hover:bg-white/5 disabled:opacity-30"><Sparkles size={14}/> {enhanced?"Enhanced":"Enhance prompt"}</button><label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/50 hover:bg-white/5"><Upload size={14}/> {reference?"Reference added":"Reference image"}<input type="file" accept="image/*" className="hidden" onChange={chooseReference}/></label></div>{reference&&<div className="mt-3 text-[11px] text-white/35">Selected: {reference}</div>}</div><div className="space-y-4 rounded-2xl border border-white/10 bg-black/20 p-4"><div><label className="text-[10px] uppercase tracking-[.18em] text-white/35">Aspect Ratio</label><div className="mt-2 grid grid-cols-3 gap-2">{["1:1","16:9","9:16"].map(x=><button key={x} onClick={()=>setAspect(x)} className={`rounded-xl border p-3 text-xs ${aspect===x?"border-violet-400/60 bg-violet-400/10 text-violet-200":"border-white/10 text-white/40"}`}>{x}</button>)}</div></div><div><label className="text-[10px] uppercase tracking-[.18em] text-white/35">Quality</label><div className="mt-2 grid grid-cols-2 gap-2">{["HD","Ultra"].map(x=><button key={x} onClick={()=>setQuality(x)} className={`rounded-xl border p-3 text-xs ${quality===x?"border-violet-400/60 bg-violet-400/10 text-violet-200":"border-white/10 text-white/40"}`}>{x}</button>)}</div></div>{mode==="video"&&<div><label className="text-[10px] uppercase tracking-[.18em] text-white/35">Duration</label><div className="mt-2 grid grid-cols-3 gap-2">{["5s","10s","15s"].map(x=><button key={x} onClick={()=>setDuration(x)} className={`rounded-xl border p-3 text-xs ${duration===x?"border-violet-400/60 bg-violet-400/10 text-violet-200":"border-white/10 text-white/40"}`}>{x}</button>)}</div></div>}<button onClick={generate} disabled={!prompt.trim()||busy} className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-4 text-sm font-bold disabled:cursor-not-allowed disabled:opacity-30"><Sparkles size={16}/> {busy?"Generating...":`Generate ${mode==="image"?"Image":"Video"}`}</button>{status&&<div className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-[11px] text-emerald-200"><Check size={14}/>{status}</div>}</div></div></section></div></main>;
}
