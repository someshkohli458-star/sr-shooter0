"use client";

import { Mic, MicOff, Loader2, PhoneOff } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export default function VoiceButton() {
  const [active, setActive] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => () => stop(), []);

  async function start() {
    setConnecting(true); setError("");
    try {
      const tokenRes = await fetch("/api/realtime/token", { method: "POST" });
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok || !tokenData.client_secret) throw new Error(tokenData.error || "Could not start voice session.");

      const pc = new RTCPeerConnection();
      const audio = new Audio(); audio.autoplay = true; audioRef.current = audio;
      pc.ontrack = (event) => { audio.srcObject = event.streams[0]; };
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const sdpRes = await fetch("https://api.openai.com/v1/realtime/calls", {
        method: "POST",
        headers: { Authorization: `Bearer ${tokenData.client_secret}`, "Content-Type": "application/sdp" },
        body: offer.sdp,
      });
      if (!sdpRes.ok) throw new Error((await sdpRes.text()) || "Voice connection failed.");
      await pc.setRemoteDescription({ type: "answer", sdp: await sdpRes.text() });
      pcRef.current = pc; streamRef.current = stream; setActive(true);
    } catch (e: any) {
      stop(); setError(e?.message || "Voice unavailable.");
    } finally { setConnecting(false); }
  }

  function stop() {
    pcRef.current?.close(); pcRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop()); streamRef.current = null;
    if (audioRef.current) { audioRef.current.srcObject = null; audioRef.current = null; }
    setActive(false);
  }

  if (active) return <button onClick={stop} title="Stop voice chat" className="mb-1 flex items-center gap-2 rounded-2xl border border-red-400/20 bg-red-500/10 px-3 py-3 text-red-300 hover:bg-red-500/15"><PhoneOff size={18}/><span className="hidden sm:inline text-xs font-semibold">End</span></button>;
  return <div className="relative"><button onClick={start} disabled={connecting} title="Start voice chat" className="mb-1 rounded-2xl border border-white/10 p-3 text-white/55 hover:bg-white/5 hover:text-white disabled:opacity-40">{connecting ? <Loader2 size={19} className="animate-spin"/> : <Mic size={19}/>}</button>{error && <div className="absolute bottom-14 right-0 w-56 rounded-xl border border-red-400/20 bg-[#151016] p-2 text-[10px] text-red-200 shadow-xl">{error}</div>}</div>;
}
