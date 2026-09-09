// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Seed/demo listing photos are pinned to Unsplash's CDN (see db/seed.mjs).
      { protocol: "https", hostname: "images.unsplash.com" },
      // Owners paste their own hosted photo URLs from arbitrary hosts when
      // creating/editing a listing (see components/owner/PropertyForm.jsx),
      // so those hosts can't be pre-enumerated. Next.js 14.1+ supports a
      // wildcard hostname for exactly this case; https-only keeps it from
      // also serving plain-http image URLs.
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default nextConfig;