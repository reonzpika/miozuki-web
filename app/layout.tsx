import type { Metadata, Viewport } from 'next';
import { preconnect } from 'react-dom';
import DeferredAnalytics from '@/components/deferred-analytics';
import { Playfair_Display, DM_Sans } from 'next/font/google';
import './globals.css';
import Header from '@/components/header';
import Footer from '@/components/footer';
import AnnouncementBar from '@/components/announcement-bar';
import { CartProvider } from '@/components/cart-provider';
import EmailPopup from '@/components/email-popup';
import EnquiryWidget from '@/components/enquiry-widget';
import AdvisorWidget from '@/components/advisor-widget';
import JsonLd from '@/components/json-ld';
import MetaPixel from '@/components/meta-pixel';
import Clarity from '@/components/clarity';
import StorefrontChrome from '@/components/storefront-chrome';
import AttributionCapture from '@/components/attribution-capture';

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;

// JewelryStore is a more specific schema.org subtype of Organization, and this
// block is the site's single canonical business-identity schema (site-wide, via
// the root layout, not duplicated per-page). If a page ever needs its own
// schema (e.g. a homepage FAQPage block), keep it additive, don't redeclare
// Organization/JewelryStore info there too.
const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'JewelryStore',
  name: 'Miozuki',
  url: 'https://www.miozuki.co.nz',
  logo: 'https://www.miozuki.co.nz/miozuki-logo-full-light.svg',
  description:
    'Japanese-inspired fine jewellery studio in Auckland, New Zealand, specialising in moissanite rings, earrings, necklaces, and custom bridal pieces in 925 sterling silver.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Auckland',
    addressRegion: 'Auckland',
    addressCountry: 'NZ',
  },
  email: 'info@miozuki.co.nz',
  founder: { '@type': 'Person', name: 'Ting Eguchi' },
  sameAs: [
    'https://www.instagram.com/miozukijewellery',
    'https://www.tiktok.com/@miozuki.nz',
    'https://www.facebook.com/profile.php?id=61578033779488',
  ],
  priceRange: '$$',
  areaServed: ['NZ', 'AU'],
};

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin'],
  display: 'swap',
});

const dmSans = DM_Sans({
  variable: '--font-dm-sans',
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f5f3ef',
};

export const metadata: Metadata = {
  // www is the canonical/production host; the apex 308-redirects to it. Point all
  // OG/canonical URLs at www so scrapers and search engines hit the 200 host, not
  // the redirecting apex.
  metadataBase: new URL('https://www.miozuki.co.nz'),
  title: 'Miozuki, Fine Jewellery',
  description:
    'Moissanite and pearl fine jewellery, ethically made and designed in New Zealand. Discover pieces that last a lifetime.',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    title: 'Miozuki, Fine Jewellery',
    description:
      'Moissanite and pearl fine jewellery, ethically made and designed in New Zealand.',
    url: 'https://www.miozuki.co.nz',
    siteName: 'Miozuki',
    type: 'website',
    locale: 'en_NZ',
    // /og-image.jpg is the magazine-masthead background generated via scripts/gen-image.mjs
    // (sidecar: scripts/prompts/og-image.prompt.md). No model-drawn wordmark, the og:title
    // above provides the brand name in unfurls. To overlay a Playfair "Miozuki" wordmark on
    // top later, switch to a dynamic next/og ImageResponse route.
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Miozuki, Fine Jewellery',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Miozuki, Fine Jewellery',
    description:
      'Moissanite and pearl fine jewellery, ethically made and designed in New Zealand.',
    images: ['/og-image.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Every LCP image (hero, product photos) is served from the Shopify CDN;
  // warming the connection before the image request shaves DNS+TLS time off
  // first paint.
  preconnect('https://cdn.shopify.com');
  return (
    <html lang="en" className={`${playfair.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <JsonLd data={ORGANIZATION_SCHEMA} />
        <MetaPixel />
        <Clarity />
        <AttributionCapture />
        <CartProvider>
          <StorefrontChrome>
            <div className="sticky top-0 z-50">
              <AnnouncementBar />
              <Header />
            </div>
          </StorefrontChrome>
          <div className="flex flex-col flex-1">{children}</div>
          <StorefrontChrome>
            <Footer />
            <EmailPopup />
            <EnquiryWidget />
            {/* Advisor renders only when the server holds the LaoZhang relay
                key, so the widget can never appear unconfigured. Add
                LAOZHANG_API_KEY in Vercel env + redeploy to switch it on. */}
            {process.env.LAOZHANG_API_KEY ? <AdvisorWidget /> : null}
          </StorefrontChrome>
        </CartProvider>
        {GA4_ID ? <DeferredAnalytics gaId={GA4_ID} /> : null}
      </body>
    </html>
  );
}
