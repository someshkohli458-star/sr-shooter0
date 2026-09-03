import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_MESSAGES = 30;
const MAX_IMAGE_CHARS = 7_000_000;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: "AI is not configured yet. Add OPENAI_API_KEY in Vercel." }, { status: 503 });
  }

  const body = await request.json().catch(() => null);
  const messages = Array.isArray(body?.messages) ? body.messages : [];
  if (!messages.length || messages.length > MAX_MESSAGES) {
    return NextResponse.json({ error: "Invalid conversation." }, { status: 400 });
  }

  const input = messages.map((message: any) => {
    const role = message?.role === "assistant" ? "assistant" : "user";
    const text = typeof message?.content === "string" ? message.content.slice(0, 12000) : "";
    const image = typeof message?.image === "string" ? message.image : null;
    if (image && image.length > MAX_IMAGE_CHARS) throw new Error("Image is too large. Please use an image under 5 MB.");
    if (role === "user" && image) {
      return { role, content: [
        ...(text ? [{ type: "input_text", text }] : []),
        { type: "input_image", image_url: image, detail: "high" },
      ] };
    }
    return { role, content: text };
  });

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: JSON.stringify({
        model: "gpt-5.6-luna",
        instructions: "You are CreateX AI Assistant. Be helpful, concise, creative and honest. Analyze uploaded images carefully when present. Help users brainstorm, discuss ideas, write prompts, and understand images. Do not claim to see details that are not visible.",
        input,
        max_output_tokens: 1200,
      }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) return NextResponse.json({ error: data?.error?.message || "AI request failed." }, { status: response.status >= 500 ? 502 : 400 });
    const text = data?.output_text || data?.output?.flatMap((item: any) => item.content || []).filter((part: any) => part.type === "output_text").map((part: any) => part.text).join("\n") || "I couldn't generate a response.";
    return NextResponse.json({ text });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unable to reach AI." }, { status: 500 });
  }
}
