"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Sparkles } from "lucide-react";

export default function AuthPage() {
  const [signup, setSignup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(signup ? "Account setup ready — Supabase Auth integration comes next." : "Login form ready — authentication connection comes next.");
  }

  return (
    <main className="min-h-screen bg-[#07070a] text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 py-10 md:grid-cols-2 md:px-8">
        <section className="hidden md:block">
          <Link href="/" className="inline-flex items-center gap-3 text-sm text-white/70">
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-400"><Sparkles size={19}/></span>
            <span className="font-bold">CreateX AI</span>
          </Link>
          <h1 className="mt-12 text-6xl font-black tracking-[-.05em]">Your ideas.<br/><span className="bg-gradient-to-r from-violet-300 via-fuchsia-300 to-cyan-300 bg-clip-text text-transparent">Your studio.</span></h1>
          <p className="mt-6 max-w-md text-base leading-7 text-white/40">Sign in to keep your creations, credits and generation history together in one creative workspace.</p>
        </section>

        <section className="mx-auto w-full max-w-md rounded-[30px] border border-white/10 bg-white/[.035] p-6 shadow-2xl shadow-violet-950/20 backdrop-blur md:p-8">
          <div className="mb-8 md:hidden"><Link href="/" className="flex items-center gap-2 font-bold"><span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400"><Sparkles size={17}/></span>CreateX AI</Link></div>
          <div className="text-xs font-bold uppercase tracking-[.22em] text-violet-300">{signup ? "Create account" : "Welcome back"}</div>
          <h2 className="mt-3 text-3xl font-black">{signup ? "Start creating." : "Continue creating."}</h2>
          <p className="mt-2 text-sm text-white/40">{signup ? "Get started with your creative workspace." : "Sign in to access your studio."}</p>
          <form onSubmit={submit} className="mt-7 space-y-4">
            {signup && <input required type="text" placeholder="Your name" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm outline-none focus:border-violet-400/50"/>}
            <input required type="email" placeholder="Email address" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-sm outline-none focus:border-violet-400/50"/>
            <div className="relative"><input required type={showPassword ? "text" : "password"} placeholder="Password" className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 pr-12 text-sm outline-none focus:border-violet-400/50"/><button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30">{showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}</button></div>
            <button className="flex w-full items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3.5 text-sm font-bold text-black">{signup ? "Create account" : "Sign in"}<ArrowRight size={16}/></button>
          </form>
          {message && <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/5 p-3 text-xs text-emerald-200">{message}</div>}
          <div className="mt-7 text-center text-xs text-white/35">{signup ? "Already have an account?" : "New to CreateX AI?"} <button onClick={()=>{setSignup(!signup);setMessage("")}} className="font-semibold text-violet-300 hover:text-violet-200">{signup ? "Sign in" : "Create account"}</button></div>
        </section>
      </div>
    </main>
  );
}
