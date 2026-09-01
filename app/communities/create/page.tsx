"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Globe2, Lock, Sparkles } from "lucide-react";
import { createCommunity } from "@/lib/supabase/communities";

export default function CreateCommunityPage() {
  const [name, setName] = useState(""); const [slug, setSlug] = useState(""); const [description, setDescription] = useState(""); const [privateMode, setPrivateMode] = useState(false); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function submit(e: FormEvent) { e.preventDefault(); setBusy(true); setError(""); try { const c = await createCommunity({ name, slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"), description, is_private: privateMode }); window.location.href = `/communities/${c.slug}`; } catch (err) { setError(err instanceof Error ? err.message : "Could not create community."); } finally { setBusy(false); } }
  return <main className="shell"><Link href="/communities" className="backLink"><ArrowLeft size={16}/> Communities</Link><section className="authCard"><div className="eyebrow"><Sparkles size={14}/> BUILD YOUR NEXUS</div><h1>Create a community</h1><p>Give people a place to gather around an idea, interest or mission.</p><form onSubmit={submit} className="stack"><input required minLength={3} maxLength={80} value={name} onChange={e=>setName(e.target.value)} placeholder="Community name"/><input required minLength={3} maxLength={80} value={slug} onChange={e=>setSlug(e.target.value)} placeholder="nexus-slug"/><textarea maxLength={500} value={description} onChange={e=>setDescription(e.target.value)} placeholder="What is this Nexus about?"/><button type="button" className={`visibility ${privateMode ? "selected" : ""}`} onClick={()=>setPrivateMode(!privateMode)}>{privateMode ? <Lock size={17}/> : <Globe2 size={17}/>} {privateMode ? "Private Nexus" : "Public Nexus"}</button>{error && <p className="errorText">{error}</p>}<button className="primary" disabled={busy}>{busy ? "Creating…" : "Create Nexus"}</button></form></section></main>;
}
