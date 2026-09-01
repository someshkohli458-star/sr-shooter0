import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata={title:"CYBERNEX",description:"Retro digital simulation and prank-experiment platform"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
