"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, FileCode2, Play, Save, Sparkles, Terminal, Wand2 } from "lucide-react";

const starter = `export default function CreateXComponent() {\n  return (\n    <main className="p-6">\n      <h1>CreateX AI</h1>\n    </main>\n  );\n}\n`;

export default function CodeWorkspace() {
  const [code, setCode] = useState(starter);
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("Ready. Ask CreateX AI to explain, debug, refactor or rewrite your code.");
  const [busy, setBusy] = useState(false);

  async function askAI() {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("message", `${prompt}\n\nCurrent file (Component.tsx):\n${code}`);
      form.append("mode", "code");
      form.append("history", "[]");
      const res = await fetch("/api/chat", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI request failed");
      setOutput(data.text || "No response generated.");
    } catch (e: any) {
      setOutput(`Error: ${e?.message || "Something went wrong."}`);
    } finally { setBusy(false); }
  }

  function downloadCode() {
    const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "Component.tsx"; a.click(); URL.revokeObjectURL(url);
  }

  return <main className="min-h-screen bg-[#07070a] text-white">
    <header className="flex items-center justify-between border-b border-white/10 bg-[#09090d]/90 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3"><Link href="/chat" className="rounded-xl p-2 text-white/50 hover:bg-white/5"><ArrowLeft size={18}/></Link><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400"><Sparkles size={17}/></span><div><b>CreateX <span className="text-violet-300">AI</span></b><p className="text-[9px] uppercase tracking-widest text-white/30">Code Workspace</p></div></div>
      <div className="flex gap-2"><button onClick={downloadCode} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/60 hover:bg-white/5"><Save size={14}/> Export</button><button className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-black"><Play size={14}/> Run</button></div>
    </header>
    <div className="mx-auto grid min-h-[calc(100vh-65px)] max-w-[1500px] lg:grid-cols-[190px_1fr_360px]">
      <aside className="hidden border-r border-white/10 p-3 lg:block"><p className="px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-white/25">Files</p><div className="rounded-xl bg-violet-500/10 px-3 py-2.5 text-xs text-white"><FileCode2 className="mr-2 inline" size={14}/> Component.tsx</div><div className="mt-1 rounded-xl px-3 py-2.5 text-xs text-white/35">+ New file</div></aside>
      <section className="flex min-h-[650px] flex-col"><div className="border-b border-white/10 bg-white/[.025] px-4 py-2 text-xs text-white/45">Component.tsx <span className="ml-2 text-white/20">TSX</span></div><textarea value={code} onChange={e=>setCode(e.target.value)} spellCheck={false} className="min-h-[650px] flex-1 resize-none bg-[#050507] p-5 font-mono text-[13px] leading-6 text-cyan-100 outline-none" /></section>
      <aside className="border-l border-white/10 bg-[#09090d] p-4"><div className="mb-4 flex items-center gap-2 text-sm font-bold"><Wand2 size={16} className="text-violet-300"/> AI Coding Assistant</div><textarea value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="Debug this, refactor it, add a feature…" className="h-28 w-full resize-none rounded-2xl border border-white/10 bg-white/[.035] p-3 text-xs outline-none placeholder:text-white/25"/><button onClick={askAI} disabled={busy||!prompt.trim()} className="mt-2 w-full rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-black disabled:opacity-30">{busy?"Thinking…":"Ask CreateX AI"}</button><div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-3"><div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30"><Terminal size={13}/> AI output</div><div className="max-h-[55vh] overflow-auto whitespace-pre-wrap text-xs leading-6 text-white/60">{output}</div></div></aside>
    </div>
  </main>;
}
