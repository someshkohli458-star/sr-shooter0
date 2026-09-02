import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CreateX AI — Create. Imagine. Generate.",
  description: "Create images and videos with AI in one creative studio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
