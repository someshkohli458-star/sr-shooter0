import "./globals.css";
import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: "CreateX AI — Create. Imagine. Generate.",
  description: "A focused AI workspace for creating images, videos, code and conversations.",
  applicationName: "CreateX AI",
  keywords: ["CreateX AI", "AI image generator", "AI video", "AI chat", "creative studio"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#07070a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" suppressHydrationWarning><body>{children}</body></html>;
}
