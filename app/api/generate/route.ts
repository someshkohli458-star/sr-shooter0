import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function imageCost(quality: string) { return quality === "Ultra" ? 2 : 1; }
function imageSize(aspect: string) { if (aspect === "9:16") return "1024x1536"; if (aspect === "16:9") return "1536x1024"; return "1024x1024"; }
function videoSeconds(duration: string) { if (duration === "10s") return "8"; if (duration === "15s") return "12"; return "4"; }
function videoSize(aspect: string) { return aspect === "9:16" ? "720x1280" : "1280x720"; }
function videoCost(duration: string) { if (duration === "10s") return 5; if (duration === "15s") return 7; return 3; }

async function refund(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, amount: number, generationId: string) {
  await supabase.rpc("refund_createx_credit", { p_user_id: userId, p_amount: amount, p_generation_id: generationId });
}

function dataUrlToFile(dataUrl: string): File {
  const match = dataUrl.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/);
  if (!match) throw new Error("Invalid reference image");
  const mime = match[1] === "image/jpg" ? "image/jpeg" : match[1];
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.length > 50 * 1024 * 1024) throw new Error("Reference image is too large (max 50MB)");
  const ext = mime.split("/")[1] === "jpeg" ? "jpg" : mime.split("/")[1];
  return new File([bytes], `reference.${ext}`, { type: mime });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const type = body.type === "video" ? "video" : "image";
  const prompt = String(body.prompt || "").trim();
  if (!prompt) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  const aspect = String(body.aspect || "16:9");
  const quality = String(body.quality || "HD");
  const duration = String(body.duration || "5s");
  const referenceData = type === "image" && typeof body.referenceData === "string" ? body.referenceData : "";
  const cost = type === "image" ? imageCost(quality) : videoCost(duration);
  const settings = { aspect, quality, duration: type === "video" ? duration : null, cost, has_reference: Boolean(referenceData) };

  const { data: generation, error: insertError } = await supabase.from("createx_generations").insert({ user_id: user.id, type, prompt, settings, status: "pending" }).select("id,type,prompt,status,settings,created_at").single();
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

  const { data: remaining, error: creditError } = await supabase.rpc("consume_createx_credit", { p_user_id: user.id, p_amount: cost, p_generation_id: generation.id });
  if (creditError) {
    await supabase.from("createx_generations").delete().eq("id", generation.id).eq("user_id", user.id);
    return NextResponse.json({ error: creditError.message.includes("Insufficient") ? "Insufficient credits" : creditError.message, code: "INSUFFICIENT_CREDITS" }, { status: 402 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    await refund(supabase, user.id, cost, generation.id);
    await supabase.from("createx_generations").update({ status: "failed" }).eq("id", generation.id).eq("user_id", user.id);
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured" }, { status: 503 });
  }

  try {
    if (type === "video") {
      const response = await fetch("https://api.openai.com/v1/videos", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "sora-2", prompt, seconds: videoSeconds(duration), size: videoSize(aspect) }) });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result?.id) throw new Error(result?.error?.message || "Video provider failed");
      const nextSettings = { ...settings, provider: "openai", provider_id: result.id, provider_status: result.status || "queued" };
      const { data: updated, error } = await supabase.from("createx_generations").update({ settings: nextSettings, updated_at: new Date().toISOString() }).eq("id", generation.id).eq("user_id", user.id).select("id,type,prompt,status,settings,created_at,updated_at").single();
      if (error) throw error;
      return NextResponse.json({ generation: updated, provider: "openai-sora-2", providerId: result.id, credits: remaining }, { status: 202 });
    }

    let response: Response;
    if (referenceData) {
      const form = new FormData();
      form.append("model", "gpt-image-2"); form.append("prompt", prompt); form.append("size", imageSize(aspect)); form.append("quality", quality === "Ultra" ? "high" : "medium"); form.append("output_format", "png"); form.append("image[]", dataUrlToFile(referenceData));
      response = await fetch("https://api.openai.com/v1/images/edits", { method: "POST", headers: { Authorization: `Bearer ${apiKey}` }, body: form });
    } else {
      response = await fetch("https://api.openai.com/v1/images/generations", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: "gpt-image-2", prompt, size: imageSize(aspect), quality: quality === "Ultra" ? "high" : "medium", output_format: "png" }) });
    }
    const result = await response.json().catch(() => ({}));
    const b64 = result?.data?.[0]?.b64_json;
    if (!response.ok || !b64) throw new Error(result?.error?.message || "Image provider failed");
    const bytes = Buffer.from(b64, "base64");
    const storagePath = `${user.id}/${generation.id}.png`;
    const { error: uploadError } = await supabase.storage.from("createx-generations").upload(storagePath, bytes, { contentType: "image/png", upsert: true });
    if (uploadError) throw uploadError;
    const { data: completed, error: updateError } = await supabase.from("createx_generations").update({ status: "completed", result_path: storagePath, result_url: null, updated_at: new Date().toISOString() }).eq("id", generation.id).eq("user_id", user.id).select("id,type,prompt,status,result_path,settings,created_at,updated_at").single();
    if (updateError) throw updateError;
    return NextResponse.json({ generation: completed, provider: "openai", credits: remaining });
  } catch (error) {
    await refund(supabase, user.id, cost, generation.id);
    await supabase.from("createx_generations").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", generation.id).eq("user_id", user.id);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Generation request failed" }, { status: 502 });
  }
}
