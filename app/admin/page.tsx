"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Activity, ArrowLeft, Shield, Users, FileText, AlertTriangle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AdminPage() {
  const supabase = createClient();
  const [stats, setStats] = useState({ users: 0, posts: 0, reports: 0, communities: 0 });
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
      const isAdmin = profile?.role === "admin" || profile?.role === "owner";
      setAllowed(isAdmin);
      if (!isAdmin) { setLoading(false); return; }
      const [{ count: users }, { count: posts }, { count: reports }, { count: communities }] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("posts").select("id", { count: "exact", head: true }),
        supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
        supabase.from("communities").select("id", { count: "exact", head: true })
      ]);
      setStats({ users: users || 0, posts: posts || 0, reports: reports || 0, communities: communities || 0 });
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <main className="shell"><div className="panel">Loading admin console…</div></main>;
  if (!allowed) return <main className="shell"><Link href="/" className="backLink"><ArrowLeft size={16}/> Home</Link><section className="panel emptyState"><Shield size={30}/><b>Admin access required.</b><span>This area is restricted to authorized administrators.</span></section></main>;

  const cards = [
    ["Users", stats.users, Users], ["Posts", stats.posts, FileText], ["Open reports", stats.reports, AlertTriangle], ["Nexuses", stats.communities, Activity]
  ];
  return <main className="shell adminShell">
    <header className="topbar"><Link href="/" className="backLink"><ArrowLeft size={16}/> Home</Link><span className="adminBadge"><Shield size={15}/> ADMIN CONSOLE</span></header>
    <section className="pageHeading"><div className="eyebrow">CONTROL CENTER</div><h1>Command the network.</h1><p>Moderation, activity and platform health in one place.</p></section>
    <section className="adminGrid">{cards.map(([label,value,Icon])=><div className="panel adminStat" key={String(label)}><Icon size={20}/><span>{label}</span><strong>{value as number}</strong></div>)}</section>
    <section className="panel adminActions"><h2>Admin tools</h2><div className="actionGrid"><Link href="/admin/reports">Review reports</Link><Link href="/admin/users">Manage users</Link><Link href="/admin/communities">Manage Nexuses</Link><Link href="/admin/activity">Activity logs</Link></div></section>
  </main>;
}
