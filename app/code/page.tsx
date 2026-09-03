"use client";

import Link from "next/link";
import JSZip from "jszip";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, FileCode2, FilePlus2, FolderArchive, Play, Save, Sparkles, Terminal, Trash2, Wand2, X, Pencil, Check } from "lucide-react";

type ProjectFile = { name: string; language: string; content: string };

const initialFiles: ProjectFile[] = [
  {
    name: "index.html",
    language: "HTML",
    content: `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8" />\n    <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n    <title>CreateX Preview</title>\n    <style>body{margin:0;font-family:system-ui;background:#08080c;color:#fff;display:grid;place-items:center;min-height:100vh}button{border:0;border-radius:12px;padding:12px 18px;background:#fff;color:#000;font-weight:700}</style>\n  </head>\n  <body>\n    <main>\n      <h1>CreateX AI</h1>\n      <p>Edit this project and press Run.</p>\n      <button onclick="alert('CreateX project is running')">Test interaction</button>\n    </main>\n  </body>\n</html>`,
  },
  { name: "README.md", language: "Markdown", content: "# CreateX AI Project\n\nBuilt in the CreateX AI code workspace.\n" },
];

function languageFor(name: string) {
  const ext = name.split(".").pop()?.toLowerCase();
  return ({ html: "HTML", css: "CSS", js: "JavaScript", jsx: "JSX", ts: "TypeScript", tsx: "TSX", json: "JSON", md: "Markdown", py: "Python" } as Record<string, string>)[ext || ""] || "Text";
}

export default function CodeWorkspace() {
  const [files, setFiles] = useState<ProjectFile[]>(initialFiles);
  const [active, setActive] = useState("index.html");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("Ready. Ask CreateX AI to explain, debug, refactor or rewrite your project.");
  const [busy, setBusy] = useState(false);
  const [running, setRunning] = useState(false);
  const [preview, setPreview] = useState("");
  const [showNewFile, setShowNewFile] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");

  const current = files.find(f => f.name === active) || files[0];
  const projectText = useMemo(() => files.map(f => `FILE: ${f.name}\n${f.content}`).join("\n\n---\n\n").slice(0, 60000), [files]);

  useEffect(() => {
    const saved = localStorage.getItem("createx-code-project");
    if (!saved) return;
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length) setFiles(parsed);
    } catch {}
  }, []);

  function updateCurrent(content: string) {
    setFiles(prev => prev.map(f => f.name === active ? { ...f, content } : f));
  }

  function saveProject() {
    localStorage.setItem("createx-code-project", JSON.stringify(files));
    setOutput("Project saved locally in this browser.");
  }

  function addFile() {
    const name = newFileName.trim();
    if (!name || files.some(f => f.name === name)) return;
    const file = { name, language: languageFor(name), content: "" };
    setFiles(prev => [...prev, file]);
    setActive(name);
    setNewFileName("");
    setShowNewFile(false);
  }

  function startRename() {
    setRenameValue(active);
    setRenaming(true);
  }

  function confirmRename() {
    const next = renameValue.trim();
    if (!next || next === active || files.some(f => f.name === next)) return;
    setFiles(prev => prev.map(f => f.name === active ? { ...f, name: next, language: languageFor(next) } : f));
    setActive(next);
    setRenaming(false);
  }

  function deleteCurrent() {
    if (files.length === 1) return;
    const remaining = files.filter(f => f.name !== active);
    setFiles(remaining);
    setActive(remaining[0].name);
  }

  async function exportProject() {
    const zip = new JSZip();
    files.forEach(file => zip.file(file.name, file.content));
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "createx-project.zip"; a.click();
    URL.revokeObjectURL(url);
    setOutput("Project ZIP exported successfully.");
  }

  function runProject() {
    const html = files.find(f => f.name.toLowerCase() === "index.html")?.content;
    if (!html) {
      setOutput("Run preview expects an index.html file. Add one to preview a browser project.");
      return;
    }
    setPreview(html);
    setRunning(true);
    setOutput("Live preview started from index.html. HTML/CSS/JS run inside the sandboxed preview.");
  }

  async function askAI() {
    if (!prompt.trim() || busy) return;
    setBusy(true);
    try {
      const form = new FormData();
      form.append("message", `${prompt}\n\nCurrent CreateX project:\n${projectText}`);
      form.append("mode", "code");
      form.append("history", "[]");
      const res = await fetch("/api/chat", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "AI request failed");
      setOutput(data.text || "No response generated.");
    } catch (e: any) {
      setOutput(`Error: ${e?.message || "Something went wrong."}`);
    } finally { setBusy(false); }
  }

  return <main className="min-h-screen bg-[#07070a] text-white">
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-white/10 bg-[#09090d]/95 px-3 py-3 backdrop-blur-xl md:px-4">
      <div className="flex min-w-0 items-center gap-2 md:gap-3">
        <Link href="/chat" className="rounded-xl p-2 text-white/50 hover:bg-white/5"><ArrowLeft size={18}/></Link>
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400"><Sparkles size={17}/></span>
        <div className="min-w-0"><b>CreateX <span className="text-violet-300">AI</span></b><p className="text-[9px] uppercase tracking-widest text-white/30">Project Workspace</p></div>
      </div>
      <div className="flex gap-1.5 md:gap-2">
        <button onClick={saveProject} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/60 hover:bg-white/5"><Save size={14}/> <span className="hidden sm:inline">Save</span></button>
        <button onClick={exportProject} className="flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/60 hover:bg-white/5"><FolderArchive size={14}/> <span className="hidden sm:inline">ZIP</span></button>
        <button onClick={runProject} className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-black"><Play size={14}/> Run</button>
      </div>
    </header>

    <div className="mx-auto grid min-h-[calc(100vh-65px)] max-w-[1600px] lg:grid-cols-[210px_minmax(0,1fr)_380px]">
      <aside className="hidden border-r border-white/10 bg-[#09090d] p-3 lg:block">
        <div className="mb-2 flex items-center justify-between"><p className="px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-white/25">Project files</p><button onClick={() => setShowNewFile(true)} className="rounded-lg p-1.5 text-white/40 hover:bg-white/5 hover:text-white"><FilePlus2 size={15}/></button></div>
        {files.map(file => <button key={file.name} onClick={() => setActive(file.name)} className={`mb-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs ${file.name === active ? "bg-violet-500/10 text-white" : "text-white/45 hover:bg-white/5 hover:text-white"}`}><FileCode2 size={14}/>{file.name}</button>)}
        <div className="mt-4 grid grid-cols-2 gap-1.5">
          <button onClick={startRename} className="flex items-center justify-center gap-1.5 rounded-xl border border-white/10 px-2 py-2 text-[10px] text-white/45 hover:bg-white/5 hover:text-white"><Pencil size={12}/> Rename</button>
          <button onClick={deleteCurrent} disabled={files.length === 1} className="flex items-center justify-center gap-1.5 rounded-xl border border-red-400/10 px-2 py-2 text-[10px] text-red-300/50 hover:bg-red-500/10 disabled:opacity-20"><Trash2 size={12}/> Delete</button>
        </div>
      </aside>

      <section className="flex min-h-[620px] min-w-0 flex-col">
        <div className="flex items-center gap-2 border-b border-white/10 bg-white/[.025] px-3 py-2 lg:hidden">
          <select value={active} onChange={e => setActive(e.target.value)} className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#101017] px-3 py-2 text-xs text-white outline-none">
            {files.map(file => <option key={file.name} value={file.name}>{file.name}</option>)}
          </select>
          <button onClick={() => setShowNewFile(true)} className="rounded-xl border border-white/10 p-2 text-white/50"><FilePlus2 size={15}/></button>
          <button onClick={startRename} className="rounded-xl border border-white/10 p-2 text-white/50"><Pencil size={15}/></button>
        </div>
        <div className="flex items-center justify-between border-b border-white/10 bg-white/[.025] px-4 py-2 text-xs text-white/45"><span>{current.name} <span className="ml-2 text-white/20">{current.language}</span></span><span className="text-white/20">{files.length} files</span></div>
        <textarea value={current.content} onChange={e => updateCurrent(e.target.value)} spellCheck={false} className="min-h-[620px] flex-1 resize-none bg-[#050507] p-4 font-mono text-[13px] leading-6 text-cyan-100 outline-none md:p-5" />
      </section>

      <aside className="border-t border-white/10 bg-[#09090d] p-4 lg:border-l lg:border-t-0">
        <div className="mb-4 flex items-center gap-2 text-sm font-bold"><Wand2 size={16} className="text-violet-300"/> AI Coding Assistant</div>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder="Debug, refactor, add a feature, explain the project…" className="h-28 w-full resize-none rounded-2xl border border-white/10 bg-white/[.035] p-3 text-xs outline-none placeholder:text-white/25"/>
        <button onClick={askAI} disabled={busy || !prompt.trim()} className="mt-2 w-full rounded-xl bg-white px-3 py-2.5 text-xs font-bold text-black disabled:opacity-30">{busy ? "Thinking…" : "Ask CreateX AI"}</button>
        <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-3"><div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30"><Terminal size={13}/> AI output</div><div className="max-h-[38vh] overflow-auto whitespace-pre-wrap text-xs leading-6 text-white/60">{output}</div></div>
        <div className="mt-3 rounded-2xl border border-white/10 bg-white/[.02] p-3 text-[10px] leading-5 text-white/35">CreateX AI sees the project files together, so you can ask for cross-file changes. Run previews browser projects through a sandboxed iframe.</div>
      </aside>
    </div>

    {showNewFile && <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"><div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#101017] p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between"><b>New project file</b><button onClick={() => setShowNewFile(false)} className="rounded-lg p-2 text-white/40 hover:bg-white/5"><X size={16}/></button></div><input autoFocus value={newFileName} onChange={e => setNewFileName(e.target.value)} onKeyDown={e => e.key === "Enter" && addFile()} placeholder="components/Button.tsx" className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm outline-none placeholder:text-white/20"/><button onClick={addFile} className="mt-3 w-full rounded-xl bg-white py-3 text-xs font-bold text-black">Create file</button></div></div>}

    {renaming && <div className="fixed inset-0 z-40 grid place-items-center bg-black/70 p-4 backdrop-blur-sm"><div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#101017] p-5 shadow-2xl"><div className="mb-4 flex items-center justify-between"><b>Rename file</b><button onClick={() => setRenaming(false)} className="rounded-lg p-2 text-white/40 hover:bg-white/5"><X size={16}/></button></div><input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)} onKeyDown={e => e.key === "Enter" && confirmRename()} className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-sm outline-none"/><button onClick={confirmRename} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-xs font-bold text-black"><Check size={14}/> Rename file</button></div></div>}

    {running && <div className="fixed inset-0 z-30 bg-black/80 p-3 backdrop-blur-sm md:p-8"><div className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#101017] shadow-2xl"><div className="flex items-center justify-between border-b border-white/10 px-4 py-3"><div className="flex items-center gap-2 text-xs font-bold"><Play size={14}/> Live Preview</div><button onClick={() => setRunning(false)} className="rounded-xl p-2 text-white/50 hover:bg-white/5"><X size={16}/></button></div><iframe title="CreateX live preview" sandbox="allow-scripts" srcDoc={preview} className="min-h-0 flex-1 bg-white" /></div></div>}
  </main>;
}
