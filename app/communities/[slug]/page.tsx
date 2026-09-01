"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, Globe2, Lock, Send, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { joinCommunity, leaveCommunity } from "@/lib/supabase/communities";

export default function NexusPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const [community, setCommunity] = useState<any>(null);
  const [member, setMember] = useState(false);
  const [members, setMembers] = useState(0);
  const [posts, setPosts] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    const { data: c } = await supabase.from("communities").select("id,name,slug,description,is_private,owner_id,created_at").eq("slug", params.slug).maybeSingle();
    if (!c) { setError("Nexus not found."); return; }
    setCommunity(c);
    const { data: { user } } = await supabase.auth.getUser();
    const { count } = await supabase.from("community_members").select("user_id", { count: "exact", head: true }).eq("community_id", c.id);
    setMembers(count || 0);
    if (user) { const { data: m } = await supabase.from("community_members").select("user_id").eq("community_id", c.id).eq("user_id", user.id).maybeSingle(); setMember(!!m); }
    const { data: cp } = await supabase.from("community_posts").select("id,post_id,author_id,created_at,posts(id,content,created_at)").eq("community_id", c.id).order("created_at", { ascending: false }).limit(30);
    setPosts(cp || []);
  }
  useEffect(() => { load(); }, [params.slug]);

  async function toggle() { if (!community) return; setBusy(true); try { if (member) await leaveCommunity(community.id); else await joinCommunity(community.id); await load(); } catch (e) { setError(e instanceof Error ? e.message : "Could not update membership."); } finally { setBusy(false); } }

  async function publish(e: FormEvent) { e.preventDefault(); if (!text.trim() || !community) return; setBusy(true); setError(""); const { data: { user } } = await supabase.auth.getUser(); if (!user) { setError("Please sign in first."); setBusy(false); return; } const { data: p, error: pe } = await supabase.from("posts").insert({ author_id: user.id, content: text.trim() }).select("id").single(); if (!pe && p) { const { error: ce } = await supabase.from("community_posts").insert({ community_id: community.id, author_id: user.id, post_id: p.id }); if (ce) setError(ce.message); else { setText(""); await load(); } } else if (pe) setError(pe.message); setBusy(false); }

  if (error && !community) return <main className="shell"><Link href="/communities" className="backLink"><ArrowLeft size={16}/> Communities</Link><p className="errorText">{error}</p></main>;
  if (!community) return <main className="shell"><div className="panel">Loading Nexus…</div></main>;
  return <main className="shell"><header className="topbar"><Link href="/communities" className="backLink"><ArrowLeft size={16}/> Communities</Link><button className={member ? "secondary" : "primary"} onClick={toggle} disabled={busy}>{busy ? "…" : member ? "Leave Nexus" : "Join Nexus"}</button></header><section className="nexusHero panel"><div className="communityIcon">{community.is_private ? <Lock size={22}/> : <Globe2 size={22}/>}</div><div><div className="eyebrow">{community.is_private ? "PRIVATE NEXUS" : "PUBLIC NEXUS"}</div><h1>{community.name}</h1><p>{community.description}</p><div className="communityMeta"><span><Users size={15}/> {members} members</span><span>Created {new Date(community.created_at).toLocaleDateString()}</span></div></div></section>{error&&<p className="errorText">{error}</p>}{member&&<form className="composer panel" onSubmit={publish}><textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Share something with this Nexus…" maxLength={1000}/><button className="primary" disabled={busy}><Send size={16}/> Post</button></form>}<section className="feedList">{posts.map(x=><article className="postCard" key={x.id}><div className="postTop"><div className="miniAvatar">N</div><div><b>Nexus member</b><span>{new Date(x.created_at).toLocaleString()}</span></div></div><p className="postContent">{x.posts?.content || ""}</p></article>)}{!posts.length&&<div className="panel emptyState"><b>No posts yet.</b><span>{member ? "Start the first conversation." : "Join this Nexus to participate."}</span></div>}</section></main>;
}
