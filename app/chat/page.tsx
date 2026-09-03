"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowLeft, ImagePlus, Loader2, Send, Sparkles, X } from "lucide-react";

type Message = { role: "user" | "assistant"; content: string; image?: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([{ role: "assistant", content: "Hi! I’m CreateX AI. Discuss an idea with me, ask questions, or upload an image and I’ll analyze what I can see." }]);
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  function pickImage(file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return alert("Please select an image file.");
    if (file.size > 5 * 1024 * 1024) return alert("Please use an image under 5 MB.");
    const reader = new FileReader();
    reader.onload = () => setImage(String(reader.result));
    reader.readAsDataURL(file);
  }

  async function send() {
    const clean = text.trim();
    if ((!clean && !image) || busy) return;
    const next = [...messages, { role: "user" as const, content: clean, image: image || undefined }];
    setMessages(next); setText(""); setImage(null); setBusy(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: next }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Chat request failed.");
      setMessages(prev => [...prev, { role: "assistant", content: data.text || "I couldn't generate a response." }]);
    } catch (error: any) {
      setMessages(prev => [...prev, { role: "assistant", content: `Sorry — ${error?.message || "something went wrong."}` }]);
    } finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#07070a] text-white">
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#07070a]/80 backdrop-blur-xl"><div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 md:px-6"><Link href="/" className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400"><Sparkles size={17}/></span><span className="font-black">CreateX <span className="text-violet-300">AI</span></span></Link><Link href="/create" className="text-sm text-white/50 hover:text-white">Studio</Link></div></header>
    <div className="mx-auto flex min-h-[calc(100vh-61px)] max-w-5xl flex-col">
      <div className="flex-1 space-y-6 px-4 py-6 pb-36 md:px-6 md:py-10">
        {messages.map((m, i) => <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] rounded-3xl border p-4 md:max-w-[75%] ${m.role === "user" ? "border-violet-400/20 bg-violet-500/10" : "border-white/10 bg-white/[.035]"}`}>{m.image && <img src={m.image} alt="Uploaded for analysis" className="mb-3 max-h-80 w-full rounded-2xl object-contain"/>}<div className="whitespace-pre-wrap text-sm leading-7 text-white/80">{m.content}</div></div></div>)}
        {busy && <div className="flex justify-start"><div className="rounded-3xl border border-white/10 bg-white/[.035] p-4"><Loader2 size={18} className="animate-spin text-violet-300"/></div></div>}
      </div>
      <div className="fixed inset-x-0 bottom-0 z-10 border-t border-white/10 bg-[#07070a]/90 px-3 py-3 backdrop-blur-xl md:static md:border-0 md:bg-transparent md:px-6 md:pb-8"><div className="mx-auto max-w-5xl rounded-3xl border border-white/10 bg-white/[.045] p-2 shadow-2xl"><div className="flex items-end gap-2">{image && <div className="relative mb-1 ml-1"><img src={image} alt="Preview" className="h-14 w-14 rounded-xl object-cover"/><button onClick={()=>setImage(null)} className="absolute -right-2 -top-2 rounded-full bg-black p-1"><X size={11}/></button></div>}<textarea value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}} placeholder="Message CreateX AI..." className="min-h-12 max-h-32 flex-1 resize-none bg-transparent px-3 py-3 text-sm outline-none placeholder:text-white/25"/><input ref={fileRef} type="file" accept="image/*" hidden onChange={e=>pickImage(e.target.files?.[0])}/><button onClick={()=>fileRef.current?.click()} title="Upload image" className="mb-1 rounded-2xl border border-white/10 p-3 text-white/55 hover:bg-white/5 hover:text-white"><ImagePlus size={19}/></button><button onClick={send} disabled={busy||(!text.trim()&&!image)} className="mb-1 rounded-2xl bg-white p-3 text-black disabled:opacity-30"><Send size={19}/></button></div></div><p className="mx-auto mt-2 max-w-5xl px-2 text-[10px] text-white/25">CreateX AI can make mistakes. Uploaded images are sent securely to the AI service for analysis.</p></div>
    </div>
  </main>;
}
