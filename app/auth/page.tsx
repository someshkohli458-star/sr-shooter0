"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    if (!supabase) {
      setMessage("Supabase environment variables are not configured yet.");
      setLoading(false);
      return;
    }
    const result = mode === "signin"
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });
    setMessage(result.error?.message ?? (mode === "signin" ? "Welcome back to AURA." : "Account created. Check your email if confirmation is enabled."));
    setLoading(false);
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="eyebrow">AURA + NEXUS</div>
        <h1>{mode === "signin" ? "Enter your world." : "Create your Aura."}</h1>
        <p>One account for your identity, communities and conversations.</p>
        <form onSubmit={submit}>
          <label>Email<input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label>
          <label>Password<input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" /></label>
          <button className="primary-btn" disabled={loading}>{loading ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}</button>
        </form>
        {message && <div className="auth-message">{message}</div>}
        <button className="switch-btn" onClick={() => setMode(mode === "signin" ? "signup" : "signin")}>
          {mode === "signin" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
