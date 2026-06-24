import { defineConfig } from 'unlighthouse';

// On-demand, site-wide Lighthouse audit (performance, accessibility, SEO, best
// practices) across every page. Run with `npm run audit:lighthouse`, which
// crawls the site and opens an interactive dashboard. Complements the Playwright
// `audit` script (cart/checkout flows + broken images); this one is Lighthouse.
//
// Defaults to the live site. Override with LIGHTHOUSE_SITE to audit a Vercel
// preview before shipping, e.g.:
//   LIGHTHOUSE_SITE=https://miozuki-<hash>.vercel.app npm run audit:lighthouse
export default defineConfig({
  site: process.env.LIGHTHOUSE_SITE ?? 'https://www.miozuki.co.nz',
  outputPath: 'docs/audit/lighthouse',
  scanner: {
    // Mobile-first audience; switch to desktop in the dashboard when needed.
    device: 'mobile',
    // The admin is auth-gated and not a customer page; skip it.
    exclude: ['/admin', '/admin/.*'],
  },
  // One Chrome worker at a time. Higher concurrency crashes Chrome sessions
  // ("Protocol error: Session closed") on this machine; 1 is slower but stable.
  puppeteerClusterOptions: {
    maxConcurrency: 1,
  },
});
