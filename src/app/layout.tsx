/* ==========================================================================
   ROOT LAYOUT WRAPPER: NEXT.JS APP ROUTER CORE TEMPLATE
   ========================================================================== */

import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Captain Claw Portfolio | Asish - Full Stack Web Developer",
  description: "Asish - Interactive Playable Portfolio Website themed after Captain Claw. Discover professional Full Stack Web Developer skills, projects, and milestones through a gamified adventure.",
  keywords: [
    "Asish", 
    "Web Developer Portfolio", 
    "Captain Claw Game Portfolio", 
    "Playable Portfolio", 
    "Full Stack Developer", 
    "HTML5 Canvas Game", 
    "TypeScript"
  ],
  authors: [{ name: "Asish" }],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div id="app-container">
          {children}
        </div>
      </body>
    </html>
  );
}
