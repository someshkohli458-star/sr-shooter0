"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Check, Sparkles, Zap, Loader2 } from "lucide-react";

const packs = [
  { code: "starter", name: "Starter", credits: 50, price: "₹99", note: "For trying CreateX AI" },
  { code: "creator", name: "Creator", credits: 150, price: "₹249", note: "Best for regular creators", popular: true },
  { code: "pro", name: "Pro", credits: 400, price: "₹599", note: "For heavy creative work" },
] as const;

export default function PricingPage() {
  const [loading, setLoading] = useState("");
  const [message, setMessage] = useState("");
  async function buy(packCode: string) {
    if (loading) return;
    setLoading(packCode); setMessage("");
    try {
      const res = await fetch("/api/credits/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ packCode }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setMessage(data.error || "Please sign in to buy credits."); return; }
      setMessage(`Order ${data.order.id.slice(0, 8)} created. Payment gateway connection is next.`);
    } catch { setMessage("Network error. Please try again."); } finally { setLoading(""); }
  }
  return <main className="min-h-screen bg-[#07070a] text-white">
    <nav className="border-b border-white/10 bg-black/20 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8"><Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400"><Sparkles size={19}/></span><span className="font-black">CreateX AI</span></Link><Link href="/dashboard" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5">Dashboard</Link></div></nav>
    <section className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-24"><div className="mx-auto max-w-2xl text-center"><p className="text-sm font-semibold text-violet-300">Credits</p><h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">Create more. Pay only when you create.</h1><p className="mt-5 text-white/45">Simple credit packs for AI images and videos. No subscription required in this MVP.</p></div>
      <div className="mt-12 grid gap-5 md:grid-cols-3">{packs.map(pack => <article key={pack.code} className={`relative rounded-3xl border p-7 ${pack.popular ? "border-violet-400/50 bg-violet-500/[.09]" : "border-white/10 bg-white/[.035]"}`}>{pack.popular&&<span className="absolute right-5 top-5 rounded-full bg-white px-3 py-1 text-[10px] font-black uppercase tracking-wider text-black">Popular</span>}<Zap className="text-violet-300" size={20}/><h2 className="mt-5 text-xl font-bold">{pack.name}</h2><p className="mt-1 text-sm text-white/35">{pack.note}</p><div className="mt-7 flex items-end gap-2"><span className="text-4xl font-black">{pack.price}</span><span className="pb-1 text-sm text-white/35">one-time</span></div><div className="mt-6 flex items-center gap-2 text-lg font-bold"><Sparkles size={17} className="text-cyan-300"/>{pack.credits} credits</div><ul className="mt-6 space-y-3 text-sm text-white/55"><li className="flex gap-2"><Check size={16} className="mt-0.5 text-violet-300"/>AI image generations</li><li className="flex gap-2"><Check size={16} className="mt-0.5 text-violet-300"/>AI video generations</li><li className="flex gap-2"><Check size={16} className="mt-0.5 text-violet-300"/>Private creation library</li></ul><button onClick={()=>buy(pack.code)} disabled={!!loading} className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-black disabled:opacity-50">{loading===pack.code&&<Loader2 size={15} className="animate-spin"/>}{loading===pack.code?"Creating order...":"Buy credits"}</button></article>)}</div>
      {message&&<div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-violet-400/20 bg-violet-400/5 p-4 text-center text-sm text-violet-200">{message}</div>}
      <div className="mx-auto mt-10 max-w-3xl rounded-3xl border border-white/10 bg-white/[.025] p-6 text-center"><p className="text-sm text-white/45">Payment gateway is not connected yet. The order and credit fulfillment layer is ready for the provider webhook.</p><Link href="/create" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-violet-300">Start creating <ArrowRight size={15}/></Link></div>
    </section>
  </main>;
}
