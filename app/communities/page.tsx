"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, Globe2, Lock, Plus, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { joinCommunity, leaveCommunity } from "@/lib/supabase/communities";

type Community={id:string;name:string;slug:string;description:string;is_private:boolean;owner_id:string};
export default function CommunitiesPage(){
 const supabase=createClient(); const [items,setItems]=useState<Community[]>([]); const [joined,setJoined]=useState<Set<string>>(new Set()); const [busy,setBusy]=useState<string|null>(null); const [error,setError]=useState("");
 async function load(){const {data:{user}}=await supabase.auth.getUser();const {data,error}=await supabase.from("communities").select("id,name,slug,description,is_private,owner_id").order("created_at",{ascending:false});if(error){setError(error.message);return;}setItems(data||[]);if(user){const {data:m}=await supabase.from("community_members").select("community_id").eq("user_id",user.id);setJoined(new Set((m||[]).map(x=>x.community_id)));}}
 useEffect(()=>{load()},[]);
 async function toggle(c:Community){setBusy(c.id);setError("");try{if(joined.has(c.id))await leaveCommunity(c.id);else await joinCommunity(c.id);await load()}catch(e){setError(e instanceof Error?e.message:"Action failed.")}finally{setBusy(null)}}
 return <main className="shell"><header className="topbar"><Link href="/" className="brand">AURA <span>+</span> NEXUS</Link><Link href="/communities/create" className="primary"><Plus size={16}/> Create</Link></header><section className="pageHeading"><div className="eyebrow">NEXUS</div><h1>Find your people.</h1><p>Communities built around ideas, interests and missions.</p></section>{error&&<p className="errorText">{error}</p>}<section className="communityGrid">{items.map(c=><article className="communityCard" key={c.id}><div className="communityIcon">{c.is_private?<Lock size={20}/>:<Globe2 size={20}/>}</div><div className="communityBody"><div className="eyebrow">{c.is_private?"PRIVATE":"PUBLIC"}</div><h2>{c.name}</h2><p>{c.description||"A new Nexus is forming."}</p><div className="communityMeta"><span><Users size={15}/> Community</span><button className={joined.has(c.id)?"secondary":"primary"} onClick={()=>toggle(c)} disabled={busy===c.id}>{busy===c.id?"…":joined.has(c.id)?"Leave":"Join"}</button><Link href={`/communities/${c.slug}`}><ArrowRight size={17}/></Link></div></div></article>)}</section></main>;
}
