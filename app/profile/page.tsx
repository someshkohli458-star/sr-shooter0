import { Award, Edit3, Globe2, Users } from "lucide-react";

const communities = ["Night Owls", "Design Lab", "Street Lens"];

export default function ProfilePage() {
  return (
    <main className="shell">
      <header className="topbar"><a className="brand" href="/">AURA<span>+</span>NEXUS</a><a className="ghost" href="/communities">Explore Nexus</a></header>
      <section className="profileHero">
        <div className="avatar">SR</div>
        <div className="profileCopy"><div className="eyebrow">YOUR AURA</div><h1>S_R_SHOOTER0</h1><p>Building my own world. Photography, ideas and late-night conversations.</p><div className="stats"><span><b>128</b> Aura</span><span><b>24</b> Nexus</span><span><b>8</b> Badges</span></div></div>
        <a className="primary" href="#edit"><Edit3 size={16}/> Edit Aura</a>
      </section>
      <section className="grid2">
        <article className="panel"><div className="panelTitle"><span>Identity</span><Globe2 size={18}/></div><div className="chips"><span>Creator</span><span>Visuals</span><span>Night thinker</span></div><p className="muted">Your profile is your space. Customize it later with themes, music, links and featured moments.</p></article>
        <article className="panel"><div className="panelTitle"><span>Achievements</span><Award size={18}/></div><div className="achievement"><strong>First Spark</strong><span>Profile created</span></div><div className="achievement"><strong>Connector</strong><span>Joined 5 Nexus</span></div></article>
      </section>
      <section className="panel"><div className="panelTitle"><span>My Nexus</span><Users size={18}/></div><div className="communityGrid">{communities.map((name) => <a className="community" href="/communities" key={name}><b>{name}</b><span>Active community</span></a>)}</div></section>
    </main>
  );
}
