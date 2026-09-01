"use client";
import Link from "next/link";
import { Compass, MessageCircle, Plus, Sparkles, Users } from "lucide-react";
export default function BottomNav(){return <nav className="bottomNav"><Link href="/feed"><Compass size={20}/><span>Pulse</span></Link><Link href="/communities"><Users size={20}/><span>Nexus</span></Link><Link href="/feed" className="navCreate"><Plus size={22}/></Link><Link href="/messages"><MessageCircle size={20}/><span>Chat</span></Link><Link href="/profile"><Sparkles size={20}/><span>Aura</span></Link></nav>}
