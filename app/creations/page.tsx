"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Clapperboard, Download, Expand, Image as ImageIcon, Loader2, Sparkles, Trash2, X } from "lucide-react";

type Creation = { id: string; type: "image" | "video"; prompt: string; result_url: string | null; result_path: string | null; status: "pending" | "completed" | "failed"; settings: Record<string, unknown>; created_at: string };

export default function CreationsPage() {
  const [items, setItems] = useState<Creation[]>([]);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<Creation | null>(null);

  async function load() {
    setLoading(true);
    const response = await fetch("/api/creations", { cache: "no-store" });
    if (response.status === 401) { window.location.href = "/auth"; return; }
    const json = await response.json();
    setItems((json.creations as Creation[]) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    const response = await fetch(`/api/creations?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    if (response.ok) setItems(current => current.filter(x => x.id !== id));
  }

  async function download(item: Creation) {
    if (!item.result_url) return;
    const response = await fetch(item.result_url);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `createx-${item.id}.${item.type === "image" ? "png" : "mp4"}`;
    document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
  }

  const visible = filter === "all" ? items : items.filter(x => x.type === filter);

  return <main className="min-h-screen bg-[#07070a] text-white"><nav className="border-b border-white/10 bg-black/20"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><Link href="/dashboard" className="flex items-center gap-2 text-sm text-white/60"><ArrowLeft size={16}/> Dashboard</Link><Link href="/" className="flex items-center gap-2 font-black"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400"><Sparkles size={17}/></span>CreateX AI</Link><Link href="/create" className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-black">Create</Link></div></nav>
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-300">Library</p><h1 className="mt-2 text-4xl font-black">My creations</h1><p className="mt-2 text-sm text-white/40">Your private AI gallery. Signed previews expire automatically.</p></div>
      <div className="mt-7 flex gap-2 rounded-2xl border border-white/10 bg-white/[.025] p-1 w-fit">{(["all","image","video"] as const).map(x=><button key={x} onClick={()=>setFilter(x)} className={`rounded-xl px-4 py-2 text-xs font-semibold ${filter===x?"bg-white text-black":"text-white/45 hover:text-white"}`}>{x === "all" ? "All" : x === "image" ? "Images" : "Videos"}</button>)}</div>
      {loading ? <div className="mt-12 flex justify-center text-white/40"><Loader2 className="animate-spin"/></div> : visible.length === 0 ? <div className="mt-10 rounded-3xl border border-dashed border-white/10 p-16 text-center"><Sparkles className="mx-auto text-violet-300"/><h2 className="mt-4 font-bold">No creations yet</h2><p className="mt-2 text-sm text-white/35">Start with a prompt and your generations will show up here.</p><Link href="/create" className="mt-6 inline-block rounded-xl bg-white px-4 py-2 text-xs font-bold text-black">Open studio</Link></div> : <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visible.map(item=><article key={item.id} className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[.035]"><div className="relative aspect-[4/3] grid place-items-center bg-black/30">{item.result_url ? item.type === "image" ? <img src={item.result_url} alt={item.prompt} className="h-full w-full object-cover"/> : <video src={item.result_url} controls className="h-full w-full object-cover"/> : item.status === "pending" ? <Loader2 className="animate-spin text-violet-300"/> : item.type === "image" ? <ImageIcon className="text-white/15" size={42}/> : <Clapperboard className="text-white/15" size={42}/>} {item.result_url && <div className="absolute right-3 top-3 flex gap-2 opacity-0 transition group-hover:opacity-100"><button onClick={()=>setPreview(item)} className="grid h-9 w-9 place-items-center rounded-xl bg-black/70 backdrop-blur" aria-label="Preview"><Expand size={15}/></button><button onClick={()=>download(item)} className="grid h-9 w-9 place-items-center rounded-xl bg-black/70 backdrop-blur" aria-label="Download"><Download size={15}/></button></div>}</div><div className="p-5"><div className="flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-wider text-violet-300">{item.type} · {item.status}</span><button onClick={()=>remove(item.id)} className="text-white/25 hover:text-red-300" aria-label="Delete creation"><Trash2 size={15}/></button></div><p className="mt-3 line-clamp-3 text-sm leading-6 text-white/65">{item.prompt}</p><p className="mt-3 text-[11px] text-white/25">{new Date(item.created_at).toLocaleString()}</p></div></article>)}</div>}
    </div>
    {preview && <div className="fixed inset-0 z-50 grid place-items-center bg-black/90 p-4 backdrop-blur-sm" onClick={()=>setPreview(null)}><div className="relative max-h-[92vh] max-w-6xl" onClick={e=>e.stopPropagation()}><button onClick={()=>setPreview(null)} className="absolute -right-2 -top-12 grid h-9 w-9 place-items-center rounded-full bg-white/10"><X size={18}/></button>{preview.type === "image" ? <img src={preview.result_url || ""} alt={preview.prompt} className="max-h-[85vh] max-w-full rounded-2xl object-contain"/> : <video src={preview.result_url || ""} controls autoPlay className="max-h-[85vh] max-w-full rounded-2xl"/>}<button onClick={()=>download(preview)} className="mx-auto mt-4 flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-black"><Download size={14}/> Download</button></div></div>}
  </main>;
}
