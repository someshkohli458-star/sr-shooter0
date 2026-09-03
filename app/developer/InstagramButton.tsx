"use client";

export default function InstagramButton({ username, label }: { username: string; label: string }) {
  function openInstagram() {
    const webUrl = `https://www.instagram.com/${username}/`;
    window.location.href = `instagram://user?username=${username}`;
    window.setTimeout(() => { window.location.href = webUrl; }, 900);
  }

  return <button type="button" onClick={openInstagram} className="group rounded-2xl border border-white/10 bg-black/20 p-4 text-left transition hover:border-pink-400/25 hover:bg-pink-400/5">
    <div className="text-[10px] uppercase tracking-[.2em] text-white/30">Instagram</div>
    <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-white/75"><span className="text-pink-300">◎</span><span className="group-hover:text-white">{label}</span></div>
  </button>;
}
