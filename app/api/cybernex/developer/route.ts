import { NextResponse } from "next/server";
export async function GET(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if(!url||!key) return NextResponse.json({error:"Supabase environment is not configured"},{status:503});
  const r=await fetch(`${url}/rest/v1/developer_profile?select=name,bio,avatar_url,instagram_primary,instagram_secondary,email,tagline&limit=1`,{headers:{apikey:key,Authorization:`Bearer ${key}`},cache:"no-store"});
  if(!r.ok) return NextResponse.json({error:"Unable to load developer profile"},{status:502});
  const rows=await r.json();
  return NextResponse.json(rows?.[0]??null);
}
