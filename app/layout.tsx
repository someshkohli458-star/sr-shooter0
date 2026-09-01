import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AURA + NEXUS",
  description: "Your Aura. Your Nexus. Your World.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
