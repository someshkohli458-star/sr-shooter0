import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "AI is not configured yet. Add OPENAI_API_KEY in Vercel." }, { status: 503 });

  const response = await fetch("https://api.openai.com/v1/realtime/client_secrets", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      session: {
        type: "realtime",
        model: process.env.OPENAI_REALTIME_MODEL || "gpt-realtime-2.1",
        instructions: "You are CreateX AI voice assistant. Be concise, friendly, and helpful. Speak naturally and help with creative ideas, coding, debugging, and general questions."
      }
    })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) return NextResponse.json({ error: data?.error?.message || "Could not start voice session." }, { status: response.status >= 500 ? 502 : response.status });
  return NextResponse.json({ client_secret: data?.value || data?.client_secret?.value || data?.client_secret, model: process.env.OPENAI_REALTIME_MODEL || "gpt-realtime-2.1" });
}
