"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/admin";
  return value;
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [next, setNext] = useState("/admin");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNext(safeNext(params.get("next")));
    if (params.get("error") === "not_admin") {
      setMessage("This account is signed in, but it does not have admin access.");
    }
    if (params.get("error") === "admin_config") {
      setMessage("Admin access is not configured yet. Set ADMIN_EMAIL or grant the account the admin role.");
    }
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    const supabase = createClient();
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      window.location.replace(next);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Admin sign in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#050507] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(124,58,237,.16),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(34,211,238,.07),transparent_25%)]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8">
        <section className="w-full rounded-3xl border border-white/10 bg-[#0b0b10]/95 p-6 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-8">
          <Link href="/" className="mb-7 inline-flex items-center gap-2 text-xs text-white/35 hover:text-white"><ArrowLeft size={14}/> Back to CreateX</Link>
          <div className="mb-7">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-400/15 bg-violet-400/[.06] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[.2em] text-violet-200"><ShieldCheck size={13}/> Admin access</div>
            <h1 className="text-3xl font-semibold tracking-[-.04em]">Admin sign in</h1>
            <p className="mt-2 text-xs leading-5 text-white/35">Use the same email/password account that has been granted admin access.</p>
          </div>

          <form onSubmit={submit} className="space-y-3">
            <label className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/[.035] px-4 focus-within:border-violet-400/40">
              <Mail size={16} className="text-white/30"/>
              <input required type="email" autoComplete="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Admin email" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/20"/>
            </label>
            <label className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/[.035] px-4 focus-within:border-violet-400/40">
              <LockKeyhole size={16} className="text-white/30"/>
              <input required minLength={6} type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/20"/>
              <button type="button" onClick={()=>setShow(v=>!v)} className="text-white/30 hover:text-white" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff size={16}/> : <Eye size={16}/>}</button>
            </label>
            <button disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50">
              {loading ? "Checking access…" : "Sign in to admin"}<ArrowRight size={16}/>
            </button>
          </form>

          {message && <div className="mt-4 rounded-2xl border border-amber-300/15 bg-amber-300/[.05] p-3 text-xs leading-5 text-amber-100/75">{message}</div>}
          <p className="mt-6 text-center text-[10px] text-white/20">Admin authorization is checked on the server after sign in.</p>
        </section>
      </div>
    </main>
  );
}
