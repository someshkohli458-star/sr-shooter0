"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Clapperboard, Image as ImageIcon, LogOut, MessageCircle, Sparkles, WandSparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Creation = { type: "image" | "video" };
type Usage = { images_used: number; images_remaining: number; videos_used: number; videos_remaining: number; chat_unlimited: boolean };

export default function DashboardPage() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("Creator");
  const [usage, setUsage] = useState<Usage>({ images_used: 0, images_remaining: 10, videos_used: 0, videos_remaining: 10, chat_unlimited: true });
  const [counts, setCounts] = useState({ image: 0, video: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/auth"; return; }
      setEmail(user.email ?? "");
      setName(user.user_metadata?.full_name || user.email?.split("@")[0] || "Creator");
      const [{ data: today }, { data: creations }] = await Promise.all([
        supabase.rpc("get_createx_daily_usage", { p_user_id: user.id }),
        supabase.from("createx_generations").select("type").eq("user_id", user.id)
      ]);
      if (today) setUsage(today as Usage);
      const rows = (creations as Creation[]) || [];
      setCounts({ image: rows.filter(x => x.type === "image").length, video: rows.filter(x => x.type === "video").length });
      setLoading(false);
    }
    load();
  }, []);

  async function logout() { const supabase = createClient(); await supabase.auth.signOut(); window.location.href = "/auth"; }

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#07070a] text-white"><div className="flex items-center gap-3 text-white/60"><Sparkles className="animate-pulse" size={18}/> Loading your studio...</div></main>;

  return <main className="min-h-screen bg-[#07070a] text-white">
    <nav className="border-b border-white/10 bg-black/20 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8"><Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400"><Sparkles size={19}/></span><span className="font-black">CreateX AI</span></Link><button onClick={logout} className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/5"><LogOut size={16}/> Logout</button></div></nav>
    <div className="mx-auto max-w-7xl px-5 py-8 md:px-8 md:py-12"><div className="flex flex-col justify-between gap-5 md:flex-row md:items-end"><div><p className="text-sm text-violet-300">Creator dashboard</p><h1 className="mt-2 text-4xl font-black tracking-tight md:text-5xl">Welcome, {name}.</h1><p className="mt-2 text-white/40">{email}</p></div><Link href="/create" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black">Create something <ArrowRight size={16}/></Link></div>
      <section className="mt-8 grid gap-4 md:grid-cols-3"><div className="rounded-3xl border border-violet-400/20 bg-violet-500/[.06] p-6"><div className="flex items-center justify-between"><span className="text-sm text-white/50">Images today</span><ImageIcon size={18} className="text-cyan-300"/></div><div className="mt-5 text-4xl font-black">{usage.images_remaining}<span className="ml-2 text-base font-medium text-white/30">left</span></div><p className="mt-2 text-xs text-white/30">{usage.images_used}/10 used today</p></div><div className="rounded-3xl border border-fuchsia-400/20 bg-fuchsia-500/[.05] p-6"><div className="flex items-center justify-between"><span className="text-sm text-white/50">Videos today</span><Clapperboard size={18} className="text-fuchsia-300"/></div><div className="mt-5 text-4xl font-black">{usage.videos_remaining}<span className="ml-2 text-base font-medium text-white/30">left</span></div><p className="mt-2 text-xs text-white/30">{usage.videos_used}/10 used today</p></div><div className="rounded-3xl border border-white/10 bg-white/[.035] p-6"><div className="flex items-center justify-between"><span className="text-sm text-white/50">AI Chat</span><MessageCircle size={18} className="text-violet-300"/></div><div className="mt-5 text-3xl font-black">Unlimited</div><p className="mt-2 text-xs text-white/30">Chat has no daily generation limit.</p></div></section>
      <section className="mt-8 grid gap-4 md:grid-cols-2"><div className="rounded-3xl border border-white/10 bg-white/[.025] p-6"><p className="text-sm font-semibold text-white/70">Your all-time generations</p><div className="mt-5 flex gap-8"><div><div className="text-3xl font-black">{counts.image}</div><p className="text-xs text-white/30">Images</p></div><div><div className="text-3xl font-black">{counts.video}</div><p className="text-xs text-white/30">Videos</p></div></div></div><Link href="/chat" className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-transparent p-6 hover:border-violet-400/30"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-violet-400/10"><MessageCircle size={21} className="text-violet-300"/></div><h2 className="mt-4 text-xl font-bold">AI Chat</h2><p className="mt-2 text-sm text-white/40">Discuss ideas, analyze images and work with files without using image/video limits.</p></Link></section>
      <section className="mt-8 grid gap-5 md:grid-cols-2"><Link href="/create" className="rounded-3xl border border-white/10 bg-gradient-to-br from-violet-500/10 to-transparent p-7 hover:border-violet-400/30"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-violet-400/10"><WandSparkles size={22} className="text-violet-300"/></div><h2 className="mt-5 text-xl font-bold">AI Creation Studio</h2><p className="mt-2 text-sm leading-6 text-white/40">Create up to 10 images and 10 videos per day on the free plan.</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-violet-300">Open studio <ArrowRight size={15}/></span></Link><Link href="/creations" className="rounded-3xl border border-white/10 bg-white/[.025] p-7 hover:border-white/20"><p className="text-xs font-bold uppercase tracking-[.2em] text-white/30">Library</p><h2 className="mt-4 text-xl font-bold">My creations</h2><p className="mt-2 text-sm leading-6 text-white/40">Browse your generation history, prompts and completed results.</p><span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white/60">View gallery <ArrowRight size={15}/></span></Link></section>
    </div></main>;
}
