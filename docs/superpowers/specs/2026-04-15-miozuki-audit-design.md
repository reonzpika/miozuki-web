# Miozuki Site Audit — Design Spec
**Date:** 2026-04-15
**Status:** Approved

---

## Overview

Automated audit of the live miozuki.co.nz Next.js frontend (migrated from Shopify native). Claude drives a Playwright Chromium browser via a single script, captures all issues, and writes a structured JSON report for follow-up LLM-driven fixes.

**Deliverable:** Bug report only. No persistent test suite.
**Target:** https://miozuki.co.nz (live)
**Tool:** Playwright CLI — `@playwright/test` + Chromium

---

## Audit Scope

### Tier 1 — Page Crawl (all routes)

Visit every page. Script first scrapes real product/collection/blog handles from the live site (not hardcoded), then visits each dynamic route.

**Static routes:**
- `/`
- `/collections`
- `/pages/about-us`
- `/pages/contact`
- `/pages/our-founder`
- `/pages/jewellery-care-guide`
- `/pages/moissanite-faq`
- `/pages/returns-refunds-policy`
- `/pages/size-guide`
- `/pages/warranty-cover`
- `/policies/shipping-policy`
- `/blogs/news`

**Dynamic routes (handles discovered at runtime):**
- `/products/[handle]` — first 3 products found
- `/collections/[handle]` — first 2 collections found
- `/blogs/news/[handle]` — first 2 posts found

**Captured per page:**
- Console errors (`page.on('console')` — `error` + `warning` level)
- Uncaught JS exceptions (`page.on('pageerror')`)
- Failed network requests (`page.on('response')` — status >= 400)
- Broken images (img elements with non-200 src responses)
- Screenshot (saved to `docs/audit/screenshots/`)

### Tier 2 — Functional Flows

**Product + cart flow:**
1. Navigate to a product page (first product discovered in Tier 1)
2. Select a variant if variant options exist
3. Click "Add to Cart"
4. Verify cart item count updates (header badge or cart page)
5. Navigate to cart
6. Verify cart renders with correct product/price
7. Update quantity — verify total recalculates
8. Remove item — verify cart empties correctly

**Checkout entry:**
1. Add a product to cart
2. Click "Proceed to Checkout" (or equivalent)
3. Follow redirect to Shopify hosted checkout (`checkout.shopify.com/...`)
4. Verify: order summary section loads, contact email field present, shipping address fields present
5. Stop before entering any payment or personal details

**Contact form:**
1. Navigate to `/pages/contact`
2. Submit empty form — verify validation errors appear
3. Submit with valid name/email/message — verify success state or network response to `/api/contact`

**Email subscribe:**
1. Inject `localStorage` flag to suppress 4s delay and force popup open immediately
2. Submit a test email address
3. Verify `/api/subscribe` returns 202

### Tier 3 — API Spot-checks

Direct calls via Playwright `request` context (no browser UI needed):

| Endpoint | Method | Payload | Expected |
|----------|--------|---------|----------|
| `/api/subscribe` | POST | `{ email: "audit-test@example.com", firstName: "Audit" }` | 202 |
| `/api/contact` | POST | valid contact payload | 200 or 201 |

---

## Script Architecture

**File:** `miozuki-web/scripts/audit.ts`
**Runtime:** `npx tsx scripts/audit.ts` (or `node --experimental-strip-types`)
**Mode:** Headed by default. Pass `--headless` flag for unattended.

```
audit.ts
├── CONFIG              — baseUrl, timeouts, outputDir, screenshotDir
├── Finding interface   — { id, severity, tier, page, type, message, url, screenshotPath? }
├── findings[]          — shared array, all issues appended here
├── helpers
│   ├── attachListeners(page)   — console + pageerror + response listeners
│   ├── screenshot(page, name)  — saves PNG, returns relative path
│   └── findHandles(page)       — scrapes product/collection/blog handles
├── runPageCrawl()      — Tier 1
├── runFlowTests()      — Tier 2: product, cart, checkout, contact, subscribe
├── runAPIChecks()      — Tier 3: direct request context calls
└── writeReport()       — writes JSON + markdown
```

**Severity assignment:**

| Severity | Criteria |
|----------|----------|
| `critical` | Page fails to load, checkout broken, cart broken, 5xx on any page |
| `high` | Uncaught JS exception, API returning unexpected status, broken image on product/homepage |
| `medium` | Console error on static page, form validation not working, broken image on secondary page |
| `low` | Console warning, cosmetic rendering issue |

**Finding types:**
`js-exception` | `console-error` | `console-warning` | `network-error` | `broken-image` | `flow-failure` | `api-failure` | `missing-element`

---

## Output Format

Two files written to `miozuki-web/docs/audit/`:

### 1. `audit-2026-04-15.json` (primary — LLM-ready)

```json
{
  "meta": {
    "date": "2026-04-15",
    "target": "https://miozuki.co.nz",
    "duration_seconds": 142,
    "pages_crawled": 17,
    "total_findings": 12
  },
  "summary": {
    "critical": 1,
    "high": 3,
    "medium": 5,
    "low": 3
  },
  "findings": [
    {
      "id": "F001",
      "severity": "critical",
      "tier": 2,
      "page": "/products/moissanite-solitaire-ring",
      "type": "flow-failure",
      "message": "Add to Cart button not found — selector '.add-to-cart-btn' returned null",
      "url": "https://miozuki.co.nz/products/moissanite-solitaire-ring",
      "screenshotPath": "docs/audit/screenshots/F001-add-to-cart.png"
    }
  ],
  "pages": [
    {
      "route": "/",
      "status": 200,
      "console_errors": 0,
      "network_errors": 0,
      "broken_images": 0,
      "screenshot": "docs/audit/screenshots/page-homepage.png"
    }
  ]
}
```

### 2. `audit-2026-04-15.md` (human summary)

```
# Miozuki Audit — 2026-04-15
## Summary
Pages crawled: 17 | Duration: 142s
Critical: 1 | High: 3 | Medium: 5 | Low: 3

## Findings by Severity
[grouped finding list with screenshot links]

## Pages Table
[route | status | console errors | network errors | screenshot]

## API Checks
[endpoint | method | status | result]

Full detail: docs/audit/audit-2026-04-15.json
```

---

## Constraints

- Do not enter payment details at any point during checkout testing
- Do not submit the contact form with a real email address — use `audit-test@example.com`
- Do not subscribe the email popup with a real address — use `audit-test@example.com`
- Playwright timeout: 30s per page, 60s for checkout redirect (Shopify CDN can be slow)
- Sequential page visits (no parallelism) to avoid Shopify rate-limiting
- Install command: `npm install -D @playwright/test && npx playwright install chromium`

---

## Setup

One command run from `miozuki-web/`:
```sh
npm install -D @playwright/test && npx playwright install chromium && npx tsx scripts/audit.ts
```

Dependencies added to `devDependencies`: `@playwright/test`, `tsx`
