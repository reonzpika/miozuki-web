import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";
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

// Sentry build-time wrapper. Uploads source maps when SENTRY_AUTH_TOKEN /
// SENTRY_ORG / SENTRY_PROJECT are present (set in the Vercel build env); when
// they are absent the build still succeeds and just skips the upload, so local
// and preview builds without Sentry env are unaffected.
export default withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // Quiet during CI builds, verbose locally.
  silent: !process.env.CI,
  // Upload a wider set of client bundles for more readable stack traces.
  widenClientFileUpload: true,
  // Proxy Sentry requests through this route so ad-blockers do not drop events.
  tunnelRoute: "/monitoring",
  // Strip Sentry SDK logger statements from the client bundle.
  disableLogger: true,
});
