import type { NextConfig } from "next";

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
  // Cutover redirect map: old Shopify URLs that do not map 1:1 to a Next route.
  // Renamed routes (bespoke-order, appointment-online) match the old Shopify
  // slugs directly, so they need no redirect. These four are the leftovers.
  async redirects() {
    return [
      // Shopify default policy slug -> the content page on Next
      {
        source: '/policies/refund-policy',
        destination: '/pages/returns-refunds-policy',
        permanent: true,
      },
      // Old custom shipping page -> the canonical shipping policy (same content)
      {
        source: '/pages/shipping-delivery',
        destination: '/policies/shipping-policy',
        permanent: true,
      },
      // Empty legacy blog landing stub -> the journal index
      {
        source: '/pages/blogs',
        destination: '/blogs/news',
        permanent: true,
      },
      // Legacy secondary blog index -> the matching journal article
      {
        source: '/blogs/moissanite-vs-diamond-for-nz-engagement-rings',
        destination:
          '/blogs/news/moissanite-vs-diamond-for-nz-engagement-rings-9-crucial-differences-nobody-explains-clearly',
        permanent: true,
      },
      // Renamed Shopify pages (old slugs were indexed; new build renamed them).
      {
        source: '/pages/appointment',
        destination: '/pages/appointment-online',
        permanent: true,
      },
      {
        source: '/pages/custom-made',
        destination: '/pages/bespoke-order',
        permanent: true,
      },
      // Renamed collections (Shopify drifted the handles; old handles were indexed).
      {
        source: '/collections/moissanite-rings',
        destination: '/collections/moissanite-rings-nz',
        permanent: true,
      },
      {
        source: '/collections/necklaces',
        destination: '/collections/moissanite-necklace-nz',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
