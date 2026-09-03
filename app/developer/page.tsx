import Link from "next/link";
import { ArrowLeft, Code2, Mail, Sparkles } from "lucide-react";
import InstagramButton from "./InstagramButton";

const socials = [
  { label: "@offx.somesh", username: "offx.somesh" },
  { label: "@developer.somesh", username: "developer.somesh" },
];

export default function DeveloperPage() {
  return <main className="min-h-screen bg-[#07070a] px-5 py-10 text-white md:px-8"><div className="mx-auto max-w-3xl"><Link href="/" className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white"><ArrowLeft size={16}/> Back to CreateX AI</Link><section className="mt-8 overflow-hidden rounded-[32px] border border-white/10 bg-white/[.035] p-7 shadow-2xl md:p-10"><div className="flex flex-col gap-5 sm:flex-row sm:items-center"><div className="grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/20"><Code2 size={28}/></div><div><p className="text-xs font-bold uppercase tracking-[.25em] text-violet-300">Developer Information</p><h1 className="mt-1 text-3xl font-black">Somesh Koli</h1><p className="mt-1 text-sm text-white/45">Creator & Developer · CreateX AI</p></div></div><div className="mt-8 rounded-2xl border border-violet-400/15 bg-violet-400/5 p-5"><div className="flex gap-3"><Sparkles className="mt-0.5 text-violet-300" size={19}/><p className="text-sm leading-6 text-white/65">CreateX AI is an AI creation studio for generating images and videos from creative ideas. This project is designed and developed by Somesh Koli.</p></div></div><div className="mt-6 grid gap-3 sm:grid-cols-2"><Info label="Project" value="CreateX AI"/><Info label="Role" value="Creator & Developer"/>{socials.map((s)=><InstagramButton key={s.username} username={s.username} label={s.label}/>)}<a href="mailto:someshkoli442288@gmail.com" className="group rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-cyan-400/25 hover:bg-cyan-400/5 sm:col-span-2"><div className="text-[10px] uppercase tracking-[.2em] text-white/30">Contact</div><div className="mt-2 flex items-center gap-2 text-sm text-white/75"><Mail size={15} className="text-cyan-300"/> <span className="group-hover:text-white">someshkoli442288@gmail.com</span></div></a></div></section></div></main>;
}
function Info({label,value}:{label:string;value:string}){return <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><div className="text-[10px] uppercase tracking-[.2em] text-white/30">{label}</div><div className="mt-2 text-sm font-semibold text-white/75">{value}</div></div>}
