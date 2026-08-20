import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Karla, Space_Grotesk } from "next/font/google";

import { ServiceWorker } from "@/components/service-worker";

import "./globals.css";

/*
 * Self-hosted at build time by next/font, so the app has no runtime request to
 * a font CDN and keeps its typography offline.
 */
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const karla = Karla({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-karla",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-plex-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TFT Set 18 flashcards",
  description:
    "Champions, traits, breakpoints and abilities for Teamfight Tactics Set 18. Nothing saved, nothing tracked.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f2eee7",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${karla.variable} ${plexMono.variable}`}>
      <body>
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
