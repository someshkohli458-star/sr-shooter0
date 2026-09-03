import Link from "next/link";
import { ArrowRight, Check, Sparkles, Zap } from "lucide-react";

const features = ["10 AI images per day", "10 AI videos per day", "Unlimited AI chat", "Private creation library", "Image analysis and file chat"];

export default function PricingPage() {
  return <main className="min-h-screen bg-[#07070a] text-white">
    <nav className="border-b border-white/10 bg-black/20 backdrop-blur-xl"><div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 md:px-8"><Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400"><Sparkles size={19}/></span><span className="font-black">CreateX AI</span></Link><Link href="/dashboard" className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/5">Dashboard</Link></div></nav>
    <section className="mx-auto max-w-5xl px-5 py-16 md:px-8 md:py-24"><div className="mx-auto max-w-2xl text-center"><p className="text-sm font-semibold text-violet-300">Free for everyone</p><h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">CreateX AI is free to use.</h1><p className="mt-5 text-white/45">No payments and no credits for now. Everyone gets daily creation limits while AI chat stays unlimited.</p></div>
      <div className="mx-auto mt-12 max-w-xl rounded-[2rem] border border-violet-400/30 bg-gradient-to-br from-violet-500/[.12] to-cyan-500/[.04] p-8 shadow-2xl shadow-violet-950/20"><div className="flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-300">Current plan</p><h2 className="mt-2 text-3xl font-black">Free</h2></div><div className="rounded-2xl bg-white/10 p-3"><Zap className="text-cyan-300" size={24}/></div></div><div className="mt-8 space-y-4">{features.map(feature=><div key={feature} className="flex items-center gap-3 text-sm text-white/70"><Check size={17} className="text-violet-300"/>{feature}</div>)}</div><Link href="/create" className="mt-8 flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-black">Start creating <ArrowRight size={16}/></Link></div>
      <div className="mx-auto mt-8 max-w-xl rounded-3xl border border-white/10 bg-white/[.025] p-6 text-center"><p className="text-sm font-semibold">Pro will come later.</p><p className="mt-2 text-sm leading-6 text-white/40">Plan and usage rules are kept separate from the generation engine, so a future Pro plan can add higher limits, priority generation, extra models and other benefits without rebuilding the core system.</p></div>
    </section>
  </main>;
}
