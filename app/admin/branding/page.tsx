"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ImagePlus, Save, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function BrandingPage(){
 const [developerLogo,setDeveloperLogo]=useState("");
 const [officialLogo,setOfficialLogo]=useState("");
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState("");
 useEffect(()=>{
  const supabase=createClient();
  supabase.from("branding_settings").select("developer_logo_url, official_logo_url").eq("id",true).single().then(({data,error})=>{
   if(error){setMessage(error.message);return}
   if(data){setDeveloperLogo(data.developer_logo_url||"");setOfficialLogo(data.official_logo_url||"")}
  });
 },[]);
 async function uploadLogo(file:File,kind:"developer"|"official"){
  setMessage("");
  const supabase=createClient();
  const ext=file.name.split(".").pop()||"png";
  const path=`${kind}-${Date.now()}.${ext}`;
  const {error}=await supabase.storage.from("branding-assets").upload(path,file,{upsert:true,contentType:file.type||"image/png",cacheControl:"3600"});
  if(error)return setMessage(error.message);
  const {data}=supabase.storage.from("branding-assets").getPublicUrl(path);
  kind==="developer"?setDeveloperLogo(data.publicUrl):setOfficialLogo(data.publicUrl);
 }
 async function save(){
  setSaving(true);setMessage("");
  const supabase=createClient();
  const {data:{user}}=await supabase.auth.getUser();
  if(!user){setMessage("Admin login required.");setSaving(false);return}
  const {error}=await supabase.from("branding_settings").update({developer_logo_url:developerLogo||null,official_logo_url:officialLogo||null,updated_by:user.id,updated_at:new Date().toISOString()}).eq("id",true);
  setSaving(false);setMessage(error?error.message:"Branding saved successfully.");
 }
 function Picker({kind,value,label,onChange}:{kind:"developer"|"official";value:string;label:string;onChange:(v:string)=>void}){
  return <div className="panel space-y-4"><div className="flex items-center gap-2"><ImagePlus size={18}/><h2>{label}</h2></div><div className="h-32 border border-lime-500/30 bg-black flex items-center justify-center overflow-hidden">{value?<img src={value} alt={label} className="max-h-24 max-w-[80%] object-contain"/>:<span className="text-xs opacity-50">No logo selected</span>}</div><input type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" onChange={e=>e.target.files?.[0]&&uploadLogo(e.target.files[0],kind)} className="block w-full text-xs"/><input value={value} onChange={e=>onChange(e.target.value)} placeholder="Or paste image URL" className="w-full bg-black border border-lime-500/40 p-2 text-xs"/></div>
 }
 return <main className="shell"><Link href="/admin" className="backLink"><ArrowLeft size={16}/> Admin</Link><section className="pageHeading"><div className="eyebrow"><ShieldCheck size={14}/> BRANDING CONTROL</div><h1>Logo Manager</h1><p>Update developer and official branding from the admin panel.</p></section><div className="grid md:grid-cols-2 gap-4"><Picker kind="developer" value={developerLogo} onChange={setDeveloperLogo} label="Developer Logo"/><Picker kind="official" value={officialLogo} onChange={setOfficialLogo} label="Official Logo"/></div><button onClick={save} disabled={saving} className="mt-4 bg-lime-400 text-black px-5 py-2 text-sm font-bold inline-flex items-center gap-2"><Save size={16}/>{saving?"Saving...":"Save Branding"}</button>{message&&<p className="mt-3 text-xs opacity-80">{message}</p>}</main>;
}