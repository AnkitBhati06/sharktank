import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, JetBrains_Mono, Manrope } from "next/font/google";
import { seo } from "@/content/event";
import "./globals.css";

const serif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: "normal",
  display: "swap",
  variable: "--font-dm-serif",
});
// Italic is only used for heading accents below the fold: not preloaded.
const serifItalic = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  display: "swap",
  variable: "--font-dm-serif-italic",
  preload: false,
});
const sans = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-manrope",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-jetbrains",
  preload: false,
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: seo.title,
  description: seo.description,
  openGraph: { title: seo.title, description: seo.description, type: "website", locale: "en_IN" },
  twitter: { card: "summary_large_image", title: seo.title, description: seo.description },
};

export const viewport: Viewport = {
  themeColor: "#ECE7DE",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${serif.variable} ${serifItalic.variable} ${sans.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
