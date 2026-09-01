"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Compass, LogOut, MessageCircle, Sparkles, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ensureProfile } from "@/lib/supabase/profile";

export default function DashboardPage() {
  const [profile, setProfile] = useState<{ username: string; full_name: string | null } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ensureProfile().then(setProfile).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function signOut() {
    await createClient().auth.signOut();
    window.location.href = "/auth";
  }

  return (
    <main className="shell">
      <header className="topbar">
        <Link href="/" className="brand">AURA <span>+</span> NEXUS</Link>
        <button className="ghost" onClick={signOut}><LogOut size={16} /> Sign out</button>
      </header>

      <section className="pageHeading">
        <div className="eyebrow">YOUR CONTROL CENTER</div>
        <h1>{loading ? "Loading your Aura…" : `Welcome${profile?.full_name ? `, ${profile.full_name}` : ""}.`}</h1>
        <p>Your identity, communities and conversations — connected in one place.</p>
      </section>

      <section className="dashboardGrid">
        <Link href="/profile" className="dashboardCard"><Sparkles size={24}/><div><h2>Your Aura</h2><p>{profile ? `@${profile.username}` : "Complete your profile and build your identity."}</p></div><ArrowRight size={18}/></Link>
        <Link href="/communities" className="dashboardCard"><Users size={24}/><div><h2>Your Nexus</h2><p>Discover communities and find your people.</p></div><ArrowRight size={18}/></Link>
        <Link href="/" className="dashboardCard"><Compass size={24}/><div><h2>Pulse</h2><p>Explore fresh ideas and conversations.</p></div><ArrowRight size={18}/></Link>
        <Link href="/messages" className="dashboardCard"><MessageCircle size={24}/><div><h2>Messages</h2><p>Continue your conversations.</p></div><ArrowRight size={18}/></Link>
      </section>
    </main>
  );
}
