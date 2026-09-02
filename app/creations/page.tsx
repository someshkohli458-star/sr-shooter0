"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Clapperboard, Image as ImageIcon, Loader2, Sparkles, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Creation = { id: string; type: "image" | "video"; prompt: string; result_url: string | null; status: "pending" | "completed" | "failed"; settings: Record<string, unknown>; created_at: string };

export default function CreationsPage() {
  const [items, setItems] = useState<Creation[]>([]);
  const [filter, setFilter] = useState<"all" | "image" | "video">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/auth"; return; }
      const { data } = await supabase.from("createx_generations").select("id,type,prompt,result_url,status,settings,created_at").order("created_at", { ascending: false });
      setItems((data as Creation[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  async function remove(id: string) {
    const supabase = createClient();
    const { error } = await supabase.from("createx_generations").delete().eq("id", id);
    if (!error) setItems(items.filter(x => x.id !== id));
  }

  const visible = filter === "all" ? items : items.filter(x => x.type === filter);

  return <main className="min-h-screen bg-[#07070a] text-white"><nav className="border-b border-white/10 bg-black/20"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4"><Link href="/dashboard" className="flex items-center gap-2 text-sm text-white/60"><ArrowLeft size={16}/> Dashboard</Link><Link href="/" className="flex items-center gap-2 font-black"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400"><Sparkles size={17}/></span>CreateX AI</Link><Link href="/create" className="rounded-xl bg-white px-4 py-2 text-xs font-bold text-black">Create</Link></div></nav>
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-300">Library</p><h1 className="mt-2 text-4xl font-black">My creations</h1><p className="mt-2 text-sm text-white/40">Every generation, prompt and result in one place.</p></div>
      <div className="mt-7 flex gap-2 rounded-2xl border border-white/10 bg-white/[.025] p-1 w-fit">{(["all","image","video"] as const).map(x=><button key={x} onClick={()=>setFilter(x)} className={`rounded-xl px-4 py-2 text-xs font-semibold ${filter===x?"bg-white text-black":"text-white/45 hover:text-white"}`}>{x === "all" ? "All" : x === "image" ? "Images" : "Videos"}</button>)}</div>
      {loading ? <div className="mt-12 flex justify-center text-white/40"><Loader2 className="animate-spin"/></div> : visible.length === 0 ? <div className="mt-10 rounded-3xl border border-dashed border-white/10 p-16 text-center"><Sparkles className="mx-auto text-violet-300"/><h2 className="mt-4 font-bold">No creations yet</h2><p className="mt-2 text-sm text-white/35">Start with a prompt and your generations will show up here.</p><Link href="/create" className="mt-6 inline-block rounded-xl bg-white px-4 py-2 text-xs font-bold text-black">Open studio</Link></div> : <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{visible.map(item=><article key={item.id} className="overflow-hidden rounded-3xl border border-white/10 bg-white/[.035]"><div className="aspect-[4/3] grid place-items-center bg-black/30">{item.result_url ? item.type === "image" ? <img src={item.result_url} alt={item.prompt} className="h-full w-full object-cover"/> : <video src={item.result_url} controls className="h-full w-full object-cover"/> : item.status === "pending" ? <Loader2 className="animate-spin text-violet-300"/> : item.type === "image" ? <ImageIcon className="text-white/15" size={42}/> : <Clapperboard className="text-white/15" size={42}/>}</div><div className="p-5"><div className="flex items-center justify-between"><span className="text-[11px] font-bold uppercase tracking-wider text-violet-300">{item.type} · {item.status}</span><button onClick={()=>remove(item.id)} className="text-white/25 hover:text-red-300" aria-label="Delete creation"><Trash2 size={15}/></button></div><p className="mt-3 line-clamp-3 text-sm leading-6 text-white/65">{item.prompt}</p><p className="mt-3 text-[11px] text-white/25">{new Date(item.created_at).toLocaleString()}</p></div></article>)}</div>}
    </div></main>;
}
