"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function safeNext(value: string | null) {
  if (!value || !value.startsWith("/") || value.startsWith("//")) return "/dashboard";
  return value;
}

export default function AuthPage() {
  const [signup, setSignup] = useState(false);
  const [show, setShow] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [reset, setReset] = useState(false);
  const [resend, setResend] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get("mode");
    const error = params.get("error");
    if (mode === "signup") setSignup(true);
    if (mode === "reset") setReset(true);
    if (error === "verification_failed") setMessage("That verification link is invalid or expired. Please request a new one.");

    const supabase = createClient();
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY") setReset(true);
      if (session && event === "SIGNED_IN" && !reset) {
        window.location.replace(safeNext(params.get("next")));
      }
    });

    supabase.auth.getSession().then(({ data: sessionData }) => {
      if (sessionData.session && !reset) window.location.replace(safeNext(params.get("next")));
    });

    return () => data.subscription.unsubscribe();
  }, [reset]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setResend(false);
    const supabase = createClient();

    try {
      if (reset) {
        if (newPassword.length < 6) throw new Error("Password must be at least 6 characters.");
        if (newPassword !== confirmPassword) throw new Error("Passwords do not match.");
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        setMessage("Password updated successfully. Redirecting to your dashboard…");
        window.setTimeout(() => window.location.replace("/dashboard"), 700);
        return;
      }

      if (forgot) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth?mode=reset`,
        });
        if (error) throw error;
        setMessage("If an account exists for this email, a secure password reset link has been sent.");
        return;
      }

      if (signup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`,
          },
        });
        if (error) throw error;
        setMessage("Account created. Check your email and click the verification link before signing in.");
        setResend(true);
        return;
      }

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        const unverified = error.message.toLowerCase().includes("email not confirmed");
        setResend(unverified);
        throw new Error(unverified ? "Please verify your email first. You can resend the verification email below." : error.message);
      }
      window.location.replace(safeNext(new URLSearchParams(window.location.search).get("next")));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resendVerification() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resend({ type: "signup", email });
    setMessage(error ? error.message : "A new verification email has been sent.");
    setLoading(false);
  }

  const title = reset ? "Create a new password." : forgot ? "Reset your password." : signup ? "Start creating." : "Welcome back.";
  const subtitle = reset
    ? "Choose a new password for your CreateX AI account."
    : forgot
      ? "Enter your email and we’ll send a secure reset link."
      : signup
        ? "Create your free workspace and verify your email to continue."
        : "Sign in to continue to your chats, creations and workspace.";

  return (
    <main className="min-h-screen bg-[#050509] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_10%,rgba(139,92,246,.14),transparent_30%),radial-gradient(circle_at_85%_20%,rgba(34,211,238,.08),transparent_25%)]" />
      <header className="relative z-10 border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <img src="/createx-logo.svg" alt="CreateX AI" className="h-8 w-8" />
            <span className="font-semibold tracking-tight">CreateX <span className="text-violet-300">AI</span></span>
          </Link>
          <Link href="/developer" className="text-xs text-white/35 hover:text-white">About developer</Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-64px)] max-w-6xl items-center gap-12 px-4 py-10 md:grid-cols-[1fr_420px] md:px-6 lg:gap-20">
        <section className="hidden md:block">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.03] px-3 py-1.5 text-[10px] font-medium uppercase tracking-[.18em] text-white/45">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" /> AI workspace
          </div>
          <h1 className="max-w-xl text-6xl font-semibold leading-[.94] tracking-[-.06em] lg:text-7xl">
            Think. Create.<br /><span className="text-white/35">Build with AI.</span>
          </h1>
          <p className="mt-6 max-w-lg text-sm leading-7 text-white/40">
            One focused workspace for conversations, code, files, images and creative work.
          </p>
          <div className="mt-7 flex flex-wrap gap-2 text-[11px] text-white/45">
            <span className="rounded-full border border-white/10 px-3 py-2">10 images / day</span>
            <span className="rounded-full border border-white/10 px-3 py-2">10 videos / day</span>
            <span className="rounded-full border border-white/10 px-3 py-2">Unlimited chat</span>
          </div>
        </section>

        <section className="w-full rounded-3xl border border-white/10 bg-[#0b0b10]/90 p-5 shadow-2xl shadow-black/40 backdrop-blur-xl md:p-7">
          <div className="mb-6">
            <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-violet-300/80">{reset ? "Password recovery" : forgot ? "Account recovery" : signup ? "Create account" : "Sign in"}</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-[-.04em]">{title}</h2>
            <p className="mt-2 text-xs leading-5 text-white/35">{subtitle}</p>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {signup && !forgot && !reset && (
              <label className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/[.035] px-4 focus-within:border-violet-400/40">
                <UserRound size={16} className="text-white/30" />
                <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/20" />
              </label>
            )}

            {!reset && (
              <label className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/[.035] px-4 focus-within:border-violet-400/40">
                <Mail size={16} className="text-white/30" />
                <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email address" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/20" />
              </label>
            )}

            {reset ? (
              <>
                <label className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/[.035] px-4 focus-within:border-violet-400/40">
                  <LockKeyhole size={16} className="text-white/30" />
                  <input required minLength={6} type={show ? "text" : "password"} autoComplete="new-password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="New password" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/20" />
                  <button type="button" onClick={() => setShow((v) => !v)} className="text-white/30 hover:text-white">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </label>
                <label className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/[.035] px-4 focus-within:border-violet-400/40">
                  <ShieldCheck size={16} className="text-white/30" />
                  <input required minLength={6} type="password" autoComplete="new-password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm password" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/20" />
                </label>
              </>
            ) : !forgot && (
              <label className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/[.035] px-4 focus-within:border-violet-400/40">
                <LockKeyhole size={16} className="text-white/30" />
                <input required minLength={6} type={show ? "text" : "password"} autoComplete={signup ? "new-password" : "current-password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/20" />
                <button type="button" onClick={() => setShow((v) => !v)} className="text-white/30 hover:text-white">{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
              </label>
            )}

            {!signup && !forgot && !reset && (
              <div className="text-right"><button type="button" onClick={() => setForgot(true)} className="text-[11px] text-violet-300 hover:text-violet-200">Forgot password?</button></div>
            )}

            <button disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-50">
              {loading ? "Please wait…" : reset ? "Update password" : forgot ? "Send reset link" : signup ? "Create account" : "Sign in"}
              <ArrowRight size={16} />
            </button>
          </form>

          {message && <div className="mt-4 rounded-2xl border border-violet-400/15 bg-violet-400/[.06] p-3 text-xs leading-5 text-white/70">{message}</div>}
          {resend && !reset && !forgot && <button type="button" onClick={resendVerification} disabled={loading} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-300/15 bg-emerald-300/[.04] px-3 py-2.5 text-xs text-emerald-200"> <Mail size={14} /> Resend verification email</button>}

          <div className="mt-6 text-center text-xs text-white/30">
            {reset || forgot ? <button type="button" onClick={() => { setReset(false); setForgot(false); setMessage(""); }} className="text-violet-300 hover:text-violet-200">Back to sign in</button> : <> {signup ? "Already have an account?" : "New to CreateX AI?"} <button type="button" onClick={() => { setSignup((v) => !v); setMessage(""); }} className="font-semibold text-violet-300 hover:text-violet-200">{signup ? "Sign in" : "Create account"}</button></>}
          </div>
          <p className="mt-5 text-center text-[10px] text-white/15">Secure email authentication · Free access · No credits</p>
        </section>
      </div>
    </main>
  );
}
