import type { NextConfig } from "next";
import { redirects } from "./lib/redirects";

const nextConfig: NextConfig = {
  images: {
    qualities: [75, 82, 85, 95],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'miozuki.co.nz',
      },
    ],
  },
  // Redirects live in `lib/redirects.ts` so they can be appended to without
  // touching the image host allowlist above. See that file to add one.
  async redirects() {
    return redirects;
  },
};

export default nextConfig;
