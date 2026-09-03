import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { data, error } = await supabase.from("createx_chats").select("id,title,created_at,updated_at").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(50);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ chats: data || [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const title = String(body.title || "New chat").trim().slice(0, 100) || "New chat";
  const { data, error } = await supabase.from("createx_chats").insert({ user_id: user.id, title }).select("id,title,created_at,updated_at").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ chat: data });
}

export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "");
  const title = String(body.title || "").trim().slice(0, 100);
  if (!id || !title) return NextResponse.json({ error: "Chat id and title are required." }, { status: 400 });
  const { data, error } = await supabase.from("createx_chats").update({ title, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id).select("id,title,created_at,updated_at").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ chat: data });
}

export async function DELETE(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const id = String(body.id || "");
  if (!id) return NextResponse.json({ error: "Chat id is required." }, { status: 400 });
  const { error } = await supabase.from("createx_chats").delete().eq("id", id).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
