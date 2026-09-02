import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function imageCost(quality: string) {
  return quality === "Ultra" ? 2 : 1;
}

function imageSize(aspect: string) {
  if (aspect === "9:16") return "1024x1536";
  if (aspect === "16:9") return "1536x1024";
  return "1024x1024";
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
  const cost = type === "image" ? imageCost(quality) : ({ "5s": 3, "10s": 5, "15s": 7 }[duration] || 3);
  const settings = { aspect, quality, duration: type === "video" ? duration : null, cost };

  const { data: generation, error: insertError } = await supabase
    .from("createx_generations")
    .insert({ user_id: user.id, type, prompt, settings, status: "pending" })
    .select("id,type,prompt,status,settings,created_at")
    .single();
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 400 });

  const { data: remaining, error: creditError } = await supabase.rpc("consume_createx_credit", {
    p_user_id: user.id,
    p_amount: cost,
  });
  if (creditError) {
    await supabase.from("createx_generations").delete().eq("id", generation.id).eq("user_id", user.id);
    const message = creditError.message.includes("Insufficient") ? "Insufficient credits" : creditError.message;
    return NextResponse.json({ error: message, code: "INSUFFICIENT_CREDITS" }, { status: 402 });
  }

  if (type === "video") {
    return NextResponse.json({ generation, provider: "video-pending", credits: remaining }, { status: 202 });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    await supabase.from("createx_generations").update({ status: "failed" }).eq("id", generation.id).eq("user_id", user.id);
    return NextResponse.json({ error: "OPENAI_API_KEY is not configured" }, { status: 503 });
  }

  try {
    const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "gpt-image-2",
        prompt,
        size: imageSize(aspect),
        quality: quality === "Ultra" ? "high" : "medium",
        output_format: "png",
      }),
    });

    const result = await openaiResponse.json().catch(() => ({}));
    if (!openaiResponse.ok || !result?.data?.[0]?.b64_json) {
      await supabase.from("createx_generations").update({ status: "failed" }).eq("id", generation.id).eq("user_id", user.id);
      return NextResponse.json({ error: result?.error?.message || "Image provider failed" }, { status: 502 });
    }

    const resultUrl = `data:image/png;base64,${result.data[0].b64_json}`;
    const { data: completed, error: updateError } = await supabase
      .from("createx_generations")
      .update({ status: "completed", result_url: resultUrl, updated_at: new Date().toISOString() })
      .eq("id", generation.id)
      .eq("user_id", user.id)
      .select("id,type,prompt,status,result_url,settings,created_at,updated_at")
      .single();

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 });
    return NextResponse.json({ generation: completed, provider: "openai", credits: remaining });
  } catch {
    await supabase.from("createx_generations").update({ status: "failed" }).eq("id", generation.id).eq("user_id", user.id);
    return NextResponse.json({ error: "Image generation request failed" }, { status: 502 });
  }
}
