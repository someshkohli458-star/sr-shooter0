import { NextResponse } from "next/server";
import JSZip from "jszip";
import { createClient } from "@/lib/supabase/server";

const OPENAI_MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-5.6-luna";
const GEMINI_MODEL = process.env.GEMINI_CHAT_MODEL || "gemini-2.5-flash";
const GROQ_MODEL = process.env.GROQ_CHAT_MODEL || "openai/gpt-oss-120b";
const OPENROUTER_MODEL = process.env.OPENROUTER_CHAT_MODEL || "openai/gpt-oss-20b:free";
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_CONTEXT_CHARS = 60000;

const isTextLike = (file: File) =>
  file.type.startsWith("text/") ||
  /\.(js|jsx|ts|tsx|css|scss|html|json|md|py|java|c|cpp|h|hpp|sql|sh|xml|yaml|yml|csv|txt|env|gitignore|go|rs|php|rb|swift|kt|dart|vue|svelte)$/i.test(file.name);

async function zipToText(file: File) {
  const zip = await JSZip.loadAsync(await file.arrayBuffer());
  const entries: string[] = [];
  let total = 0;
  for (const name of Object.keys(zip.files).slice(0, 120)) {
    const entry = zip.files[name];
    if (entry.dir || /(^|\/)node_modules\//i.test(name) || /(^|\/)\.git\//i.test(name)) continue;
    if (total >= MAX_CONTEXT_CHARS) break;
    if (isTextLike(new File([], name))) {
      try {
        const text = (await entry.async("string")).slice(0, 12000);
        entries.push(`FILE: ${name}\n${text}`);
        total += text.length;
      } catch {}
    } else {
      entries.push(`FILE: ${name} [binary or unsupported text]`);
      total += name.length;
    }
  }
  return entries.join("\n\n---\n\n").slice(0, MAX_CONTEXT_CHARS);
}

async function getUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return { supabase, user };
}

function providerError(provider: string, status: number, rawMessage: unknown) {
  const message = String(rawMessage || "AI request failed.");
  const lower = message.toLowerCase();
  if (status === 401 || /incorrect api key|invalid api key|api key/i.test(message)) {
    return { error: `${provider} is not configured correctly. Please check its API key.`, code: "AI_CONFIGURATION", status: 503 };
  }
  if (status === 429 || /billing|quota|insufficient_quota|hard limit|credits|spend limit|rate limit|resource exhausted/i.test(lower)) {
    return { error: `${provider} is temporarily unavailable because its usage or rate limit has been reached.`, code: "AI_RATE_LIMIT", status: 503 };
  }
  if (status >= 500) {
    return { error: `${provider} is temporarily unavailable.`, code: "AI_PROVIDER_UNAVAILABLE", status: 502 };
  }
  return { error: message, code: "AI_REQUEST_FAILED", status: 502 };
}

function isRetryableProviderFailure(status: number, message: string) {
  const lower = message.toLowerCase();
  return status === 401 || status === 408 || status === 409 || status === 429 || status >= 500 || /billing|quota|rate limit|resource exhausted|temporarily unavailable|capacity/i.test(lower);
}

function extractGeminiText(data: any) {
  return data?.candidates?.[0]?.content?.parts
    ?.filter((part: any) => typeof part?.text === "string")
    ?.map((part: any) => part.text)
    ?.join("\n")
    ?.trim() || "";
}

function extractChatText(data: any) {
  const content = data?.choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) return content.filter((p: any) => typeof p?.text === "string").map((p: any) => p.text).join("\n").trim();
  return "";
}

async function callGemini(
  history: Array<{ role: "user" | "model"; parts: any[] }>,
  currentParts: any[],
  instructions: string,
  useSearch: boolean,
) {
  const key = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!key) throw new Error("GEMINI_NOT_CONFIGURED");

  const body: any = {
    system_instruction: { parts: [{ text: instructions }] },
    contents: [...history, { role: "user", parts: currentParts }],
    generationConfig: { maxOutputTokens: 5000 },
  };
  if (useSearch) body.tools = [{ googleSearch: {} }];

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(GEMINI_MODEL)}:generateContent?key=${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data?.error?.message || "Gemini request failed."), { provider: "Gemini", status: response.status });
  const text = extractGeminiText(data);
  if (!text) throw Object.assign(new Error("Gemini returned an empty response."), { provider: "Gemini", status: 502 });
  return { text, model: GEMINI_MODEL, provider: "Gemini" };
}

async function callCompatibleProvider(
  provider: "Groq" | "OpenRouter",
  messages: Array<{ role: "system" | "user" | "assistant"; content: any }>,
) {
  const isGroq = provider === "Groq";
  const key = isGroq ? process.env.GROQ_API_KEY : process.env.OPENROUTER_API_KEY;
  if (!key) throw new Error(`${provider.toUpperCase()}_NOT_CONFIGURED`);
  const url = isGroq ? "https://api.groq.com/openai/v1/chat/completions" : "https://openrouter.ai/api/v1/chat/completions";
  const model = isGroq ? GROQ_MODEL : OPENROUTER_MODEL;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${key}`,
  };
  if (!isGroq) {
    headers["HTTP-Referer"] = process.env.NEXT_PUBLIC_SITE_URL || "https://sr-shooter0.vercel.app";
    headers["X-OpenRouter-Title"] = "CreateX AI";
  }
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify({ model, messages, max_tokens: 5000 }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data?.error?.message || `${provider} request failed.`), { provider, status: response.status });
  const text = extractChatText(data);
  if (!text) throw Object.assign(new Error(`${provider} returned an empty response.`), { provider, status: 502 });
  return { text, model, provider };
}

async function callOpenAI(input: any[], instructions: string, tools: any[]) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) throw new Error("OPENAI_NOT_CONFIGURED");
  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      instructions,
      input,
      tools,
      tool_choice: "auto",
      include: ["web_search_call.action.sources", "code_interpreter_call.outputs"],
      max_output_tokens: 5000,
    }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data?.error?.message || "OpenAI request failed."), { provider: "OpenAI", status: response.status });
  const text = data?.output_text || data?.output?.flatMap((item: any) => item.content || []).filter((part: any) => part.type === "output_text").map((part: any) => part.text).join("\n") || "";
  if (!text.trim()) throw Object.assign(new Error("OpenAI returned an empty response."), { provider: "OpenAI", status: 502 });
  return { text: text.trim(), model: OPENAI_MODEL, provider: "OpenAI" };
}

export async function GET(request: Request) {
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const url = new URL(request.url);
  const chatId = url.searchParams.get("chatId");
  if (chatId) {
    const { data: chat } = await supabase.from("createx_chats").select("id,title,created_at,updated_at").eq("id", chatId).eq("user_id", user.id).maybeSingle();
    if (!chat) return NextResponse.json({ error: "Chat not found." }, { status: 404 });
    const { data: messages, error } = await supabase.from("createx_chat_messages").select("id,role,content,file_name,created_at").eq("chat_id", chatId).eq("user_id", user.id).order("created_at", { ascending: true });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ chat, messages: messages || [] });
  }
  const { data: chats, error } = await supabase.from("createx_chats").select("id,title,created_at,updated_at").eq("user_id", user.id).order("updated_at", { ascending: false }).limit(100);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ chats: chats || [] });
}

export async function PATCH(request: Request) {
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const chatId = String(body.chatId || "");
  const title = String(body.title || "").trim().slice(0, 80);
  if (!chatId || !title) return NextResponse.json({ error: "Chat id and title are required." }, { status: 400 });
  const { data, error } = await supabase.from("createx_chats").update({ title, updated_at: new Date().toISOString() }).eq("id", chatId).eq("user_id", user.id).select("id,title,created_at,updated_at").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ chat: data });
}

export async function DELETE(request: Request) {
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  const chatId = new URL(request.url).searchParams.get("chatId") || "";
  if (!chatId) return NextResponse.json({ error: "Chat id is required." }, { status: 400 });
  const { error } = await supabase.from("createx_chats").delete().eq("id", chatId).eq("user_id", user.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function POST(request: Request) {
  const { supabase, user } = await getUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });

  const form = await request.formData();
  const message = String(form.get("message") || "").trim().slice(0, 12000);
  const mode = String(form.get("mode") || "general");
  const file = form.get("file");
  const requestedChatId = String(form.get("chatId") || "");
  let history: Array<{ role: "user" | "assistant"; content: string }> = [];
  try {
    const parsed = JSON.parse(String(form.get("history") || "[]"));
    if (Array.isArray(parsed)) {
      history = parsed
        .filter((m) => (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string")
        .slice(-20)
        .map((m) => ({ role: m.role, content: m.content.slice(0, 12000) }));
    }
  } catch {}
  if (!message && !(file instanceof File)) return NextResponse.json({ error: "Message or file is required." }, { status: 400 });

  let chatId = requestedChatId;
  if (chatId) {
    const { data: chat } = await supabase.from("createx_chats").select("id").eq("id", chatId).eq("user_id", user.id).maybeSingle();
    if (!chat) chatId = "";
  }
  if (!chatId) {
    const title = (message || (file instanceof File ? file.name : "New chat")).slice(0, 70) || "New chat";
    const { data: chat, error } = await supabase.from("createx_chats").insert({ user_id: user.id, title }).select("id").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    chatId = chat.id;
  }

  const geminiParts: any[] = [];
  const compatibleCurrentParts: any[] = [];
  let openAIContent: any[] = [];
  if (message) {
    geminiParts.push({ text: message });
    compatibleCurrentParts.push(message);
    openAIContent.push({ type: "input_text", text: message });
  }

  const hasImage = file instanceof File && file.type.startsWith("image/");
  let attachedFileName: string | null = null;
  if (file instanceof File && file.size > 0) {
    attachedFileName = file.name;
    if (file.size > MAX_FILE_BYTES) return NextResponse.json({ error: "File too large. Maximum is 8 MB." }, { status: 413 });
    const mime = file.type || "application/octet-stream";
    if (hasImage) {
      const bytes = Buffer.from(await file.arrayBuffer());
      const base64 = bytes.toString("base64");
      geminiParts.push({ inline_data: { mime_type: mime, data: base64 } });
      openAIContent.push({ type: "input_image", image_url: `data:${mime};base64,${base64}` });
    } else if (file.name.toLowerCase().endsWith(".zip")) {
      const projectText = await zipToText(file);
      const text = `ZIP project: ${file.name}\n${projectText || "No readable source files found."}`;
      geminiParts.push({ text });
      compatibleCurrentParts.push(text);
      openAIContent.push({ type: "input_text", text });
    } else if (isTextLike(file)) {
      const text = `Attached source/file: ${file.name}\n\n${(await file.text()).slice(0, MAX_CONTEXT_CHARS)}`;
      geminiParts.push({ text });
      compatibleCurrentParts.push(text);
      openAIContent.push({ type: "input_text", text });
    } else if (process.env.OPENAI_API_KEY) {
      const upload = new FormData();
      upload.append("purpose", "user_data");
      upload.append("file", file, file.name);
      const up = await fetch("https://api.openai.com/v1/files", { method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: upload });
      const upData = await up.json().catch(() => ({}));
      if (!up.ok) {
        const mapped = providerError("OpenAI", up.status, upData?.error?.message || "Could not process this file.");
        return NextResponse.json(mapped, { status: mapped.status });
      }
      openAIContent.push({ type: "input_file", file_id: upData.id });
    } else {
      return NextResponse.json({ error: "This file type needs the OpenAI file service. Add OPENAI_API_KEY or upload a text, image, or ZIP file." , code: "FILE_PROVIDER_REQUIRED" }, { status: 415 });
    }
  }

  const userText = message || `Attached file: ${attachedFileName || "file"}`;
  const { error: userSaveError } = await supabase.from("createx_chat_messages").insert({ chat_id: chatId, user_id: user.id, role: "user", content: userText, file_name: attachedFileName });
  if (userSaveError) return NextResponse.json({ error: userSaveError.message }, { status: 500 });
  await supabase.from("createx_chats").update({ updated_at: new Date().toISOString() }).eq("id", chatId).eq("user_id", user.id);

  const instructions = `You are CreateX AI, a multimodal assistant inside a creative workspace. Mode: ${mode}. Help with conversation, research, image/file analysis, source code, coding, debugging, refactoring, project architecture, and precise edits. For code tasks, provide complete copy-pasteable code when useful and clearly identify changed files. Treat ZIP source content as the user's project. Be concise, accurate, and practical. Never claim you executed or tested code unless a tool actually did so.`;
  const useSearch = /\b(search|latest|today|current|news|price|weather|who won|what happened)\b/i.test(`${message} ${mode}`);

  const attempts: Array<() => Promise<{ text: string; model: string; provider: string }>> = [];
  if (process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY) {
    const geminiHistory = history.map((m) => ({ role: m.role === "assistant" ? "model" as const : "user" as const, parts: [{ text: m.content }] }));
    attempts.push(() => callGemini(geminiHistory, geminiParts, instructions, useSearch));
  }
  if (!hasImage && (process.env.GROQ_API_KEY || process.env.OPENROUTER_API_KEY)) {
    const compatibleMessages = [
      { role: "system" as const, content: instructions },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user" as const, content: compatibleCurrentParts.length === 1 ? compatibleCurrentParts[0] : compatibleCurrentParts.join("\n\n") },
    ];
    if (process.env.GROQ_API_KEY) attempts.push(() => callCompatibleProvider("Groq", compatibleMessages));
    if (process.env.OPENROUTER_API_KEY) attempts.push(() => callCompatibleProvider("OpenRouter", compatibleMessages));
  }
  if (process.env.OPENAI_API_KEY) {
    const openAIHistory = history.map((m) => ({ role: m.role, content: m.content }));
    attempts.push(() => callOpenAI([...openAIHistory, { role: "user", content: openAIContent }], instructions, [
      { type: "web_search" },
      { type: "code_interpreter", container: { type: "auto" } },
    ]));
  }

  if (attempts.length === 0) {
    return NextResponse.json({ error: "No AI provider is configured. Add GEMINI_API_KEY for the free primary provider, or GROQ_API_KEY / OPENROUTER_API_KEY as fallbacks.", code: "AI_CONFIGURATION" }, { status: 503 });
  }

  let result: { text: string; model: string; provider: string } | null = null;
  let lastError: { provider: string; status: number; message: string } | null = null;
  for (const attempt of attempts) {
    try {
      result = await attempt();
      break;
    } catch (error: any) {
      const provider = String(error?.provider || "AI provider");
      const status = Number(error?.status || 502);
      const message = String(error?.message || error || "AI request failed.");
      lastError = { provider, status, message };
      if (!isRetryableProviderFailure(status, message) && !/NOT_CONFIGURED$/.test(message)) break;
    }
  }

  if (!result) {
    const mapped = lastError ? providerError(lastError.provider, lastError.status, lastError.message) : { error: "AI service is temporarily unavailable.", code: "AI_PROVIDER_UNAVAILABLE", status: 502 };
    return NextResponse.json(mapped, { status: mapped.status });
  }

  const { error: assistantSaveError } = await supabase.from("createx_chat_messages").insert({ chat_id: chatId, user_id: user.id, role: "assistant", content: result.text });
  if (assistantSaveError) return NextResponse.json({ error: assistantSaveError.message }, { status: 500 });
  await supabase.from("createx_chats").update({ updated_at: new Date().toISOString() }).eq("id", chatId).eq("user_id", user.id);

  return NextResponse.json({ text: result.text, model: result.model, provider: result.provider, chatId });
}
