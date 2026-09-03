import { NextResponse } from "next/server";
import JSZip from "jszip";
import { createClient } from "@/lib/supabase/server";

const MODEL = process.env.OPENAI_CHAT_MODEL || "gpt-5.6-luna";
const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_CONTEXT_CHARS = 60000;
const isTextLike = (file: File) => file.type.startsWith("text/") || /\.(js|jsx|ts|tsx|css|scss|html|json|md|py|java|c|cpp|h|hpp|sql|sh|xml|yaml|yml|csv|txt|env|gitignore|go|rs|php|rb|swift|kt|dart|vue|svelte)$/i.test(file.name);
async function zipToText(file: File) { const zip = await JSZip.loadAsync(await file.arrayBuffer()); const entries: string[] = []; for (const name of Object.keys(zip.files).slice(0,120)) { const entry=zip.files[name]; if(entry.dir||/(^|\/)node_modules\//i.test(name)||/(^|\/)\.git\//i.test(name)) continue; if(entries.join("\n").length>=MAX_CONTEXT_CHARS) break; if(isTextLike(new File([],name))) { try { entries.push(`FILE: ${name}\n${(await entry.async("string")).slice(0,12000)}`); } catch {} } else entries.push(`FILE: ${name} [binary or unsupported text]`); } return entries.join("\n\n---\n\n").slice(0,MAX_CONTEXT_CHARS); }

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "AI is not configured yet. Add OPENAI_API_KEY in Vercel." }, { status: 503 });
  const form = await request.formData();
  const message = String(form.get("message") || "").trim().slice(0,12000);
  const mode = String(form.get("mode") || "general");
  const file = form.get("file");
  const requestedChatId = String(form.get("chatId") || "");
  let history: any[] = [];
  try { const parsed=JSON.parse(String(form.get("history")||"[]")); if(Array.isArray(parsed)) history=parsed.filter(m=>(m?.role==="user"||m?.role==="assistant")&&typeof m?.content==="string").slice(-20).map(m=>({role:m.role,content:m.content.slice(0,12000)})); } catch {}
  if (!message && !(file instanceof File)) return NextResponse.json({ error: "Message or file is required." }, { status: 400 });

  let chatId = requestedChatId;
  if (chatId) {
    const { data: chat } = await supabase.from("createx_chats").select("id").eq("id",chatId).eq("user_id",user.id).maybeSingle();
    if (!chat) chatId = "";
  }
  if (!chatId) {
    const title = (message || (file instanceof File ? file.name : "New chat")).slice(0,70) || "New chat";
    const { data: chat, error } = await supabase.from("createx_chats").insert({user_id:user.id,title}).select("id").single();
    if (error) return NextResponse.json({error:error.message},{status:500});
    chatId = chat.id;
  }

  const content:any[]=[];
  if(message) content.push({type:"input_text",text:message});
  if(file instanceof File && file.size>0){
    if(file.size>MAX_FILE_BYTES) return NextResponse.json({error:"File too large. Maximum is 8 MB."},{status:413});
    const mime=file.type||"application/octet-stream";
    if(mime.startsWith("image/")){ const bytes=Buffer.from(await file.arrayBuffer()); content.push({type:"input_image",image_url:`data:${mime};base64,${bytes.toString("base64")}`}); }
    else if(file.name.toLowerCase().endsWith(".zip")){ content.push({type:"input_text",text:`ZIP project: ${file.name}\n${await zipToText(file) || "No readable source files found."}`}); }
    else if(isTextLike(file)){ content.push({type:"input_text",text:`Attached source/file: ${file.name}\n\n${(await file.text()).slice(0,MAX_CONTEXT_CHARS)}`}); }
    else { const upload=new FormData(); upload.append("purpose","user_data"); upload.append("file",file,file.name); const up=await fetch("https://api.openai.com/v1/files",{method:"POST",headers:{Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},body:upload}); const upData=await up.json().catch(()=>({})); if(!up.ok) return NextResponse.json({error:upData?.error?.message||"Could not process this file."},{status:502}); content.push({type:"input_file",file_id:upData.id}); }
  }
  const userText = message || `Attached file: ${file instanceof File ? file.name : "file"}`;
  await supabase.from("createx_chat_messages").insert({chat_id:chatId,user_id:user.id,role:"user",content:userText,file_name:file instanceof File ? file.name : null});
  await supabase.from("createx_chats").update({updated_at:new Date().toISOString()}).eq("id",chatId).eq("user_id",user.id);

  const instructions=`You are CreateX AI, a multimodal assistant inside a creative workspace. Mode: ${mode}. You can discuss ideas, analyze images/documents, inspect source code, generate new code, debug and refactor code, explain files, and propose precise edits. For code tasks, return complete copy-pasteable code when appropriate and clearly mark changed files. For ZIP projects, treat extracted source listing/content as the user's project and help modify it. Never claim you executed or tested code unless an execution tool actually did so. Be concise but useful.`;
  const input=[...history,{role:"user",content}];
  const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({model:MODEL,instructions,input,max_output_tokens:5000})});
  const data=await response.json().catch(()=>({}));
  if(!response.ok) return NextResponse.json({error:data?.error?.message||"AI request failed."},{status:response.status>=500?502:400});
  const text=data?.output_text||data?.output?.flatMap((item:any)=>item.content||[]).filter((part:any)=>part.type==="output_text").map((part:any)=>part.text).join("\n")||"I couldn't generate a response.";
  await supabase.from("createx_chat_messages").insert({chat_id:chatId,user_id:user.id,role:"assistant",content:text});
  await supabase.from("createx_chats").update({updated_at:new Date().toISOString()}).eq("id",chatId).eq("user_id",user.id);
  return NextResponse.json({text,model:MODEL,chatId});
}
