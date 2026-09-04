"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Check, Clapperboard, Image as ImageIcon, Sparkles, Upload, WandSparkles, Loader2, ChevronRight } from "lucide-react";

const presets = [
  ["Cinematic", "cinematic composition, dramatic lighting, film still, rich atmosphere"],
  ["Anime", "beautiful anime illustration, expressive character design, detailed background"],
  ["Product", "premium commercial product photography, studio lighting, clean composition"],
  ["Dreamy", "dreamlike atmosphere, soft light, ethereal colors, magical realism"],
];

export default function CreatePage() {
  const [mode, setMode] = useState<"image" | "video">("image");
  const [prompt, setPrompt] = useState("");
  const [aspect, setAspect] = useState("16:9");
  const [quality, setQuality] = useState("HD");
  const [duration, setDuration] = useState("5s");
  const [enhanced, setEnhanced] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const [referenceData, setReferenceData] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [statusKind, setStatusKind] = useState<"info" | "error" | "success">("info");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imagesUsed, setImagesUsed] = useState(0);
  const [videosUsed, setVideosUsed] = useState(0);

  useEffect(() => {
    let active = true;
    fetch("/api/usage", { cache: "no-store" })
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (active && data) { setImagesUsed(Number(data.imagesUsed || 0)); setVideosUsed(Number(data.videosUsed || 0)); } })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  function setInfo(message: string) { setStatus(message); setStatusKind("info"); }
  function setError(message: string) { setStatus(message); setStatusKind("error"); }
  function setSuccess(message: string) { setStatus(message); setStatusKind("success"); }

  function enhancePrompt() { if (!prompt.trim()) return; setPrompt(`${prompt.trim()}, cinematic composition, professional lighting, highly detailed, polished visual quality`); setEnhanced(true); setInfo("Prompt enhanced"); }
  function chooseReference(event: React.ChangeEvent<HTMLInputElement>) { const file=event.target.files?.[0]; if(!file)return; if(file.size>50*1024*1024){setError("Reference image is too large. Maximum size is 50MB.");return;} const reader=new FileReader(); reader.onload=()=>{setReference(file.name);setReferenceData(typeof reader.result==="string"?reader.result:null);setInfo(`Reference ready: ${file.name}`)}; reader.onerror=()=>setError("Could not read the reference image."); reader.readAsDataURL(file); }
  async function generate() {
    if(!prompt.trim()||busy)return;
    const used = mode === "image" ? imagesUsed : videosUsed;
    if (used >= 10) { setError(`Daily ${mode} limit reached. Try again tomorrow.`); return; }
    setBusy(true);setProgress(5);setInfo("Preparing your creation...");
    try {
      const response=await fetch("/api/generate",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type:mode,prompt:prompt.trim(),aspect,quality,duration,referenceData:mode==="image"?referenceData:null})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok){
        if (data.code === "AI_BILLING_LIMIT") setError("AI generation is temporarily unavailable because the AI service billing limit has been reached. Please try again later.");
        else if (data.code === "AI_CONFIGURATION") setError("AI service is not configured correctly. Please contact the administrator.");
        else setError(data.error||"Generation failed.");
        return;
      }
      if (mode === "image") setImagesUsed(v => Math.min(10, v + 1)); else setVideosUsed(v => Math.min(10, v + 1));
      const generationId=data.generation?.id;
      if(mode==="video"&&generationId){
        for(let attempt=0;attempt<72;attempt++){
          const poll=await fetch(`/api/generate/video-status?id=${encodeURIComponent(generationId)}`,{cache:"no-store"});
          const result=await poll.json().catch(()=>({}));
          if(!poll.ok&&result.error){setError(result.error);return;}
          const next=Math.max(5,Math.min(99,Math.round(Number(result.progress||0))));setProgress(next);
          if(result.status==="completed"){setProgress(100);setSuccess("Video completed and saved to your private gallery.");window.setTimeout(()=>window.location.href="/creations",500);return;}
          if(result.status==="failed"){setError(result.error||"Video generation failed.");return;}
          setInfo(`Creating your video... ${next}%`);await new Promise(r=>setTimeout(r,5000));
        }
        setInfo("Video is still processing. Check My Creations later.");return;
      }
      setProgress(100);setSuccess("Image generated and saved to your private gallery.");window.setTimeout(()=>window.location.href="/creations",500);
    } catch {setError("Network error. Please try again.")} finally{setBusy(false)}
  }

  const used = mode === "image" ? imagesUsed : videosUsed;
  const remaining = Math.max(0, 10 - used);
  const allowancePercent = Math.min(100, Math.round((used / 10) * 100));

  return <main className="min-h-screen bg-[#050507] text-white"><div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_75%_12%,rgba(124,58,237,.13),transparent_28%),radial-gradient(circle_at_15%_70%,rgba(34,211,238,.07),transparent_25%)]"/>
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#050507]/85 px-4 py-3 backdrop-blur-xl md:px-8"><div className="mx-auto flex max-w-7xl items-center justify-between"><Link href="/" className="flex items-center gap-3 text-sm text-white/65 hover:text-white"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400"><Sparkles size={17}/></span><span className="font-black">CreateX <span className="text-violet-300">AI</span></span></Link><div className="flex items-center gap-2"><Link href="/dashboard" className="hidden rounded-xl px-3 py-2 text-xs text-white/40 hover:text-white sm:block">Dashboard</Link><Link href="/creations" className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/55 hover:bg-white/5">My Creations</Link></div></div></header>
    <div className="relative z-10 mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10"><div className="mb-8"><Link href="/" className="inline-flex items-center gap-1 text-xs text-white/30 hover:text-white"><ArrowLeft size={14}/> Back home</Link><div className="mt-5 flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><div className="inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-400/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.2em] text-violet-200"><WandSparkles size={13}/> Creation Studio</div><h1 className="mt-4 text-4xl font-black tracking-[-.045em] md:text-6xl">Make something <span className="bg-gradient-to-r from-violet-300 to-cyan-200 bg-clip-text text-transparent">unforgettable.</span></h1><p className="mt-3 max-w-xl text-sm leading-6 text-white/40">Describe it. Shape it. Create it. Your free studio includes 10 images and 10 videos every day.</p></div><div className="flex rounded-2xl border border-white/10 bg-white/[.025] p-1"><button onClick={()=>{setMode("image");setStatus("")}} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold ${mode==="image"?"bg-white text-black":"text-white/40 hover:text-white"}`}><ImageIcon size={15}/> Image</button><button onClick={()=>{setMode("video");setStatus("")}} className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold ${mode==="video"?"bg-white text-black":"text-white/40 hover:text-white"}`}><Clapperboard size={15}/> Video</button></div></div></div>
      <div className="grid gap-5 lg:grid-cols-[1fr_330px]"><section className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[.025] shadow-2xl shadow-black/30"><div className="border-b border-white/10 px-5 py-4 md:px-7"><div className="flex items-center justify-between"><span className="text-xs font-bold text-white/60">Describe your idea</span><span className="text-[10px] text-white/20">{prompt.length}/2000</span></div></div><div className="p-5 md:p-7"><textarea maxLength={2000} value={prompt} onChange={e=>{setPrompt(e.target.value);setEnhanced(false)}} className="min-h-64 w-full resize-none bg-transparent text-base leading-8 outline-none placeholder:text-white/20 md:text-lg" placeholder={mode==="image"?"A futuristic Indian city after rain, glowing neon reflections, cinematic architecture...":"A slow cinematic camera move through a futuristic city after rain, neon reflections, atmospheric fog..."}/><div className="mt-5 flex flex-wrap gap-2"><button onClick={enhancePrompt} disabled={!prompt.trim()||busy} className="inline-flex items-center gap-2 rounded-xl border border-violet-400/15 bg-violet-400/5 px-3 py-2 text-xs font-semibold text-violet-200 hover:bg-violet-400/10 disabled:opacity-30"><Sparkles size={14}/> {enhanced?"Prompt enhanced":"Enhance prompt"}</button><label className={`inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-white/50 hover:bg-white/5 ${mode==="video"||busy?"cursor-not-allowed opacity-40":"cursor-pointer"}`}><Upload size={14}/> {reference?"Reference added":"Add reference"}<input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" disabled={mode==="video"||busy} onChange={chooseReference}/></label></div>{reference&&<div className="mt-3 flex items-center gap-3 rounded-xl border border-violet-400/15 bg-violet-400/5 p-3 text-xs text-violet-100"><div className="h-9 w-9 rounded-lg bg-white/10"/><span className="min-w-0 flex-1 truncate">{reference}</span><button onClick={()=>{setReference(null);setReferenceData(null)}} className="text-white/35 hover:text-white">Remove</button></div>}<div className="mt-8"><div className="mb-3 text-[10px] font-bold uppercase tracking-[.2em] text-white/25">Quick styles</div><div className="grid grid-cols-2 gap-2 md:grid-cols-4">{presets.map(([name,style])=><button key={name} disabled={busy} onClick={()=>setPrompt(p=>p?`${p}, ${style}`:style)} className="rounded-2xl border border-white/10 bg-white/[.025] px-3 py-3 text-left text-xs font-semibold text-white/55 transition hover:border-violet-400/20 hover:bg-violet-400/5 hover:text-white">{name}<span className="mt-1 block text-[9px] font-normal text-white/20">Apply style <ChevronRight size={10} className="inline"/></span></button>)}</div></div></div></section>
        <aside className="rounded-[30px] border border-white/10 bg-white/[.025] p-5 md:p-6"><div className="flex items-center justify-between"><span className="text-xs font-bold text-white/60">Output settings</span><span className="rounded-full bg-emerald-400/10 px-2 py-1 text-[9px] font-bold text-emerald-200">FREE</span></div><div className="mt-6 space-y-6"><Setting title="Aspect ratio"><div className="grid grid-cols-3 gap-2">{["1:1","16:9","9:16"].map(x=><button disabled={busy} key={x} onClick={()=>setAspect(x)} className={`rounded-xl border p-3 text-xs font-semibold ${aspect===x?"border-violet-400/50 bg-violet-400/10 text-violet-200":"border-white/10 text-white/40 hover:bg-white/5"}`}>{x}</button>)}</div></Setting><Setting title="Quality"><div className="grid grid-cols-2 gap-2">{["HD","Ultra"].map(x=><button disabled={busy} key={x} onClick={()=>setQuality(x)} className={`rounded-xl border p-3 text-xs font-semibold ${quality===x?"border-violet-400/50 bg-violet-400/10 text-violet-200":"border-white/10 text-white/40 hover:bg-white/5"}`}>{x}</button>)}</div></Setting>{mode==="video"&&<Setting title="Duration"><div className="grid grid-cols-3 gap-2">{["5s","10s","15s"].map(x=><button disabled={busy} key={x} onClick={()=>setDuration(x)} className={`rounded-xl border p-3 text-xs font-semibold ${duration===x?"border-violet-400/50 bg-violet-400/10 text-violet-200":"border-white/10 text-white/40 hover:bg-white/5"}`}>{x}</button>)}</div></Setting>}<div className="border-t border-white/10 pt-5"><div className="mb-3 flex items-center justify-between text-[10px] text-white/30"><span>Daily allowance</span><span>{remaining} remaining · 10 {mode}s/day</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all" style={{width:`${allowancePercent}%`}}/></div></div>{busy&&<div><div className="mb-2 flex justify-between text-[10px] text-white/30"><span>Creating</span><span>{progress}%</span></div><div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 transition-all" style={{width:`${progress}%`}}/></div></div>}<button onClick={generate} disabled={!prompt.trim()||busy||used>=10} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-4 text-sm font-black text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-30">{busy?<Loader2 size={17} className="animate-spin"/>:<WandSparkles size={17}/>} {busy?"Creating...":used>=10?`Daily ${mode} limit reached`:`Generate ${mode}`}</button>{status&&<div className={`rounded-2xl border p-3 text-[11px] leading-5 ${statusKind==="error"?"border-red-400/20 bg-red-400/5 text-red-200":statusKind==="success"?"border-emerald-400/15 bg-emerald-400/5 text-emerald-200":"border-white/10 bg-white/[.03] text-white/55"}`}><Check size={14} className="mr-1 inline"/>{status}</div>}</div></aside></div>
    </div></main>;
}

function Setting({title,children}:{title:string;children:React.ReactNode}){return <div><div className="mb-2 text-[10px] font-bold uppercase tracking-[.2em] text-white/25">{title}</div>{children}</div>}
