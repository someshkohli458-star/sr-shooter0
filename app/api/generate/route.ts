import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_PROMPT_LENGTH = 4000;
const MAX_REFERENCE_BYTES = 50 * 1024 * 1024;
const SORA_API_SHUTDOWN = Date.UTC(2026, 8, 24, 0, 0, 0);

function imageSize(aspect: string) { if (aspect === "9:16") return "1024x1536"; if (aspect === "16:9") return "1536x1024"; return "1024x1024"; }
function videoSeconds(duration: string) { if (duration === "10s") return "8"; if (duration === "15s") return "12"; return "4"; }
function videoSize(aspect: string) { return aspect === "9:16" ? "720x1280" : "1280x720"; }

async function refundDaily(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, type: "image" | "video") {
  await supabase.rpc("refund_createx_daily_generation", { p_user_id: userId, p_type: type });
}

function dataUrlToFile(dataUrl: string): File {
  const match = dataUrl.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/);
  if (!match) throw new Error("Invalid reference image");
  const mime = match[1] === "image/jpg" ? "image/jpeg" : match[1];
  const bytes = Buffer.from(match[2], "base64");
  if (bytes.length > MAX_REFERENCE_BYTES) throw new Error("Reference image is too large (max 50MB)");
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
  if (prompt.length > MAX_PROMPT_LENGTH) return NextResponse.json({ error: `Prompt is too long. Maximum ${MAX_PROMPT_LENGTH} characters.` }, { status: 400 });

  if (type === "video" && (Date.now() >= SORA_API_SHUTDOWN || process.env.OPENAI_VIDEO_ENABLED === "false")) {
    return NextResponse.json({ error: "Video generation is temporarily unavailable while CreateX AI upgrades its video provider.", code: "VIDEO_PROVIDER_UNAVAILABLE" }, { status: 503 });
  }

  const aspect = String(body.aspect || "16:9");
  const quality = String(body.quality || "HD");
  const duration = String(body.duration || "5s");
  const referenceData = type === "image" && typeof body.referenceData === "string" ? body.referenceData : "";
  const settings = { aspect, quality, duration: type === "video" ? duration : null, has_reference: Boolean(referenceData) };

  const { data: usage, error: usageError } = await supabase.rpc("consume_createx_daily_generation", { p_user_id: user.id, p_type: type });
  if (usageError) {
    const message = usageError.message || "Daily generation limit reached";
    return NextResponse.json({ error: message.includes("limit reached") ? `Daily ${type} limit reached. You can generate up to 10 ${type}s per day.` : message, code: "DAILY_LIMIT_REACHED" }, { status: 429 });
  }

  const { data: generation, error: insertError } = await supabase.from("createx_generations").insert({ user_id: user.id, type, prompt, settings, status: "pending" }).select("id,type,prompt,status,settings,created_at").single();
  if (insertError) {
    await refundDaily(supabase, user.id, type);
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    await refundDaily(supabase, user.id, type);
    await supabase.from("createx_generations").update({ status: "failed" }).eq("id", generation.id).eq("user_id", user.id);
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured" }, { status: 503 });
  }

  try {
    if (type === "video") {
      const form = new FormData();
      form.append("model", process.env.OPENAI_VIDEO_MODEL || "sora-2");
      form.append("prompt", prompt);
      form.append("seconds", videoSeconds(duration));
      form.append("size", videoSize(aspect));
      const response = await fetch("https://api.openai.com/v1/videos", { method: "POST", headers: { Authorization: `Bearer ${apiKey}` }, body: form });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result?.id) throw new Error(result?.error?.message || "Video provider failed");
      const nextSettings = { ...settings, provider: "openai", provider_model: result.model || process.env.OPENAI_VIDEO_MODEL || "sora-2", provider_id: result.id, provider_status: result.status || "queued", daily_usage: usage };
      const { data: updated, error } = await supabase.from("createx_generations").update({ settings: nextSettings, updated_at: new Date().toISOString() }).eq("id", generation.id).eq("user_id", user.id).select("id,type,prompt,status,settings,created_at,updated_at").single();
      if (error) throw error;
      return NextResponse.json({ generation: updated, provider: "openai-sora", providerId: result.id, usage }, { status: 202 });
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
    const { data: completed, error: updateError } = await supabase.from("createx_generations").update({ status: "completed", result_path: storagePath, result_url: null, settings: { ...settings, daily_usage: usage }, updated_at: new Date().toISOString() }).eq("id", generation.id).eq("user_id", user.id).select("id,type,prompt,status,result_path,settings,created_at,updated_at").single();
    if (updateError) throw updateError;
    return NextResponse.json({ generation: completed, provider: "openai", usage });
  } catch (error) {
    await refundDaily(supabase, user.id, type);
    await supabase.from("createx_generations").update({ status: "failed", updated_at: new Date().toISOString() }).eq("id", generation.id).eq("user_id", user.id);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Generation request failed" }, { status: 502 });
  }
}
