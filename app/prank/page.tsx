"use client";

import { useEffect, useMemo, useState } from "react";
import { Terminal, Monitor, ShieldAlert, Radio, Globe2, LockKeyhole, Wifi, Cpu, X, Minus, Square } from "lucide-react";

const tools = [
  { name: "System Console", icon: Terminal, kind: "console" },
  { name: "Screen FX", icon: Monitor, kind: "screen" },
  { name: "Security Scan", icon: ShieldAlert, kind: "scan" },
  { name: "Remote Link", icon: Wifi, kind: "remote" },
  { name: "Global Network", icon: Globe2, kind: "network" },
  { name: "Signal Monitor", icon: Radio, kind: "signal" },
  { name: "Encryption Lab", icon: LockKeyhole, kind: "encrypt" },
  { name: "System Monitor", icon: Cpu, kind: "system" },
];

export default function PrankPage() {
  const [active, setActive] = useState("console");
  const [running, setRunning] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const [clock, setClock] = useState("");

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString());
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, []);

  const fakeLines = useMemo(() => [
    "AURA SECURITY TERMINAL v1.0",
    "Initializing visual simulation...",
    "Loading encrypted interface...",
    "Checking local demo environment...",
    "Handshake: DEMO-LOCAL",
    "Simulation ready. No external systems are contacted.",
  ], []);

  function runSimulation() {
    setRunning(true); setLines([]);
    fakeLines.forEach((line, i) => setTimeout(() => setLines(v => [...v, line]), i * 420));
    setTimeout(() => setRunning(false), fakeLines.length * 420 + 300);
  }

  return (
    <main className="prankShell">
      <div className="scanlines" />
      <header className="prankHeader"><div className="brandMark">AURA<span>://</span>LAB</div><div className="status">● ONLINE <span>{clock}</span></div></header>
      <section className="prankStage">
        <div className="globe" aria-hidden="true"><div className="gridSphere" /><div className="orbit orbit1" /><div className="orbit orbit2" /></div>
        <div className="toolGrid">{tools.map(({name,icon:Icon,kind}) => <button key={kind} className={`tool ${active===kind?"selected":""}`} onClick={()=>setActive(kind)}><Icon size={25}/><span>{name}</span></button>)}</div>
        <section className="terminalWindow">
          <div className="windowBar"><b>{tools.find(t=>t.kind===active)?.name}</b><div><Minus size={15}/><Square size={13}/><X size={15}/></div></div>
          <div className="terminalBody"><div className="terminalTitle">AURA // VISUAL SIMULATION</div><div className="readout"><div><span>MODE</span><strong>{active.toUpperCase()}</strong></div><div><span>STATUS</span><strong>{running?"RUNNING":"STANDBY"}</strong></div><div><span>LINK</span><strong>LOCAL DEMO</strong></div></div><div className="progress"><i style={{width:running?"92%":"28%"}} /></div><div className="console">{lines.length ? lines.map((x,i)=><div key={i}><em>&gt;</em> {x}</div>) : <div><em>&gt;</em> Ready for visual simulation.</div>}</div><button className="runBtn" onClick={runSimulation} disabled={running}>{running?"RUNNING...":"START SIMULATION"}</button><p className="notice">Harmless browser-only demo. This interface does not crack passwords, access devices, scan networks, or contact external systems.</p></div>
        </section>
      </section>
      <footer className="prankFooter"><span>▰ AURA LAB</span><span>LOCAL SIMULATION</span><span>PRIVACY</span></footer>
      <style jsx>{`
        .prankShell{min-height:100vh;background:#020502;color:#39ff14;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;overflow:hidden;position:relative}.scanlines{pointer-events:none;position:fixed;inset:0;background:repeating-linear-gradient(0deg,rgba(57,255,20,.025) 0 1px,transparent 1px 4px);z-index:4}.prankHeader{height:58px;border-bottom:1px solid #123f12;background:#030803;display:flex;align-items:center;justify-content:space-between;padding:0 20px;position:relative;z-index:5}.brandMark{font-weight:900;letter-spacing:2px;font-size:18px}.brandMark span{opacity:.55}.status{font-size:11px}.status span{margin-left:14px;opacity:.55}.prankStage{min-height:calc(100vh - 108px);position:relative;padding:34px 20px 70px;display:flex;align-items:center;justify-content:center}.globe{position:absolute;width:min(78vw,720px);height:min(78vw,720px);border-radius:50%;opacity:.28;background:radial-gradient(circle at 42% 40%,#174b17 0,#062006 38%,transparent 68%);box-shadow:0 0 100px #0c4d0c}.gridSphere{position:absolute;inset:8%;border:1px solid #22a622;border-radius:50%;background:linear-gradient(90deg,transparent 48%,#167516 49% 50%,transparent 51%),linear-gradient(0deg,transparent 48%,#167516 49% 50%,transparent 51%);}.orbit{position:absolute;inset:16%;border:1px solid #39ff14;border-radius:50%;transform:rotate(55deg)}.orbit2{inset:25%;transform:rotate(-35deg)}.toolGrid{position:absolute;top:34px;right:24px;width:min(390px,48vw);display:grid;grid-template-columns:repeat(4,1fr);gap:16px;z-index:2}.tool{border:0;background:transparent;color:#39ff14;display:flex;flex-direction:column;align-items:center;gap:7px;font:inherit;font-size:10px;cursor:pointer;padding:8px}.tool svg{background:#39ff14;color:#001000;padding:7px;width:39px;height:39px}.tool.selected{outline:1px dashed #39ff14;background:rgba(57,255,20,.04)}.terminalWindow{width:min(680px,92vw);margin-top:130px;border:2px solid #39ff14;background:#020602;box-shadow:0 0 28px rgba(57,255,20,.22);position:relative;z-index:3}.windowBar{height:30px;background:#39ff14;color:#001000;display:flex;align-items:center;justify-content:space-between;padding:0 8px;font-size:12px}.windowBar div{display:flex;gap:10px;align-items:center}.terminalBody{padding:15px}.terminalTitle{border:1px solid #168816;padding:8px;margin-bottom:14px;font-weight:700}.readout{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.readout div{border:1px solid #126b12;padding:9px}.readout span{display:block;font-size:9px;opacity:.6;margin-bottom:5px}.readout strong{font-size:12px}.progress{height:9px;border:1px solid #39ff14;margin:14px 0}.progress i{display:block;height:100%;background:#39ff14;transition:width .4s}.console{height:145px;overflow:hidden;border:1px solid #126b12;padding:10px;font-size:11px;line-height:1.7}.console em{font-style:normal;color:#9dff8f}.runBtn{display:block;margin:16px auto 10px;background:#39ff14;color:#001000;border:0;border-radius:16px;padding:8px 20px;font:inherit;font-weight:800;cursor:pointer}.runBtn:disabled{opacity:.6}.notice{font-size:9px;line-height:1.5;border-top:1px solid #126b12;padding-top:9px;color:#7eea6d}.prankFooter{position:fixed;bottom:0;left:0;right:0;height:50px;background:#39ff14;color:#001000;display:flex;align-items:center;justify-content:space-between;padding:0 18px;font-size:11px;font-weight:800;z-index:5}@media(max-width:700px){.prankStage{padding-top:220px;align-items:flex-start}.toolGrid{top:20px;left:12px;right:12px;width:auto;grid-template-columns:repeat(4,1fr);gap:4px}.tool{font-size:8px}.tool svg{width:32px;height:32px;padding:6px}.terminalWindow{margin-top:20px}.readout{grid-template-columns:1fr 1fr}.readout div:last-child{grid-column:1/-1}.globe{top:180px}.prankHeader{padding:0 12px}.status span{display:none}}
      `}</style>
    </main>
  );
}
