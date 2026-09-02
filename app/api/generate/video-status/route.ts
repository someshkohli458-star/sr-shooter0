import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
const BUCKET = "createx-generations";
export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Generation id is required" }, { status: 400 });
  const { data: generation, error } = await supabase.from("createx_generations").select("id,type,prompt,status,result_path,settings,created_at,updated_at").eq("id", id).eq("user_id", user.id).single();
  if (error || !generation) return NextResponse.json({ error: "Generation not found" }, { status: 404 });
  if (generation.type !== "video") return NextResponse.json({ error: "Not a video generation" }, { status: 400 });
  if (generation.status === "completed") {
    const signed = generation.result_path ? await supabase.storage.from(BUCKET).createSignedUrl(generation.result_path, 3600) : null;
    return NextResponse.json({ status: "completed", progress: 100, result_url: signed?.data?.signedUrl || null });
  }
  const settings = generation.settings as Record<string, unknown>;
  const providerId = String(settings?.provider_id || "");
  if (!providerId) return NextResponse.json({ status: generation.status, progress: 0 });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "OPENAI_API_KEY is not configured" }, { status: 503 });
  const response = await fetch(`https://api.openai.com/v1/videos/${encodeURIComponent(providerId)}`, { headers: { Authorization: `Bearer ${apiKey}` }, cache: "no-store" });
  const provider = await response.json().catch(() => ({}));
  if (!response.ok) return NextResponse.json({ error: provider?.error?.message || "Unable to check video status" }, { status: 502 });
  if (provider.status === "failed") {
    const cost = Number(settings?.cost || 0);
    if (cost > 0) await supabase.rpc("refund_createx_credit", { p_user_id: user.id, p_amount: cost, p_generation_id: id });
    await supabase.from("createx_generations").update({ status: "failed", settings: { ...settings, provider_status: "failed", provider_error: provider.error?.message || "Video generation failed" }, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id);
    return NextResponse.json({ status: "failed", progress: provider.progress || 0, error: provider.error?.message || "Video generation failed" });
  }
  if (provider.status !== "completed") {
    await supabase.from("createx_generations").update({ settings: { ...settings, provider_status: provider.status, progress: provider.progress || 0 }, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id);
    return NextResponse.json({ status: provider.status, progress: provider.progress || 0 });
  }
  const content = await fetch(`https://api.openai.com/v1/videos/${encodeURIComponent(providerId)}/content`, { headers: { Authorization: `Bearer ${apiKey}` }, cache: "no-store" });
  if (!content.ok) return NextResponse.json({ status: "in_progress", progress: 99, error: "Video finished but download is not ready yet" });
  const bytes = Buffer.from(await content.arrayBuffer());
  const storagePath = `${user.id}/${generation.id}.mp4`;
  const { error: uploadError } = await supabase.storage.from(BUCKET).upload(storagePath, bytes, { contentType: "video/mp4", upsert: true });
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });
  const completedSettings = { ...settings, provider_status: "completed", progress: 100 };
  const { error: updateError } = await supabase.from("createx_generations").update({ status: "completed", result_path: storagePath, result_url: null, settings: completedSettings, updated_at: new Date().toISOString() }).eq("id", id).eq("user_id", user.id);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
  const signed = await supabase.storage.from(BUCKET).createSignedUrl(storagePath, 3600);
  return NextResponse.json({ status: "completed", progress: 100, result_url: signed.data?.signedUrl || null });
}
