"use client";

import { useEffect, useState } from "react";
import { Heart, MessageCircle, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function Engagement({ postId }: { postId: string }) {
  const supabase = createClient();
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState<{ id: string; content: string }[]>([]);
  const [text, setText] = useState("");

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    const { count } = await supabase.from("post_likes").select("id", { count: "exact", head: true }).eq("post_id", postId);
    setLikes(count || 0);
    if (user) {
      const { data } = await supabase.from("post_likes").select("id").eq("post_id", postId).eq("user_id", user.id).maybeSingle();
      setLiked(!!data);
    }
    const { data: rows } = await supabase.from("comments").select("id, content").eq("post_id", postId).order("created_at", { ascending: true }).limit(20);
    setComments(rows || []);
  }

  useEffect(() => {
    load();
    const channel = supabase.channel(`engagement-${postId}`).on("postgres_changes", { event: "*", schema: "public", table: "post_likes", filter: `post_id=eq.${postId}` }, load).on("postgres_changes", { event: "*", schema: "public", table: "comments", filter: `post_id=eq.${postId}` }, load).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [postId]);

  async function toggleLike() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    if (liked) await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
    else await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
    load();
  }

  async function addComment() {
    if (!text.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("comments").insert({ post_id: postId, user_id: user.id, content: text.trim() });
    setText(""); load();
  }

  return <div className="engagement">
    <div className="postActions"><button onClick={toggleLike} className={liked ? "activeAction" : ""}><Heart size={17} fill={liked ? "currentColor" : "none"}/> {likes}</button><span><MessageCircle size={17}/> {comments.length}</span></div>
    <div className="commentList">{comments.map(c => <p key={c.id}>{c.content}</p>)}</div>
    <div className="commentBox"><input value={text} onChange={e => setText(e.target.value)} placeholder="Add a thought…" maxLength={500}/><button onClick={addComment} aria-label="Comment"><Send size={16}/></button></div>
  </div>;
}
