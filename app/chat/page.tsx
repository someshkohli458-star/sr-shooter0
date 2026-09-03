"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowLeft, FileCode2, FileUp, ImagePlus, Loader2, Paperclip, Send, Sparkles, X, Zap } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string; fileName?: string; image?: string };
type Mode = "general" | "code" | "analyze";

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: "Hi! I’m CreateX AI. We can chat, analyze images/files, inspect code or ZIP projects, debug code, and create new code together." }]);
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<Mode>("general");
  const fileRef = useRef<HTMLInputElement>(null);

  function pickFile(file?: File) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) return alert("Maximum attachment size is 8 MB.");
    setAttachment(file);
    if (file.type.startsWith("image/")) { const reader = new FileReader(); reader.onload = () => setPreview(String(reader.result)); reader.readAsDataURL(file); }
    else setPreview(null);
  }

  function newChat() { setMessages([{ role: "assistant", content: "New chat started. What are we building or discussing?" }]); setText(""); setAttachment(null); setPreview(null); }

  async function send() {
    const clean = text.trim();
    if ((!clean && !attachment) || busy) return;
    const userMsg: Message = { role: "user", content: clean, fileName: attachment?.name, image: preview || undefined };
    const next = [...messages, userMsg];
    setMessages(next); setText(""); setAttachment(null); setPreview(null); setBusy(true);
    try {
      const form = new FormData(); form.append("message", clean); form.append("mode", mode); form.append("history", JSON.stringify(messages)); if (attachment) form.append("file", attachment);
      const res = await fetch("/api/chat", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Chat request failed.");
      setMessages(prev => [...prev, { role: "assistant", content: data.text || "I couldn't generate a response." }]);
    } catch (error: any) { setMessages(prev => [...prev, { role: "assistant", content: `Sorry — ${error?.message || "something went wrong."}` }]); }
    finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#07070a] text-white"><header className="sticky top-0 z-30 border-b border-white/10 bg-[#07070a]/85 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6"><div className="flex items-center gap-3"><Link href="/" className="rounded-xl p-2 text-white/50 hover:bg-white/5 hover:text-white"><ArrowLeft size={18}/></Link><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400"><Sparkles size={17}/></span><div><div className="font-black">CreateX <span className="text-violet-300">AI</span></div><div className="text-[9px] uppercase tracking-widest text-white/30">AI Workspace</div></div></div><div className="flex items-center gap-2"><button onClick={newChat} className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/60 hover:bg-white/5">+ New chat</button><Link href="/create" className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-black">Studio</Link></div></div></header>
    <div className="mx-auto grid min-h-[calc(100vh-61px)] max-w-7xl md:grid-cols-[220px_1fr]"><aside className="hidden border-r border-white/10 p-4 md:block"><p className="px-2 text-[10px] font-bold uppercase tracking-widest text-white/25">Assistant</p><div className="mt-3 grid gap-1"><button onClick={()=>setMode("general")} className={`rounded-xl px-3 py-2 text-left text-sm ${mode==="general"?"bg-white/10 text-white":"text-white/45 hover:bg-white/5"}`}>💬 General chat</button><button onClick={()=>setMode("code")} className={`rounded-xl px-3 py-2 text-left text-sm ${mode==="code"?"bg-white/10 text-white":"text-white/45 hover:bg-white/5"}`}><FileCode2 className="mr-2 inline" size={15}/> Coding</button><button onClick={()=>setMode("analyze")} className={`rounded-xl px-3 py-2 text-left text-sm ${mode==="analyze"?"bg-white/10 text-white":"text-white/45 hover:bg-white/5"}`}><Zap className="mr-2 inline" size={15}/> Analyze files</button></div><div className="mt-8 rounded-2xl border border-white/10 bg-white/[.025] p-3 text-[11px] leading-5 text-white/35">Attach images, source files, PDFs or ZIP projects. CreateX can inspect readable project files and help produce edits.</div></aside>
      <section className="relative flex min-h-[calc(100vh-61px)] flex-col"><div className="flex-1 space-y-6 overflow-y-auto px-4 py-6 pb-40 md:px-10 md:py-10 md:pb-36">{messages.map((m,i)=><div key={i} className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}><div className={`max-w-[94%] rounded-3xl border p-4 md:max-w-[78%] ${m.role==="user"?"border-violet-400/20 bg-violet-500/10":"border-white/10 bg-white/[.035]"}`}>{m.image&&<img src={m.image} alt="Uploaded" className="mb-3 max-h-80 w-full rounded-2xl object-contain"/>}{m.fileName&&!m.image&&<div className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/60"><FileUp size={15}/>{m.fileName}</div>}<div className="whitespace-pre-wrap text-sm leading-7 text-white/80">{m.content}</div></div></div>)}{busy&&<div className="flex justify-start"><div className="flex items-center gap-2 rounded-3xl border border-white/10 bg-white/[.035] p-4 text-xs text-white/40"><Loader2 size={17} className="animate-spin text-violet-300"/> Thinking…</div></div>}</div>
        <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-[#07070a]/90 px-3 py-3 backdrop-blur-xl md:px-8 md:pb-7"><div className="mx-auto max-w-4xl"><div className="mb-2 flex gap-2 overflow-x-auto md:hidden"><button onClick={()=>setMode("general")} className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] ${mode==="general"?"bg-white text-black":"bg-white/5 text-white/50"}`}>General</button><button onClick={()=>setMode("code")} className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] ${mode==="code"?"bg-white text-black":"bg-white/5 text-white/50"}`}>Code</button><button onClick={()=>setMode("analyze")} className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] ${mode==="analyze"?"bg-white text-black":"bg-white/5 text-white/50"}`}>Analyze</button></div>{attachment&&<div className="mb-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[.035] p-2 text-xs text-white/60">{preview?<img src={preview} className="h-10 w-10 rounded-lg object-cover" alt="Preview"/>:<FileUp size={17}/>}<span className="min-w-0 flex-1 truncate">{attachment.name}</span><button onClick={()=>{setAttachment(null);setPreview(null)}} className="rounded-full p-1 hover:bg-white/10"><X size={14}/></button></div>}<div className="rounded-3xl border border-white/10 bg-white/[.045] p-2 shadow-2xl"><div className="flex items-end gap-2"><input ref={fileRef} type="file" hidden accept="image/*,.pdf,.txt,.md,.csv,.json,.js,.jsx,.ts,.tsx,.css,.html,.py,.java,.c,.cpp,.h,.hpp,.sql,.sh,.xml,.yaml,.yml,.go,.rs,.php,.rb,.swift,.kt,.dart,.vue,.svelte,.zip" onChange={e=>pickFile(e.target.files?.[0])}/><button onClick={()=>fileRef.current?.click()} title="Attach file" className="mb-1 rounded-2xl border border-white/10 p-3 text-white/55 hover:bg-white/5 hover:text-white"><Paperclip size={19}/></button><textarea value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}} placeholder={mode==="code"?"Ask me to build, debug or edit code…":mode==="analyze"?"Ask about the attached file…":"Message CreateX AI…"} className="min-h-12 max-h-36 flex-1 resize-none bg-transparent px-2 py-3 text-sm outline-none placeholder:text-white/25"/><button onClick={send} disabled={busy||(!text.trim()&&!attachment)} className="mb-1 rounded-2xl bg-white p-3 text-black disabled:opacity-30"><Send size={19}/></button></div></div><p className="mt-2 text-center text-[10px] text-white/20">Images, documents, code and ZIP projects can be attached. AI responses may contain mistakes.</p></div></div></section></div></main>;
}
