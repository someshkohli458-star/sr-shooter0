"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, FileCode2, FileUp, Loader2, Menu, Paperclip, Pencil, Plus, Search, Send, Sparkles, Trash2, X, Zap } from "lucide-react";

type Message = { id?: string; role: "user" | "assistant"; content: string; fileName?: string; file_name?: string };
type ChatSummary = { id: string; title: string; created_at: string; updated_at: string };
type Mode = "general" | "code" | "analyze";

const starter = (text = "Hi! I’m CreateX AI. We can chat, analyze images/files, inspect code or ZIP projects, debug code, and create new code together."): Message => ({ role: "assistant", content: text });

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([starter()]);
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [chatId, setChatId] = useState("");
  const [search, setSearch] = useState("");
  const [text, setText] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [mode, setMode] = useState<Mode>("general");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingId, setEditingId] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function loadChats() {
    setLoadingChats(true);
    try { const res = await fetch("/api/chat", { cache: "no-store" }); const data = await res.json(); if (res.ok) setChats(data.chats || []); } finally { setLoadingChats(false); }
  }

  async function loadChat(id: string) {
    if (busy) return;
    const res = await fetch(`/api/chat?chatId=${encodeURIComponent(id)}`, { cache: "no-store" });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Could not load chat.");
    setChatId(id);
    setMessages((data.messages || []).map((m: Message) => ({ id: m.id, role: m.role, content: m.content, fileName: m.file_name || m.fileName || undefined })));
    setSidebarOpen(false);
  }

  useEffect(() => { loadChats(); }, []);

  function pickFile(file?: File) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) return alert("Maximum attachment size is 8 MB.");
    setAttachment(file);
    if (file.type.startsWith("image/")) { const reader = new FileReader(); reader.onload = () => setPreview(String(reader.result)); reader.readAsDataURL(file); } else setPreview(null);
  }

  function newChat() {
    setChatId(""); setMessages([starter("New chat started. What are we building or discussing?")]); setText(""); setAttachment(null); setPreview(null); setSidebarOpen(false);
  }

  async function renameChat(id: string) {
    const title = editingTitle.trim().slice(0, 80);
    if (!title) return setEditingId("");
    const res = await fetch("/api/chat", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ chatId: id, title }) });
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Could not rename chat.");
    setChats(prev => prev.map(c => c.id === id ? data.chat : c)); setEditingId("");
  }

  async function deleteChat(id: string) {
    if (!confirm("Delete this conversation?")) return;
    const res = await fetch(`/api/chat?chatId=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!res.ok) { const data = await res.json().catch(() => ({})); return alert(data.error || "Could not delete chat."); }
    setChats(prev => prev.filter(c => c.id !== id));
    if (chatId === id) newChat();
  }

  async function send() {
    const clean = text.trim();
    if ((!clean && !attachment) || busy) return;
    const currentFile = attachment;
    const userMsg: Message = { role: "user", content: clean, fileName: currentFile?.name };
    setMessages(prev => [...prev, userMsg]); setText(""); setAttachment(null); setPreview(null); setBusy(true);
    try {
      const form = new FormData(); form.append("message", clean); form.append("mode", mode); form.append("chatId", chatId); form.append("history", JSON.stringify(messages)); if (currentFile) form.append("file", currentFile);
      const res = await fetch("/api/chat", { method: "POST", body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Chat request failed.");
      setChatId(data.chatId || chatId);
      setMessages(prev => [...prev, { role: "assistant", content: data.text || "I couldn't generate a response." }]);
      await loadChats();
    } catch (error: any) { setMessages(prev => [...prev, { role: "assistant", content: `Sorry — ${error?.message || "something went wrong."}` }]); }
    finally { setBusy(false); }
  }

  const visibleChats = chats.filter(c => c.title.toLowerCase().includes(search.toLowerCase()));

  return <main className="min-h-screen bg-[#07070a] text-white"><header className="sticky top-0 z-30 border-b border-white/10 bg-[#07070a]/90 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-3 py-3 md:px-6"><div className="flex items-center gap-2"><button onClick={()=>setSidebarOpen(true)} className="rounded-xl p-2 text-white/55 hover:bg-white/5 md:hidden"><Menu size={19}/></button><Link href="/" className="rounded-xl p-2 text-white/50 hover:bg-white/5 hover:text-white"><ArrowLeft size={18}/></Link><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400"><Sparkles size={17}/></span><div><div className="font-black">CreateX <span className="text-violet-300">AI</span></div><div className="text-[9px] uppercase tracking-widest text-white/30">AI Workspace</div></div></div><div className="flex items-center gap-2"><button onClick={newChat} className="flex items-center gap-1.5 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/60 hover:bg-white/5"><Plus size={14}/> New chat</button><Link href="/create" className="rounded-xl bg-white px-3 py-2 text-xs font-bold text-black">Studio</Link></div></div></header>

    <div className="mx-auto grid min-h-[calc(100vh-61px)] max-w-7xl md:grid-cols-[270px_1fr]">
      {sidebarOpen && <button aria-label="Close sidebar" onClick={()=>setSidebarOpen(false)} className="fixed inset-0 z-40 bg-black/60 md:hidden"/>}
      <aside className={`fixed inset-y-[61px] left-0 z-50 w-[290px] border-r border-white/10 bg-[#09090d] p-3 transition-transform md:static md:z-auto md:w-auto md:translate-x-0 ${sidebarOpen?"translate-x-0":"-translate-x-full"}`}>
        <div className="flex items-center justify-between px-2 pb-3"><p className="text-[10px] font-bold uppercase tracking-widest text-white/25">Your chats</p><button onClick={()=>setSidebarOpen(false)} className="rounded-lg p-1 text-white/40 hover:bg-white/5 md:hidden"><X size={16}/></button></div>
        <button onClick={newChat} className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-black"><Plus size={15}/> New chat</button>
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-white/10 bg-white/[.035] px-3 py-2"><Search size={14} className="text-white/30"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search chats" className="min-w-0 flex-1 bg-transparent text-xs outline-none placeholder:text-white/25"/></div>
        <div className="max-h-[45vh] space-y-1 overflow-y-auto">{loadingChats ? <div className="px-3 py-4 text-xs text-white/25">Loading history…</div> : visibleChats.length ? visibleChats.map(c=><div key={c.id} className={`group rounded-xl border ${chatId===c.id?"border-violet-400/20 bg-violet-500/10":"border-transparent hover:border-white/5 hover:bg-white/[.035]"}`}>
          {editingId===c.id ? <div className="flex gap-1 p-1"><input autoFocus value={editingTitle} onChange={e=>setEditingTitle(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")renameChat(c.id);if(e.key==="Escape")setEditingId("")}} className="min-w-0 flex-1 rounded-lg bg-black/30 px-2 py-2 text-xs outline-none"/><button onClick={()=>renameChat(c.id)} className="rounded-lg bg-white px-2 text-[10px] text-black">Save</button></div> : <div className="flex items-center"><button onClick={()=>loadChat(c.id)} className="min-w-0 flex-1 px-3 py-2.5 text-left text-xs text-white/65"><span className="block truncate">{c.title}</span><span className="mt-0.5 block text-[9px] text-white/20">{new Date(c.updated_at).toLocaleDateString()}</span></button><div className="mr-1 hidden gap-0.5 group-hover:flex"><button onClick={()=>{setEditingId(c.id);setEditingTitle(c.title)}} title="Rename" className="rounded-lg p-1.5 text-white/30 hover:bg-white/10 hover:text-white"><Pencil size={12}/></button><button onClick={()=>deleteChat(c.id)} title="Delete" className="rounded-lg p-1.5 text-white/30 hover:bg-red-500/10 hover:text-red-300"><Trash2 size={12}/></button></div></div>}
        </div>) : <div className="px-3 py-5 text-center text-xs text-white/20">{search?"No chats found.":"No conversations yet."}</div>}</div>
        <div className="mt-6 border-t border-white/10 pt-4"><p className="px-2 text-[10px] font-bold uppercase tracking-widest text-white/25">Assistant</p><div className="mt-2 grid gap-1"><button onClick={()=>setMode("general")} className={`rounded-xl px-3 py-2 text-left text-sm ${mode==="general"?"bg-white/10 text-white":"text-white/45 hover:bg-white/5"}`}>💬 General chat</button><button onClick={()=>setMode("code")} className={`rounded-xl px-3 py-2 text-left text-sm ${mode==="code"?"bg-white/10 text-white":"text-white/45 hover:bg-white/5"}`}><FileCode2 className="mr-2 inline" size={15}/> Coding</button><button onClick={()=>setMode("analyze")} className={`rounded-xl px-3 py-2 text-left text-sm ${mode==="analyze"?"bg-white/10 text-white":"text-white/45 hover:bg-white/5"}`}><Zap className="mr-2 inline" size={15}/> Analyze files</button></div></div>
      </aside>

      <section className="relative flex min-h-[calc(100vh-61px)] flex-col"><div className="flex-1 space-y-6 overflow-y-auto px-4 py-6 pb-40 md:px-10 md:py-10 md:pb-36">{messages.map((m,i)=><div key={m.id||i} className={`flex ${m.role==="user"?"justify-end":"justify-start"}`}><div className={`max-w-[94%] rounded-3xl border p-4 md:max-w-[78%] ${m.role==="user"?"border-violet-400/20 bg-violet-500/10":"border-white/10 bg-white/[.035]"}`}>{m.fileName&&<div className="mb-3 flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/60"><FileUp size={15}/>{m.fileName}</div>}<div className="whitespace-pre-wrap text-sm leading-7 text-white/80">{m.content}</div></div></div>)}{busy&&<div className="flex justify-start"><div className="flex items-center gap-2 rounded-3xl border border-white/10 bg-white/[.035] p-4 text-xs text-white/40"><Loader2 size={17} className="animate-spin text-violet-300"/> Thinking…</div></div>}</div>
        <div className="absolute inset-x-0 bottom-0 border-t border-white/10 bg-[#07070a]/90 px-3 py-3 backdrop-blur-xl md:px-8 md:pb-7"><div className="mx-auto max-w-4xl"><div className="mb-2 flex gap-2 overflow-x-auto md:hidden"><button onClick={()=>setMode("general")} className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] ${mode==="general"?"bg-white text-black":"bg-white/5 text-white/50"}`}>General</button><button onClick={()=>setMode("code")} className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] ${mode==="code"?"bg-white text-black":"bg-white/5 text-white/50"}`}>Code</button><button onClick={()=>setMode("analyze")} className={`whitespace-nowrap rounded-full px-3 py-1 text-[11px] ${mode==="analyze"?"bg-white text-black":"bg-white/5 text-white/50"}`}>Analyze</button></div>{attachment&&<div className="mb-2 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[.035] p-2 text-xs text-white/60">{preview?<img src={preview} className="h-10 w-10 rounded-lg object-cover" alt="Preview"/>:<FileUp size={17}/>}<span className="min-w-0 flex-1 truncate">{attachment.name}</span><button onClick={()=>{setAttachment(null);setPreview(null)}} className="rounded-full p-1 hover:bg-white/10"><X size={14}/></button></div>}<div className="rounded-3xl border border-white/10 bg-white/[.045] p-2 shadow-2xl"><div className="flex items-end gap-2"><input ref={fileRef} type="file" hidden accept="image/*,.pdf,.txt,.md,.csv,.json,.js,.jsx,.ts,.tsx,.css,.html,.py,.java,.c,.cpp,.h,.hpp,.sql,.sh,.xml,.yaml,.yml,.go,.rs,.php,.rb,.swift,.kt,.dart,.vue,.svelte,.zip" onChange={e=>pickFile(e.target.files?.[0])}/><button onClick={()=>fileRef.current?.click()} title="Attach file" className="mb-1 rounded-2xl border border-white/10 p-3 text-white/55 hover:bg-white/5 hover:text-white"><Paperclip size={19}/></button><textarea value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}}} placeholder={mode==="code"?"Ask me to build, debug or edit code…":mode==="analyze"?"Ask about the attached file…":"Message CreateX AI…"} className="min-h-12 max-h-36 flex-1 resize-none bg-transparent px-2 py-3 text-sm outline-none placeholder:text-white/25"/><button onClick={send} disabled={busy||(!text.trim()&&!attachment)} className="mb-1 rounded-2xl bg-white p-3 text-black disabled:opacity-30"><Send size={19}/></button></div></div><p className="mt-2 text-center text-[10px] text-white/20">Chats are saved to your account. Images, documents, code and ZIP projects can be attached.</p></div></div></section>
    </div></main>;
}
