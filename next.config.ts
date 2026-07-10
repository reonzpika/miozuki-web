import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
import createMDX from "@next/mdx";
import { redirects } from "./lib/redirects";

const nextConfig: NextConfig = {
  // Let .mdx files under app/ be routes (used by the guide hubs: /moissanite-guide,
  // /pearl-guide, /bridal-guide).
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
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

// remark-gfm adds GitHub-flavoured markdown tables (and strikethrough, task
// lists) to the guide-hub .mdx files. Without it, pipe-table syntax isn't
// parsed as a table at all, and every guide draft relies on tables for
// featured-snippet eligibility. Passed as a string, not an import: Turbopack
// (this project's default bundler) can't pass JS function references across
// its Rust boundary, only serializable plugin names.
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm"],
  },
});

// Sentry build-time wrapper. Uploads source maps when SENTRY_AUTH_TOKEN /
// SENTRY_ORG / SENTRY_PROJECT are present (set in the Vercel build env); when
// they are absent the build still succeeds and just skips the upload, so local
// and preview builds without Sentry env are unaffected.
export default withSentryConfig(withMDX(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Quiet during CI builds, verbose locally.
  silent: !process.env.CI,
  // Upload a wider set of client bundles for more readable stack traces.
  widenClientFileUpload: true,
  // Proxy Sentry requests through this route so ad-blockers do not drop events.
  tunnelRoute: "/monitoring",
});
