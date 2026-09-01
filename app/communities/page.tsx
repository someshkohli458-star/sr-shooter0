import { ArrowUpRight, Hash, Users } from "lucide-react";

const nexus = [
  { name: "Night Owls", members: "12.4K", topic: "Late-night ideas, stories & conversations" },
  { name: "Design Lab", members: "8.7K", topic: "UI, product thinking and creative experiments" },
  { name: "Street Lens", members: "5.2K", topic: "Photography, frames and visual storytelling" },
  { name: "Future Minds", members: "18.1K", topic: "Technology, AI and what comes next" },
];

export default function CommunitiesPage() {
  return (
    <main className="shell">
      <header className="topbar"><a className="brand" href="/">AURA<span>+</span>NEXUS</a><a className="ghost" href="/profile">My Aura</a></header>
      <div className="pageHeading"><div className="eyebrow">THE NEXUS</div><h1>Find your people.</h1><p>Communities are shared worlds with their own culture, conversations and identity.</p></div>
      <div className="communityGrid large">{nexus.map((item) => <article className="nexusCard" key={item.name}><div className="nexusIcon"><Hash size={20}/></div><div><h2>{item.name}</h2><p>{item.topic}</p><div className="nexusMeta"><span><Users size={14}/> {item.members}</span><a href="#join">Join <ArrowUpRight size={14}/></a></div></div></article>)}</div>
    </main>
  );
}
