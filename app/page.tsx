import { Compass, MessageCircle, Plus, Sparkles, Users } from "lucide-react";

const cards = [
  { title: "Discover your Nexus", text: "Find communities built around the things you care about.", icon: Users },
  { title: "Build your Aura", text: "Shape a profile that feels like you, not a template.", icon: Sparkles },
  { title: "Explore the Pulse", text: "See fresh conversations and ideas from across the network.", icon: Compass },
];

export default function Home() {
  return (
    <main style={{ minHeight: "100vh", padding: "28px 20px", maxWidth: 1180, margin: "0 auto" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
        <div>
          <div style={{ fontSize: 12, letterSpacing: 4, opacity: .6 }}>AURA + NEXUS</div>
          <h1 style={{ fontSize: "clamp(42px, 8vw, 82px)", lineHeight: .95, margin: "16px 0", maxWidth: 760 }}>Your Aura.<br />Your Nexus.<br />Your World.</h1>
          <p style={{ maxWidth: 560, color: "#aaa9b8", fontSize: 18, lineHeight: 1.6 }}>A fresh social universe for identity, communities, conversations and discovery.</p>
        </div>
        <button aria-label="Create" style={{ width: 52, height: 52, borderRadius: 18, border: "1px solid #2a2a35", background: "#15151d", color: "white" }}><Plus size={22} /></button>
      </header>

      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginTop: 48 }}>
        {cards.map(({ title, text, icon: Icon }) => (
          <article key={title} style={{ padding: 24, minHeight: 190, borderRadius: 26, border: "1px solid #262631", background: "linear-gradient(145deg,#14141d,#0c0c11)" }}>
            <Icon size={24} />
            <h2 style={{ margin: "42px 0 10px", fontSize: 21 }}>{title}</h2>
            <p style={{ margin: 0, color: "#9897a6", lineHeight: 1.5 }}>{text}</p>
          </article>
        ))}
      </section>

      <nav style={{ display: "flex", gap: 10, marginTop: 30 }}>
        <button style={navButton}>Explore</button><button style={navButton}>Communities</button><button style={navButton}>Messages <MessageCircle size={16} /></button>
      </nav>
    </main>
  );
}

const navButton = { display: "inline-flex", alignItems: "center", gap: 8, border: "1px solid #282833", background: "#101017", color: "#eee", borderRadius: 999, padding: "11px 16px", cursor: "pointer" };
