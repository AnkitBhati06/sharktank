import type { NextConfig } from "next";

// STATIC_EXPORT=1 produces a plain static site in ./out (any static host).
// Without it the app builds for Vercel / `next start`; the page is prerendered either way.
const staticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(staticExport ? { output: "export" as const } : {}),
  images: staticExport ? { unoptimized: true } : { formats: ["image/avif", "image/webp"] },
};

export default nextConfig;
