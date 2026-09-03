"use client";

import Link from "next/link";
import { ArrowUpRight, BarChart3, Bot, Code2, ExternalLink, Gauge, ImageIcon, LayoutDashboard, MessageSquare, Settings2, ShieldCheck, Sparkles, Users, Video } from "lucide-react";

const cards = [
  { title: "Overview", href: "/admin", desc: "System health, usage and operational snapshot.", icon: LayoutDashboard },
  { title: "Feature Manager", href: "/admin/features", desc: "Enable, disable and manage product features.", icon: Settings2 },
  { title: "Website Control", href: "/admin/website-control", desc: "Control which sections are visible to visitors.", icon: Gauge },
  { title: "Developer", href: "/admin/developer", desc: "Manage public developer information.", icon: Users },
  { title: "Branding", href: "/admin/branding", desc: "Manage official and developer logos.", icon: Sparkles },
  { title: "Public Preview", href: "/", desc: "Open the live CreateX AI experience.", icon: ExternalLink },
];

const metrics = [
  ["AI Images", "10 / day", "Free allowance", ImageIcon],
  ["AI Videos", "10 / day", "Free allowance", Video],
  ["AI Chat", "Unlimited", "Available", MessageSquare],
  ["Code Studio", "Active", "Sandbox preview", Code2],
];

export default function Admin() {
  return (
    <main className="min-h-screen bg-[#050507] text-white selection:bg-violet-400/30">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_10%_0%,rgba(124,58,237,.18),transparent_30%),radial-gradient(circle_at_90%_10%,rgba(34,211,238,.10),transparent_28%)]" />
      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <header className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.28em] text-violet-300/80"><ShieldCheck size={14} /> CreateX AI / Control Center</div>
              <h1 className="text-3xl font-black tracking-tight sm:text-5xl">Admin <span className="bg-gradient-to-r from-violet-300 via-fuchsia-200 to-cyan-200 bg-clip-text text-transparent">Workspace</span></h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50 sm:text-base">Manage the product without touching the public experience. This area is protected by the admin route guard.</p>
            </div>
            <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-5 py-3 text-sm font-semibold transition hover:bg-white/[0.1]">View site <ArrowUpRight size={16} /></Link>
          </div>
        </header>

        <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {metrics.map(([title, value, note, Icon]) => {
            const MetricIcon = Icon as typeof Sparkles;
            return <div key={String(title)} className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 sm:p-5"><MetricIcon size={18} className="text-violet-300" /><div className="mt-4 text-xl font-bold sm:text-2xl">{value}</div><div className="mt-1 text-xs font-semibold text-white/80">{title}</div><div className="mt-1 text-[11px] text-white/35">{note}</div></div>;
          })}
        </section>

        <section className="mt-5 grid gap-4 lg:grid-cols-[1.35fr_.65fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.035] p-5 sm:p-7">
            <div className="flex items-center justify-between"><div><div className="text-[10px] uppercase tracking-[.25em] text-white/35">Operations</div><h2 className="mt-2 text-xl font-bold">Control modules</h2></div><BarChart3 className="text-cyan-300" size={21} /></div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {cards.map(({ title, href, desc, icon: Icon }) => <Link key={title} href={href} className="group rounded-3xl border border-white/8 bg-black/20 p-4 transition hover:border-violet-400/30 hover:bg-white/[0.055]"><div className="flex items-start justify-between"><div className="rounded-2xl border border-white/10 bg-white/[0.06] p-2.5"><Icon size={18} className="text-white/75" /></div><ArrowUpRight size={16} className="text-white/20 transition group-hover:text-white/60" /></div><h3 className="mt-4 font-semibold">{title}</h3><p className="mt-1 text-xs leading-5 text-white/40">{desc}</p></Link>)}
            </div>
          </div>

          <div className="rounded-[28px] border border-violet-400/15 bg-gradient-to-b from-violet-500/[0.10] to-white/[0.025] p-5 sm:p-7">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.2em] text-violet-200"><Bot size={16} /> AI system</div>
            <h2 className="mt-4 text-2xl font-black">Production-ready foundation.</h2>
            <p className="mt-3 text-sm leading-6 text-white/45">Server-side API keys, authenticated AI routes, daily free limits and sandboxed code previews are kept separate from the public UI.</p>
            <div className="mt-6 space-y-3 text-xs">
              {["Authentication", "Generation limits", "Realtime voice", "Private creations"].map((item) => <div key={item} className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/20 px-4 py-3"><span className="text-white/60">{item}</span><span className="flex items-center gap-2 text-emerald-300"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> Ready</span></div>)}
            </div>
            <div className="mt-5 rounded-2xl border border-amber-300/10 bg-amber-300/[0.04] p-4 text-[11px] leading-5 text-amber-100/55">Admin access requires either <code className="text-amber-100/80">ADMIN_EMAIL</code> in the server environment or a Supabase <code className="text-amber-100/80">app_metadata.role</code> of <code className="text-amber-100/80">admin</code>.</div>
          </div>
        </section>
      </div>
    </main>
  );
}
