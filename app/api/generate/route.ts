import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const type = body.type === "video" ? "video" : "image";
  const prompt = String(body.prompt || "").trim();
  if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });

  const settings = { aspect: body.aspect || "16:9", quality: body.quality || "HD", duration: body.duration || null };
  const { data, error } = await supabase.from("createx_generations").insert({ user_id: user.id, type, prompt, settings, status: "pending" }).select("id,type,prompt,status,settings,created_at").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ generation: data, provider: "pending" }, { status: 202 });
}
