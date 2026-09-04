"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Image as ImageIcon, Menu, MessageCircle, Paperclip, Sparkles, X } from "lucide-react";

const prompts = [
  ["Chat", "Ask anything, brainstorm, learn or code.", "/chat", MessageCircle],
  ["Create", "Generate images and videos from a prompt.", "/create", Sparkles],
  ["Library", "Keep your creations and conversations together.", "/creations", ImageIcon],
] as const;

export default function Home() {
  const [menu, setMenu] = useState(false);
  const [prompt, setPrompt] = useState("");

  function startChat() {
    const value = prompt.trim();
    window.location.href = value ? `/chat?prompt=${encodeURIComponent(value)}` : "/chat";
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <header className="sticky top-0 z-50 border-b border-white/[.08] bg-[#080808]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/createx-logo.svg" alt="CreateX AI" className="h-8 w-8" />
            <span className="text-sm font-semibold tracking-tight">CreateX <span className="text-violet-300">AI</span></span>
          </Link>
          <nav className="hidden items-center gap-7 text-xs text-white/45 md:flex">
            <Link href="/chat" className="hover:text-white">Chat</Link>
            <Link href="/create" className="hover:text-white">Create</Link>
            <Link href="/creations" className="hover:text-white">Library</Link>
          </nav>
          <div className="hidden items-center gap-2 md:flex">
            <Link href="/auth?mode=signin" className="rounded-xl px-3 py-2 text-xs text-white/55 hover:text-white">Log in</Link>
            <Link href="/auth?mode=signup" className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-black hover:bg-white/90">Sign up</Link>
          </div>
          <button onClick={() => setMenu(v => !v)} aria-label="Open menu" className="rounded-xl border border-white/10 bg-white/[.03] p-2 text-white/65 md:hidden">
            {menu ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
        {menu && <div className="border-t border-white/[.08] bg-[#0b0b0b] px-4 py-3 md:hidden">
          <div className="grid gap-1">
            <Link onClick={() => setMenu(false)} href="/chat" className="rounded-xl px-3 py-3 text-sm text-white/65 hover:bg-white/5">Chat</Link>
            <Link onClick={() => setMenu(false)} href="/create" className="rounded-xl px-3 py-3 text-sm text-white/65 hover:bg-white/5">Create</Link>
            <Link onClick={() => setMenu(false)} href="/creations" className="rounded-xl px-3 py-3 text-sm text-white/65 hover:bg-white/5">Library</Link>
            <Link onClick={() => setMenu(false)} href="/auth?mode=signin" className="mt-1 rounded-xl px-3 py-3 text-sm text-white/65 hover:bg-white/5">Log in</Link>
            <Link onClick={() => setMenu(false)} href="/auth?mode=signup" className="rounded-xl bg-white px-3 py-3 text-center text-sm font-semibold text-black">Sign up</Link>
          </div>
        </div>}
      </header>

      <section className="relative mx-auto flex min-h-[calc(100vh-56px)] max-w-4xl flex-col items-center justify-center px-4 pb-20 pt-14 text-center md:px-6">
        <div className="pointer-events-none absolute inset-x-0 top-20 mx-auto h-80 max-w-3xl rounded-full bg-violet-500/[.07] blur-3xl" />
        <div className="relative">
          <div className="mx-auto mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.035] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[.18em] text-white/45">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> CreateX AI workspace
          </div>
          <h1 className="text-4xl font-semibold leading-tight tracking-[-.055em] sm:text-5xl md:text-6xl">
            What can I help you<br className="hidden sm:block" /> <span className="text-white/35">create today?</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-6 text-white/35 md:text-base">
            Chat, analyze files, write code, generate images and create videos — all from one simple workspace.
          </p>

          <div className="mx-auto mt-8 max-w-2xl rounded-3xl border border-white/10 bg-[#111111] p-2 text-left shadow-2xl shadow-black/50">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); startChat(); } }}
              rows={2}
              placeholder="Message CreateX AI…"
              className="min-h-20 w-full resize-none bg-transparent px-3 py-2 text-sm outline-none placeholder:text-white/25 md:text-base"
            />
            <div className="flex items-center justify-between gap-2 px-1 pb-1">
              <div className="flex items-center gap-1.5 text-[10px] text-white/30">
                <Link href="/chat" className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-2.5 py-2 hover:bg-white/5 hover:text-white/60"><Paperclip size={13}/> Files</Link>
                <Link href="/create" className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 px-2.5 py-2 hover:bg-white/5 hover:text-white/60"><Sparkles size={13}/> Create</Link>
              </div>
              <button onClick={startChat} disabled={!prompt.trim()} className="grid h-9 w-9 place-items-center rounded-2xl bg-white text-black transition hover:bg-white/90 disabled:opacity-30" aria-label="Start chat">
                <ArrowUpRight size={17} />
              </button>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <button onClick={() => { setPrompt("Explain this concept simply: "); }} className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] text-white/35 hover:bg-white/5 hover:text-white/60">Explain something</button>
            <button onClick={() => { setPrompt("Help me build a modern website for "); }} className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] text-white/35 hover:bg-white/5 hover:text-white/60">Build a website</button>
            <button onClick={() => { window.location.href = "/create"; }} className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] text-white/35 hover:bg-white/5 hover:text-white/60">Create an image</button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-16 md:px-6">
        <div className="mb-5 flex items-end justify-between">
          <div><p className="text-[10px] font-semibold uppercase tracking-[.2em] text-white/25">Workspace</p><h2 className="mt-2 text-2xl font-semibold tracking-[-.04em]">Everything in one place.</h2></div>
          <Link href="/dashboard" className="text-xs text-white/30 hover:text-white">Dashboard <ArrowUpRight size={13} className="inline" /></Link>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {prompts.map(([title, description, href, Icon]) => <Link key={title} href={href} className="group rounded-2xl border border-white/10 bg-white/[.025] p-5 transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[.04]">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[.035] text-violet-200"><Icon size={18}/></div>
            <h3 className="mt-5 text-base font-semibold">{title}</h3>
            <p className="mt-1.5 text-xs leading-5 text-white/30">{description}</p>
            <ArrowUpRight size={15} className="mt-5 text-white/25 transition group-hover:text-white/70" />
          </Link>)}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-5 text-[10px] uppercase tracking-[.16em] text-white/20">
          <span>10 images / day</span><span>10 videos / day</span><span>Unlimited chat</span><span>Private library</span>
        </div>
      </section>

      <footer className="border-t border-white/[.08] px-4 py-6">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 text-[10px] text-white/20 sm:flex-row sm:items-center sm:justify-between">
          <span>© 2026 CreateX AI</span>
          <div className="flex gap-5"><Link href="/developer" className="hover:text-white/50">Developer</Link><Link href="/auth" className="hover:text-white/50">Login / Sign up</Link></div>
        </div>
      </footer>
    </main>
  );
}
