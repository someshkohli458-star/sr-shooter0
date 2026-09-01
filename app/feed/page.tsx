"use client";

import { FormEvent, useEffect, useState } from "react";
import { Heart, MessageCircle, Plus, Send, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Post { id: string; content: string; created_at: string; likes: number; comments: number; }

export default function FeedPage() {
  const supabase = createClient();
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadPosts() {
    const { data, error } = await supabase.from("posts").select("id, content, created_at").order("created_at", { ascending: false }).limit(30);
    if (error) { setError(error.message); return; }
    setPosts((data || []).map((p) => ({ ...p, likes: 0, comments: 0 })));
  }

  useEffect(() => {
    loadPosts();
    const channel = supabase.channel("aura-feed").on("postgres_changes", { event: "*", schema: "public", table: "posts" }, loadPosts).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  async function createPost(e: FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setBusy(true); setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Please sign in first."); setBusy(false); return; }
    const { error } = await supabase.from("posts").insert({ author_id: user.id, content: content.trim() });
    if (error) setError(error.message); else setContent("");
    setBusy(false);
  }

  return (
    <main className="shell feedShell">
      <header className="topbar"><div className="brand">AURA <span>+</span> NEXUS</div><div className="eyebrow">PULSE</div></header>
      <section className="pageHeading"><div className="eyebrow">LIVE NETWORK</div><h1>What’s happening?</h1><p>Share an idea, thought or moment with your Nexus.</p></section>
      <form className="composer panel" onSubmit={createPost}>
        <div className="composerIcon"><Sparkles size={20}/></div>
        <textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Drop something into the Pulse…" maxLength={1000} />
        <button className="primary" disabled={busy}><Send size={16}/> {busy ? "Posting…" : "Post"}</button>
      </form>
      {error && <p className="errorText">{error}</p>}
      <section className="feedList">
        {posts.map((post) => <article className="postCard" key={post.id}>
          <div className="postTop"><div className="miniAvatar">A</div><div><b>Aura member</b><span>{new Date(post.created_at).toLocaleString()}</span></div></div>
          <p className="postContent">{post.content}</p>
          <div className="postActions"><button><Heart size={17}/> {post.likes}</button><button><MessageCircle size={17}/> {post.comments}</button></div>
        </article>)}
        {!posts.length && <div className="panel emptyState"><Plus size={20}/><b>Be the first signal.</b><span>Create the first post in your Pulse.</span></div>}
      </section>
    </main>
  );
}
