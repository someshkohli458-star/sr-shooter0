"use client";
import { useState } from "react";
import { Terminal, Shield, Cpu, Radio, Database, Code2, LockKeyhole, Sparkles } from "lucide-react";

const tools = [
  { name: "Bitcoin Miner", icon: Cpu, desc: "Visual mining simulation" },
  { name: "Headquarter Surveillance", icon: Radio, desc: "Fictional command monitor" },
  { name: "Password Cracker", icon: LockKeyhole, desc: "Password-security demo" },
  { name: "Nuclear Plant", icon: Shield, desc: "Fictional control room" },
  { name: "Remote Connection", icon: Radio, desc: "Fake connection animation" },
  { name: "Advertisements", icon: Sparkles, desc: "Retro ad simulator" },
  { name: "Interpol Database", icon: Database, desc: "Fictional database UI" },
  { name: "Program Console", icon: Code2, desc: "Safe terminal simulator" },
];

export default function CyberNexPage() {
  const [active, setActive] = useState("Program Console");
  const [running, setRunning] = useState(false);
  return (
    <main className="min-h-screen bg-black text-lime-400 font-mono overflow-hidden">
      <header className="border-b border-lime-500/50 px-4 py-3 flex items-center justify-between bg-black/90 sticky top-0 z-20">
        <div className="flex items-center gap-3"><Terminal size={22}/><div><div className="font-bold tracking-[.25em]">CYBERNEX</div><div className="text-[10px] opacity-70">DIGITAL SIMULATION LAB</div></div></div>
        <div className="text-xs border border-lime-500/50 px-3 py-1">STATUS: ONLINE</div>
      </header>
      <div className="max-w-6xl mx-auto p-4 grid lg:grid-cols-[1fr_320px] gap-5">
        <section className="min-h-[70vh] border border-lime-500/50 bg-lime-950/10 p-3 relative">
          <div className="absolute inset-0 pointer-events-none opacity-10 bg-[radial-gradient(circle_at_center,rgba(0,255,40,.8),transparent_55%)]"/>
          <div className="relative h-full flex flex-col">
            <div className="border border-lime-500/50 px-3 py-2 flex justify-between text-xs"><span>CYBERNEX://{active.toLowerCase().replaceAll(" ","-")}</span><span>SAFE MODE</span></div>
            <div className="flex-1 flex items-center justify-center py-10">
              <div className="w-full max-w-xl border-2 border-lime-400 shadow-[0_0_28px_rgba(0,255,50,.15)]">
                <div className="bg-lime-400 text-black px-3 py-1 text-sm flex justify-between"><span>{active}</span><span>□ ×</span></div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs"><div className="border border-lime-500/50 p-2">TARGET: <span className="opacity-70">DEMO-NODE</span></div><div className="border border-lime-500/50 p-2">MODE: <span className="opacity-70">SIMULATION</span></div></div>
                  <div className="h-32 border border-lime-500/50 p-3 grid grid-cols-10 gap-1">{Array.from({length:60}).map((_,i)=><span key={i} className={`border border-lime-500/30 ${running && i%3===0 ? "bg-lime-400" : ""}`}/>)}</div>
                  <div className="text-center text-xs">STATUS: {running ? "SIMULATION RUNNING" : "STANDBY"}</div>
                  <button onClick={()=>setRunning(v=>!v)} className="mx-auto block bg-lime-400 text-black px-5 py-2 text-xs font-bold hover:bg-lime-300">{running ? "STOP SIMULATION" : "START SIMULATION"}</button>
                  <p className="text-[10px] opacity-70 border-t border-lime-500/40 pt-3">Educational/prank simulation only. No real systems, credentials, surveillance or network targets are accessed.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <aside className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 content-start">{tools.map(({name,icon:Icon,desc})=><button key={name} onClick={()=>{setActive(name);setRunning(false)}} className={`text-left border p-3 transition ${active===name?"border-lime-300 bg-lime-400 text-black":"border-lime-500/40 hover:border-lime-300 bg-black/70"}`}><Icon size={22}/><div className="text-xs font-bold mt-2">{name}</div><div className="text-[9px] opacity-70 mt-1">{desc}</div></button>)}</aside>
      </div>
      <footer className="border-t border-lime-500/50 px-4 py-2 text-xs flex justify-between"><span>☰ START &nbsp; | &nbsp; CYBERNEX</span><span>⚙ PRIVACY</span></footer>
    </main>
  );
}
