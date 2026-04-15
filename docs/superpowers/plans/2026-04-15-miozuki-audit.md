# Miozuki Site Audit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Write and run a single Playwright script that audits miozuki.co.nz end-to-end and outputs a structured JSON + markdown bug report.

**Architecture:** A standalone TypeScript script (`scripts/audit.ts`) using `@playwright/test`'s `chromium` and `request` APIs. Three tiers: page crawl (all 15+ routes), functional flows (cart drawer, checkout entry, contact form, email popup), and direct API spot-checks. All findings are pushed to a shared array and written to `docs/audit/audit-YYYY-MM-DD.json` (LLM-ready) and `.md` (human summary).

**Tech Stack:** `@playwright/test` (browser + request), `tsx` (TypeScript runner), Node.js fs/path

---

## Spec corrections (vs design doc)

- Cart is a **drawer** (slide-in panel), not a `/cart` page. No quantity update UI exists — only Remove per item. The spec's "update quantity" step is not implementable; this is documented in the plan as a design gap.
- `/api/subscribe` returns **200** with `{ ok: true }`, not 202. The Klaviyo 202 is wrapped. Plan uses 200 as expected.
- `/api/contact` returns **200** with `{ ok: true }`.

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `scripts/audit.ts` | Full audit script |
| Modify | `package.json` | Add devDependencies + audit scripts |
| Create (at runtime) | `docs/audit/audit-YYYY-MM-DD.json` | LLM-ready findings |
| Create (at runtime) | `docs/audit/audit-YYYY-MM-DD.md` | Human summary |
| Create (at runtime) | `docs/audit/screenshots/*.png` | Evidence screenshots |

---

## Task 1: Install dependencies and add package.json scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install Playwright and tsx**

Run from `miozuki-web/`:
```bash
npm install -D @playwright/test tsx && npx playwright install chromium
```

Expected output ends with: `Chromium ... downloaded to ...`

- [ ] **Step 2: Add audit scripts to package.json**

Open `package.json`. Add to `"scripts"`:
```json
"audit": "tsx scripts/audit.ts",
"audit:headless": "tsx scripts/audit.ts --headless"
```

`devDependencies` will now include `@playwright/test` and `tsx` (versions from npm).

- [ ] **Step 3: Verify install**

```bash
npx playwright --version
```

Expected: `Version 1.5x.x` (or similar — any version).

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add playwright and tsx for site audit script"
```

---

## Task 2: Scaffold audit.ts — types, CONFIG, helpers

**Files:**
- Create: `scripts/audit.ts`

- [ ] **Step 1: Create the file with all types, CONFIG, and helper functions**

Create `scripts/audit.ts` with this complete content:

```typescript
import { chromium, request as playwrightRequest } from '@playwright/test'
import type { Browser, Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

// ---- Config ----

const CONFIG = {
  baseUrl: process.env.AUDIT_URL ?? 'https://miozuki.co.nz',
  headless: process.argv.includes('--headless'),
  outputDir: path.resolve(process.cwd(), 'docs/audit'),
  screenshotDir: path.resolve(process.cwd(), 'docs/audit/screenshots'),
  pageTimeout: 30_000,
  checkoutTimeout: 60_000,
  date: new Date().toISOString().split('T')[0],
}

// ---- Types ----

type Severity = 'critical' | 'high' | 'medium' | 'low'

type FindingType =
  | 'js-exception'
  | 'console-error'
  | 'console-warning'
  | 'network-error'
  | 'broken-image'
  | 'flow-failure'
  | 'api-failure'
  | 'missing-element'

interface Finding {
  id: string
  severity: Severity
  tier: 1 | 2 | 3
  page: string
  type: FindingType
  message: string
  url: string
  screenshotPath?: string
}

interface PageResult {
  route: string
  url: string
  status: number
  console_errors: number
  network_errors: number
  broken_images: number
  screenshot: string
}

interface APIResult {
  endpoint: string
  method: string
  status: number
  result: 'ok' | 'unexpected'
  detail: string
}

interface AuditReport {
  meta: {
    date: string
    target: string
    duration_seconds: number
    pages_crawled: number
    total_findings: number
  }
  summary: {
    critical: number
    high: number
    medium: number
    low: number
  }
  findings: Finding[]
  pages: PageResult[]
  api_checks: APIResult[]
}

interface Handles {
  products: string[]
  collections: string[]
  blogPosts: string[]
}

type Counter = { n: number }

// ---- Helpers ----

function makeFinding(counter: Counter, fields: Omit<Finding, 'id'>): Finding {
  return { id: `F${String(++counter.n).padStart(3, '0')}`, ...fields }
}

async function takeScreenshot(page: Page, name: string): Promise<string> {
  const filePath = path.join(CONFIG.screenshotDir, name)
  try {
    await page.screenshot({ path: filePath, fullPage: false })
  } catch {
    // Screenshot failure is non-fatal
  }
  return `docs/audit/screenshots/${name}`
}

function attachListeners(
  page: Page,
  findings: Finding[],
  counter: Counter,
  route: string,
  url: string
): void {
  page.on('console', msg => {
    const type = msg.type()
    if (type === 'error') {
      findings.push(makeFinding(counter, {
        severity: 'medium',
        tier: 1,
        page: route,
        type: 'console-error',
        message: msg.text(),
        url,
      }))
    } else if (type === 'warning') {
      findings.push(makeFinding(counter, {
        severity: 'low',
        tier: 1,
        page: route,
        type: 'console-warning',
        message: msg.text(),
        url,
      }))
    }
  })

  page.on('pageerror', err => {
    findings.push(makeFinding(counter, {
      severity: 'high',
      tier: 1,
      page: route,
      type: 'js-exception',
      message: err.message,
      url,
    }))
  })

  page.on('response', response => {
    const status = response.status()
    if (status >= 400) {
      const isKeyPage = route === '/' || route.startsWith('/products/')
      findings.push(makeFinding(counter, {
        severity: status >= 500 ? 'critical' : isKeyPage ? 'high' : 'medium',
        tier: 1,
        page: route,
        type: 'network-error',
        message: `HTTP ${status} — ${response.url()}`,
        url,
      }))
    }
  })
}
```

Leave the file open — functions will be added in subsequent tasks.

- [ ] **Step 2: Verify types compile**

```bash
npx tsc --noEmit --strict --moduleResolution node --esModuleInterop scripts/audit.ts 2>&1 | head -20
```

Expected: no output (no errors). If errors appear, they are type import issues — check that `@playwright/test` is installed.

- [ ] **Step 3: Commit**

```bash
git add scripts/audit.ts
git commit -m "chore: scaffold audit.ts types, config, and helpers"
```

---

## Task 3: Implement handle discovery

**Files:**
- Modify: `scripts/audit.ts` (append function)

- [ ] **Step 1: Append discoverHandles to audit.ts**

Append to `scripts/audit.ts`:

```typescript
// ---- Handle discovery ----

async function discoverHandles(browser: Browser): Promise<Handles> {
  const page = await browser.newPage()
  const handles: Handles = { products: [], collections: [], blogPosts: [] }

  try {
    // Collect product and collection handles from /collections
    await page.goto(`${CONFIG.baseUrl}/collections`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.pageTimeout,
    })

    handles.products = await page.$$eval('a[href*="/products/"]', links =>
      [...new Set(
        links
          .map(l => (l as HTMLAnchorElement).href.match(/\/products\/([^/?#]+)/)?.[1])
          .filter((h): h is string => !!h)
      )]
    )

    handles.collections = await page.$$eval('a[href*="/collections/"]', links =>
      [...new Set(
        links
          .map(l => (l as HTMLAnchorElement).href.match(/\/collections\/([^/?#]+)/)?.[1])
          .filter((h): h is string => !!h && h !== 'all')
      )]
    )

    // Collect blog post handles from /blogs/news
    await page.goto(`${CONFIG.baseUrl}/blogs/news`, {
      waitUntil: 'networkidle',
      timeout: CONFIG.pageTimeout,
    })

    handles.blogPosts = await page.$$eval('a[href*="/blogs/news/"]', links =>
      [...new Set(
        links
          .map(l => (l as HTMLAnchorElement).href.match(/\/blogs\/news\/([^/?#]+)/)?.[1])
          .filter((h): h is string => !!h)
      )]
    )
  } finally {
    await page.close()
  }

  return handles
}
```

- [ ] **Step 2: Add a quick smoke test main and run it**

Temporarily append to `scripts/audit.ts`:

```typescript
// TEMP SMOKE TEST — remove after Task 3
;(async () => {
  const browser = await chromium.launch({ headless: true })
  const handles = await discoverHandles(browser)
  console.log('handles:', JSON.stringify(handles, null, 2))
  await browser.close()
})()
```

Run:
```bash
npm run audit:headless 2>&1 | head -30
```

Expected: JSON object with `products`, `collections`, `blogPosts` arrays, each containing at least one handle string.

- [ ] **Step 3: Remove the smoke test block, commit**

Remove the `TEMP SMOKE TEST` block, then:

```bash
git add scripts/audit.ts
git commit -m "chore: add discoverHandles to audit script"
```

---

## Task 4: Implement page crawl (Tier 1)

**Files:**
- Modify: `scripts/audit.ts` (append function)

- [ ] **Step 1: Append runPageCrawl to audit.ts**

Append to `scripts/audit.ts`:

```typescript
// ---- Tier 1: Page crawl ----

async function runPageCrawl(
  browser: Browser,
  allFindings: Finding[],
  counter: Counter,
  handles: Handles
): Promise<PageResult[]> {
  const results: PageResult[] = []

  const staticRoutes = [
    '/',
    '/collections',
    '/pages/about-us',
    '/pages/contact',
    '/pages/our-founder',
    '/pages/jewellery-care-guide',
    '/pages/moissanite-faq',
    '/pages/returns-refunds-policy',
    '/pages/size-guide',
    '/pages/warranty-cover',
    '/policies/shipping-policy',
    '/blogs/news',
  ]

  const dynamicRoutes = [
    ...handles.products.slice(0, 3).map(h => `/products/${h}`),
    ...handles.collections.slice(0, 2).map(h => `/collections/${h}`),
    ...handles.blogPosts.slice(0, 2).map(h => `/blogs/news/${h}`),
  ]

  const allRoutes = [...staticRoutes, ...dynamicRoutes]

  for (const route of allRoutes) {
    const url = `${CONFIG.baseUrl}${route}`
    const pageFindings: Finding[] = []
    const page = await browser.newPage()

    attachListeners(page, pageFindings, counter, route, url)

    let status = 0
    let brokenImages = 0

    try {
      const response = await page.goto(url, {
        waitUntil: 'networkidle',
        timeout: CONFIG.pageTimeout,
      })
      status = response?.status() ?? 0

      if (status >= 500) {
        pageFindings.push(makeFinding(counter, {
          severity: 'critical',
          tier: 1,
          page: route,
          type: 'flow-failure',
          message: `Page returned HTTP ${status}`,
          url,
        }))
      }

      brokenImages = await page.evaluate(() =>
        Array.from(document.querySelectorAll('img'))
          .filter(img => !img.complete || img.naturalWidth === 0).length
      )

      if (brokenImages > 0) {
        const isKeyPage = route === '/' || route.startsWith('/products/')
        pageFindings.push(makeFinding(counter, {
          severity: isKeyPage ? 'high' : 'medium',
          tier: 1,
          page: route,
          type: 'broken-image',
          message: `${brokenImages} broken image(s) detected`,
          url,
        }))
      }
    } catch (err) {
      pageFindings.push(makeFinding(counter, {
        severity: 'critical',
        tier: 1,
        page: route,
        type: 'flow-failure',
        message: `Navigation failed: ${(err as Error).message}`,
        url,
      }))
    }

    const screenshotSlug = route.replace(/\//g, '-').replace(/^-/, '') || 'homepage'
    const screenshotPath = await takeScreenshot(page, `page-${screenshotSlug}.png`)

    allFindings.push(...pageFindings)

    results.push({
      route,
      url,
      status,
      console_errors: pageFindings.filter(f => f.type === 'console-error').length,
      network_errors: pageFindings.filter(f => f.type === 'network-error').length,
      broken_images: brokenImages,
      screenshot: screenshotPath,
    })

    console.log(`  [${status}] ${route} — ${pageFindings.length} finding(s)`)
    await page.close()
  }

  return results
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/audit.ts
git commit -m "chore: add runPageCrawl (Tier 1) to audit script"
```

---

## Task 5: Implement cart drawer flow (Tier 2a)

**Files:**
- Modify: `scripts/audit.ts` (append function)

Cart context: The cart is a slide-in drawer triggered by clicking the cart icon button (`aria-label="Cart"`). There is no `/cart` page and no quantity update UI — only a Remove button per item. This function tests: add to cart, open drawer, verify item appears, remove item.

- [ ] **Step 1: Append runCartFlow to audit.ts**

Append to `scripts/audit.ts`:

```typescript
// ---- Tier 2a: Cart drawer flow ----

async function runCartFlow(
  browser: Browser,
  allFindings: Finding[],
  counter: Counter,
  productHandle: string
): Promise<void> {
  const url = `${CONFIG.baseUrl}/products/${productHandle}`
  const page = await browser.newPage()

  attachListeners(page, allFindings, counter, `/products/${productHandle}`, url)

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: CONFIG.pageTimeout })

    // Verify Add to Cart button exists
    const addBtn = page.getByRole('button', { name: 'Add to Cart' })
    if (!(await addBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
      allFindings.push(makeFinding(counter, {
        severity: 'critical',
        tier: 2,
        page: `/products/${productHandle}`,
        type: 'missing-element',
        message: 'Add to Cart button not found on product page',
        url,
        screenshotPath: await takeScreenshot(page, 'flow-cart-no-add-btn.png'),
      }))
      return
    }

    await addBtn.click()

    // Wait for button state to change (confirms cart action fired)
    const stateChanged = await page.waitForFunction(
      () => {
        const btns = Array.from(document.querySelectorAll('button'))
        return btns.some(b => b.textContent?.includes('Adding') || b.textContent?.includes('Added'))
      },
      { timeout: 5000 }
    ).then(() => true).catch(() => false)

    if (!stateChanged) {
      allFindings.push(makeFinding(counter, {
        severity: 'high',
        tier: 2,
        page: `/products/${productHandle}`,
        type: 'flow-failure',
        message: 'Add to Cart button did not change state — cart may not have updated',
        url,
        screenshotPath: await takeScreenshot(page, 'flow-cart-no-state-change.png'),
      }))
    }

    await page.waitForTimeout(2000) // wait for cart drawer animation and API response

    // Open cart drawer via header cart icon
    const cartIcon = page.getByRole('button', { name: /Cart/i })
    await cartIcon.click()
    await page.waitForTimeout(500)

    // Verify drawer is open
    const cartHeading = page.getByRole('heading', { name: 'Your Cart' })
    if (!(await cartHeading.isVisible({ timeout: 3000 }).catch(() => false))) {
      allFindings.push(makeFinding(counter, {
        severity: 'critical',
        tier: 2,
        page: 'cart-drawer',
        type: 'flow-failure',
        message: 'Cart drawer did not open after clicking cart icon',
        url,
        screenshotPath: await takeScreenshot(page, 'flow-cart-drawer-closed.png'),
      }))
      return
    }

    await takeScreenshot(page, 'flow-cart-drawer-open.png')

    // Verify item appears (Remove button visible means item loaded)
    const removeBtn = page.getByRole('button', { name: 'Remove item' })
    if (!(await removeBtn.isVisible({ timeout: 3000 }).catch(() => false))) {
      allFindings.push(makeFinding(counter, {
        severity: 'high',
        tier: 2,
        page: 'cart-drawer',
        type: 'flow-failure',
        message: 'Cart drawer open but item not visible (Remove button not found)',
        url,
        screenshotPath: await takeScreenshot(page, 'flow-cart-item-missing.png'),
      }))
      return
    }

    // Remove item
    await removeBtn.click()
    await page.waitForTimeout(1500)

    // Verify empty state
    const emptyText = page.getByText('Your cart is empty.')
    if (!(await emptyText.isVisible({ timeout: 3000 }).catch(() => false))) {
      allFindings.push(makeFinding(counter, {
        severity: 'medium',
        tier: 2,
        page: 'cart-drawer',
        type: 'flow-failure',
        message: 'Cart did not show empty state after removing item',
        url,
        screenshotPath: await takeScreenshot(page, 'flow-cart-remove-failed.png'),
      }))
    } else {
      await takeScreenshot(page, 'flow-cart-empty.png')
    }
  } finally {
    await page.close()
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/audit.ts
git commit -m "chore: add runCartFlow (Tier 2a) to audit script"
```

---

## Task 6: Implement checkout entry flow (Tier 2b)

**Files:**
- Modify: `scripts/audit.ts` (append function)

Checkout context: Clicking "Checkout" in the cart drawer navigates to Shopify's hosted checkout (`checkout.shopify.com`). The script verifies the redirect succeeds and that order summary, email field, and shipping address fields are present. It does NOT enter any data.

- [ ] **Step 1: Append runCheckoutFlow to audit.ts**

Append to `scripts/audit.ts`:

```typescript
// ---- Tier 2b: Checkout entry ----

async function runCheckoutFlow(
  browser: Browser,
  allFindings: Finding[],
  counter: Counter,
  productHandle: string
): Promise<void> {
  const url = `${CONFIG.baseUrl}/products/${productHandle}`
  const page = await browser.newPage()

  try {
    // Add a product to cart
    await page.goto(url, { waitUntil: 'networkidle', timeout: CONFIG.pageTimeout })

    const addBtn = page.getByRole('button', { name: 'Add to Cart' })
    if (!(await addBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
      allFindings.push(makeFinding(counter, {
        severity: 'critical',
        tier: 2,
        page: 'checkout-entry',
        type: 'flow-failure',
        message: 'Cannot test checkout — Add to Cart button not found',
        url,
      }))
      return
    }

    await addBtn.click()
    await page.waitForTimeout(2500)

    // Open cart drawer
    await page.getByRole('button', { name: /Cart/i }).click()
    await page.waitForTimeout(500)

    // Click Checkout link in drawer footer
    const checkoutLink = page.getByRole('link', { name: 'Checkout' })
    if (!(await checkoutLink.isVisible({ timeout: 3000 }).catch(() => false))) {
      allFindings.push(makeFinding(counter, {
        severity: 'critical',
        tier: 2,
        page: 'cart-drawer',
        type: 'missing-element',
        message: 'Checkout link not visible in cart drawer footer',
        url: CONFIG.baseUrl,
        screenshotPath: await takeScreenshot(page, 'flow-checkout-no-link.png'),
      }))
      return
    }

    // Navigate to Shopify checkout
    let checkoutUrl = ''
    try {
      await Promise.all([
        page.waitForURL(/checkout\.shopify\.com|shopify\.com\/checkouts/, {
          timeout: CONFIG.checkoutTimeout,
        }),
        checkoutLink.click(),
      ])
      checkoutUrl = page.url()
    } catch {
      allFindings.push(makeFinding(counter, {
        severity: 'critical',
        tier: 2,
        page: 'checkout-entry',
        type: 'flow-failure',
        message: 'Checkout redirect did not reach shopify.com checkout URL within 60s',
        url: CONFIG.baseUrl,
        screenshotPath: await takeScreenshot(page, 'flow-checkout-redirect-failed.png'),
      }))
      return
    }

    await page.waitForTimeout(2000)
    await takeScreenshot(page, 'flow-checkout-landing.png')

    // Verify order summary section
    const orderSummarySelectors = [
      '[data-order-summary]',
      '[class*="order-summary"]',
      'section[aria-label*="order" i]',
      '[id*="order-summary"]',
      '[class*="OrderSummary"]',
    ]
    let summaryFound = false
    for (const sel of orderSummarySelectors) {
      if (await page.locator(sel).first().isVisible({ timeout: 2000 }).catch(() => false)) {
        summaryFound = true
        break
      }
    }
    if (!summaryFound) {
      allFindings.push(makeFinding(counter, {
        severity: 'high',
        tier: 2,
        page: 'shopify-checkout',
        type: 'missing-element',
        message: 'Order summary section not detected on Shopify checkout page',
        url: checkoutUrl,
      }))
    }

    // Verify email/contact field
    const emailField = page
      .getByLabel(/email/i)
      .or(page.locator('input[type="email"]'))
      .first()
    if (!(await emailField.isVisible({ timeout: 3000 }).catch(() => false))) {
      allFindings.push(makeFinding(counter, {
        severity: 'high',
        tier: 2,
        page: 'shopify-checkout',
        type: 'missing-element',
        message: 'Email/contact field not found on Shopify checkout page',
        url: checkoutUrl,
      }))
    }

    // Verify shipping first name field
    const firstNameField = page
      .getByLabel(/first name/i)
      .or(page.locator('input[autocomplete="given-name"]'))
      .first()
    if (!(await firstNameField.isVisible({ timeout: 3000 }).catch(() => false))) {
      allFindings.push(makeFinding(counter, {
        severity: 'high',
        tier: 2,
        page: 'shopify-checkout',
        type: 'missing-element',
        message: 'First name / shipping address field not found on Shopify checkout',
        url: checkoutUrl,
        screenshotPath: await takeScreenshot(page, 'flow-checkout-no-shipping.png'),
      }))
    }
  } finally {
    await page.close()
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/audit.ts
git commit -m "chore: add runCheckoutFlow (Tier 2b) to audit script"
```

---

## Task 7: Implement contact form testing (Tier 2c)

**Files:**
- Modify: `scripts/audit.ts` (append function)

Contact form context: at `/pages/contact`. Fields with `id` attributes: `#name` (required), `#email` (required), `#order` (optional), `#message` (required). Uses HTML5 `required` attribute for validation. Success renders a div with text "Message received." API returns `{ ok: true }` with HTTP 200.

- [ ] **Step 1: Append runContactForm to audit.ts**

Append to `scripts/audit.ts`:

```typescript
// ---- Tier 2c: Contact form ----

async function runContactForm(
  browser: Browser,
  allFindings: Finding[],
  counter: Counter
): Promise<void> {
  const url = `${CONFIG.baseUrl}/pages/contact`
  const page = await browser.newPage()

  attachListeners(page, allFindings, counter, '/pages/contact', url)

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: CONFIG.pageTimeout })

    const nameInput = page.locator('#name')
    const emailInput = page.locator('#email')
    const messageInput = page.locator('#message')

    // Verify required fields exist
    for (const [label, locator] of [
      ['#name', nameInput],
      ['#email', emailInput],
      ['#message', messageInput],
    ] as const) {
      if (!(await locator.isVisible({ timeout: 3000 }).catch(() => false))) {
        allFindings.push(makeFinding(counter, {
          severity: 'high',
          tier: 2,
          page: '/pages/contact',
          type: 'missing-element',
          message: `Contact form field '${label}' not found`,
          url,
        }))
      }
    }

    // Submit empty form — HTML5 required validation should block submission
    const submitBtn = page.getByRole('button', { name: 'Send Message' })
    await submitBtn.click()
    await page.waitForTimeout(500)

    const successMsg = page.getByText('Message received.')
    if (await successMsg.isVisible({ timeout: 1000 }).catch(() => false)) {
      allFindings.push(makeFinding(counter, {
        severity: 'high',
        tier: 2,
        page: '/pages/contact',
        type: 'flow-failure',
        message: 'Contact form accepted empty submission — required field validation not blocking',
        url,
        screenshotPath: await takeScreenshot(page, 'flow-contact-empty-submit-accepted.png'),
      }))
      return
    }

    // Submit valid form
    await nameInput.fill('Audit Test')
    await emailInput.fill('audit-test@example.com')
    await messageInput.fill('Automated audit test submission — please ignore.')

    await takeScreenshot(page, 'flow-contact-filled.png')

    const [contactResponse] = await Promise.all([
      page.waitForResponse(
        r => r.url().includes('/api/contact'),
        { timeout: 15_000 }
      ),
      submitBtn.click(),
    ])

    const status = contactResponse.status()
    if (status !== 200) {
      allFindings.push(makeFinding(counter, {
        severity: 'high',
        tier: 2,
        page: '/pages/contact',
        type: 'api-failure',
        message: `/api/contact returned ${status} (expected 200)`,
        url,
        screenshotPath: await takeScreenshot(page, 'flow-contact-api-error.png'),
      }))
    } else {
      await page.waitForTimeout(500)
      if (!(await successMsg.isVisible({ timeout: 2000 }).catch(() => false))) {
        allFindings.push(makeFinding(counter, {
          severity: 'medium',
          tier: 2,
          page: '/pages/contact',
          type: 'flow-failure',
          message: '/api/contact returned 200 but success message did not appear',
          url,
          screenshotPath: await takeScreenshot(page, 'flow-contact-no-success.png'),
        }))
      } else {
        await takeScreenshot(page, 'flow-contact-success.png')
      }
    }
  } finally {
    await page.close()
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/audit.ts
git commit -m "chore: add runContactForm (Tier 2c) to audit script"
```

---

## Task 8: Implement email popup testing (Tier 2d)

**Files:**
- Modify: `scripts/audit.ts` (append function)

Popup context: defined in `components/email-popup.tsx`. localStorage key `'miozuki_popup_v1'` controls suppression. On a fresh Playwright browser context (no localStorage), `shouldShow()` returns `true` and the popup fires after a 4s `setTimeout`. No injection needed — just wait 5s. Popup heading: "New drops, first." Submit button: "Join the List". API returns HTTP 200 on success. Success message: "you're on the list".

- [ ] **Step 1: Append runEmailPopup to audit.ts**

Append to `scripts/audit.ts`:

```typescript
// ---- Tier 2d: Email popup ----

async function runEmailPopup(
  browser: Browser,
  allFindings: Finding[],
  counter: Counter
): Promise<void> {
  const url = CONFIG.baseUrl
  const page = await browser.newPage()

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: CONFIG.pageTimeout })

    // Fresh context: localStorage is empty so shouldShow() returns true.
    // Popup fires after 4s setTimeout — wait 5s.
    await page.waitForTimeout(5000)

    const popupHeading = page.getByRole('heading', { name: "New drops, first." })
    if (!(await popupHeading.isVisible({ timeout: 2000 }).catch(() => false))) {
      allFindings.push(makeFinding(counter, {
        severity: 'medium',
        tier: 2,
        page: '/',
        type: 'flow-failure',
        message: 'Email popup did not appear after 5s on fresh session (expected — localStorage empty)',
        url,
        screenshotPath: await takeScreenshot(page, 'flow-popup-not-shown.png'),
      }))
      return
    }

    await takeScreenshot(page, 'flow-popup-open.png')

    await page.getByPlaceholder('Your name').fill('Audit Test')
    await page.getByPlaceholder('your@email.com').fill('audit-test@example.com')

    const [subscribeResponse] = await Promise.all([
      page.waitForResponse(
        r => r.url().includes('/api/subscribe'),
        { timeout: 10_000 }
      ),
      page.getByRole('button', { name: 'Join the List' }).click(),
    ])

    const status = subscribeResponse.status()
    if (status !== 200) {
      allFindings.push(makeFinding(counter, {
        severity: 'high',
        tier: 2,
        page: '/',
        type: 'api-failure',
        message: `/api/subscribe returned ${status} (expected 200)`,
        url,
        screenshotPath: await takeScreenshot(page, 'flow-popup-api-error.png'),
      }))
    } else {
      await page.waitForTimeout(500)
      const successMsg = page.getByText(/you're on the list/i)
      if (!(await successMsg.isVisible({ timeout: 2000 }).catch(() => false))) {
        allFindings.push(makeFinding(counter, {
          severity: 'medium',
          tier: 2,
          page: '/',
          type: 'flow-failure',
          message: '/api/subscribe returned 200 but success message not visible in popup',
          url,
          screenshotPath: await takeScreenshot(page, 'flow-popup-no-success.png'),
        }))
      } else {
        await takeScreenshot(page, 'flow-popup-success.png')
      }
    }
  } finally {
    await page.close()
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/audit.ts
git commit -m "chore: add runEmailPopup (Tier 2d) to audit script"
```

---

## Task 9: Implement API spot-checks (Tier 3)

**Files:**
- Modify: `scripts/audit.ts` (append function)

API context: Both `/api/subscribe` and `/api/contact` return HTTP 200 with `{ ok: true }` on success. `/api/contact` calls Klaviyo Events API. `/api/subscribe` calls Klaviyo profile subscription API. Uses Playwright's standalone `request` context (no browser needed).

- [ ] **Step 1: Append runAPIChecks to audit.ts**

Append to `scripts/audit.ts`:

```typescript
// ---- Tier 3: API spot-checks ----

async function runAPIChecks(
  findings: Finding[],
  counter: Counter
): Promise<APIResult[]> {
  const results: APIResult[] = []
  const apiContext = await playwrightRequest.newContext({ baseURL: CONFIG.baseUrl })

  // POST /api/subscribe
  try {
    const res = await apiContext.post('/api/subscribe', {
      data: { email: 'audit-test@example.com', name: 'Audit Test' },
    })
    const status = res.status()
    const ok = status === 200
    results.push({
      endpoint: '/api/subscribe',
      method: 'POST',
      status,
      result: ok ? 'ok' : 'unexpected',
      detail: ok ? 'Returned 200 with ok:true' : `Unexpected status ${status}`,
    })
    if (!ok) {
      findings.push(makeFinding(counter, {
        severity: 'high',
        tier: 3,
        page: '/api/subscribe',
        type: 'api-failure',
        message: `POST /api/subscribe returned ${status} (expected 200)`,
        url: `${CONFIG.baseUrl}/api/subscribe`,
      }))
    }
  } catch (err) {
    const msg = (err as Error).message
    results.push({ endpoint: '/api/subscribe', method: 'POST', status: 0, result: 'unexpected', detail: `Request threw: ${msg}` })
    findings.push(makeFinding(counter, {
      severity: 'critical',
      tier: 3,
      page: '/api/subscribe',
      type: 'api-failure',
      message: `POST /api/subscribe threw: ${msg}`,
      url: `${CONFIG.baseUrl}/api/subscribe`,
    }))
  }

  // POST /api/contact
  try {
    const res = await apiContext.post('/api/contact', {
      data: {
        name: 'Audit Test',
        email: 'audit-test@example.com',
        order: '',
        message: 'Automated audit test — please ignore.',
      },
    })
    const status = res.status()
    const ok = status === 200
    results.push({
      endpoint: '/api/contact',
      method: 'POST',
      status,
      result: ok ? 'ok' : 'unexpected',
      detail: ok ? 'Returned 200 with ok:true' : `Unexpected status ${status}`,
    })
    if (!ok) {
      findings.push(makeFinding(counter, {
        severity: 'high',
        tier: 3,
        page: '/api/contact',
        type: 'api-failure',
        message: `POST /api/contact returned ${status} (expected 200)`,
        url: `${CONFIG.baseUrl}/api/contact`,
      }))
    }
  } catch (err) {
    const msg = (err as Error).message
    results.push({ endpoint: '/api/contact', method: 'POST', status: 0, result: 'unexpected', detail: `Request threw: ${msg}` })
    findings.push(makeFinding(counter, {
      severity: 'critical',
      tier: 3,
      page: '/api/contact',
      type: 'api-failure',
      message: `POST /api/contact threw: ${msg}`,
      url: `${CONFIG.baseUrl}/api/contact`,
    }))
  }

  await apiContext.dispose()
  return results
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/audit.ts
git commit -m "chore: add runAPIChecks (Tier 3) to audit script"
```

---

## Task 10: Implement report writer

**Files:**
- Modify: `scripts/audit.ts` (append functions)

- [ ] **Step 1: Append generateMarkdown and writeReport to audit.ts**

Append to `scripts/audit.ts`:

```typescript
// ---- Report writer ----

function generateMarkdown(report: AuditReport): string {
  const { meta, summary, findings, pages, api_checks } = report

  const findingBlock = (f: Finding) =>
    `### ${f.id} — ${f.page} [${f.type}]\n` +
    `- **Severity:** ${f.severity}\n` +
    `- **Tier:** ${f.tier}\n` +
    `- **URL:** ${f.url}\n` +
    `- **Message:** ${f.message}` +
    (f.screenshotPath ? `\n- **Screenshot:** ${f.screenshotPath}` : '')

  const severities: Severity[] = ['critical', 'high', 'medium', 'low']
  const sections = severities
    .map(s => {
      const items = findings.filter(f => f.severity === s)
      if (!items.length) return ''
      const title = s.charAt(0).toUpperCase() + s.slice(1)
      return `## ${title} (${items.length})\n\n${items.map(findingBlock).join('\n\n')}`
    })
    .filter(Boolean)
    .join('\n\n')

  const pagesTable = [
    '| Route | Status | Console Errors | Network Errors | Broken Images |',
    '|-------|--------|---------------|----------------|---------------|',
    ...pages.map(
      p => `| ${p.route} | ${p.status} | ${p.console_errors} | ${p.network_errors} | ${p.broken_images} |`
    ),
  ].join('\n')

  const apiTable = [
    '| Endpoint | Method | Status | Result | Detail |',
    '|----------|--------|--------|--------|--------|',
    ...api_checks.map(
      a => `| ${a.endpoint} | ${a.method} | ${a.status} | ${a.result} | ${a.detail} |`
    ),
  ].join('\n')

  return [
    `# Miozuki Audit — ${meta.date}`,
    '',
    '## Summary',
    `- **Target:** ${meta.target}`,
    `- **Duration:** ${meta.duration_seconds}s`,
    `- **Pages crawled:** ${meta.pages_crawled}`,
    `- **Total findings:** ${meta.total_findings}`,
    `- Critical: ${summary.critical} | High: ${summary.high} | Medium: ${summary.medium} | Low: ${summary.low}`,
    '',
    `Full detail: docs/audit/audit-${meta.date}.json`,
    '',
    sections,
    '',
    '## Pages Crawled',
    '',
    pagesTable,
    '',
    '## API Checks',
    '',
    apiTable,
  ].join('\n')
}

async function writeReport(
  findings: Finding[],
  pages: PageResult[],
  apiChecks: APIResult[],
  startTime: number
): Promise<void> {
  const durationSeconds = Math.round((Date.now() - startTime) / 1000)
  const summary = {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
  }

  const report: AuditReport = {
    meta: {
      date: CONFIG.date,
      target: CONFIG.baseUrl,
      duration_seconds: durationSeconds,
      pages_crawled: pages.length,
      total_findings: findings.length,
    },
    summary,
    findings,
    pages,
    api_checks: apiChecks,
  }

  fs.mkdirSync(CONFIG.outputDir, { recursive: true })

  const jsonPath = path.join(CONFIG.outputDir, `audit-${CONFIG.date}.json`)
  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2))

  const mdPath = path.join(CONFIG.outputDir, `audit-${CONFIG.date}.md`)
  fs.writeFileSync(mdPath, generateMarkdown(report))

  console.log(`\n--- Audit complete ---`)
  console.log(`Findings: ${findings.length} (Critical: ${summary.critical}, High: ${summary.high}, Medium: ${summary.medium}, Low: ${summary.low})`)
  console.log(`JSON report: ${jsonPath}`)
  console.log(`MD summary:  ${mdPath}`)
}
```

- [ ] **Step 2: Commit**

```bash
git add scripts/audit.ts
git commit -m "chore: add report writer to audit script"
```

---

## Task 11: Wire main() and run first audit

**Files:**
- Modify: `scripts/audit.ts` (append main function)

- [ ] **Step 1: Append main() to audit.ts**

Append to `scripts/audit.ts`:

```typescript
// ---- Main ----

async function main() {
  const startTime = Date.now()
  console.log(`Miozuki audit — target: ${CONFIG.baseUrl}`)
  console.log(`Headless: ${CONFIG.headless}`)

  fs.mkdirSync(CONFIG.screenshotDir, { recursive: true })

  const browser = await chromium.launch({ headless: CONFIG.headless })
  const findings: Finding[] = []
  const counter: Counter = { n: 0 }

  try {
    console.log('\nDiscovering handles...')
    const handles = await discoverHandles(browser)
    console.log(`  Products: ${handles.products.length} | Collections: ${handles.collections.length} | Blog posts: ${handles.blogPosts.length}`)

    console.log('\nTier 1: Page crawl...')
    const pages = await runPageCrawl(browser, findings, counter, handles)
    console.log(`  Crawled ${pages.length} pages`)

    const firstProduct = handles.products[0]

    if (!firstProduct) {
      findings.push(makeFinding(counter, {
        severity: 'critical',
        tier: 2,
        page: 'product-discovery',
        type: 'flow-failure',
        message: 'No products found — Tier 2 flow tests skipped',
        url: CONFIG.baseUrl,
      }))
    } else {
      console.log(`\nTier 2a: Cart flow (${firstProduct})...`)
      await runCartFlow(browser, findings, counter, firstProduct)

      console.log(`Tier 2b: Checkout entry (${firstProduct})...`)
      await runCheckoutFlow(browser, findings, counter, firstProduct)
    }

    console.log('\nTier 2c: Contact form...')
    await runContactForm(browser, findings, counter)

    console.log('Tier 2d: Email popup...')
    await runEmailPopup(browser, findings, counter)

    console.log('\nTier 3: API checks...')
    const apiChecks = await runAPIChecks(findings, counter)

    await writeReport(findings, pages, apiChecks, startTime)
  } finally {
    await browser.close()
  }
}

main().catch(err => {
  console.error('Audit failed:', err)
  process.exit(1)
})
```

- [ ] **Step 2: Commit**

```bash
git add scripts/audit.ts
git commit -m "chore: add main() to audit script — script ready to run"
```

- [ ] **Step 3: Run the full audit (headed mode)**

Run from `miozuki-web/` — this opens a visible Chromium window:
```bash
npm run audit
```

Watch it run. Expected terminal output pattern:
```
Miozuki audit — target: https://miozuki.co.nz
Headless: false

Discovering handles...
  Products: N | Collections: N | Blog posts: N

Tier 1: Page crawl...
  [200] / — N finding(s)
  [200] /collections — N finding(s)
  ...

Tier 2a: Cart flow (some-product-handle)...
Tier 2b: Checkout entry (some-product-handle)...
Tier 2c: Contact form...
Tier 2d: Email popup...

Tier 3: API checks...

--- Audit complete ---
Findings: N (Critical: N, High: N, Medium: N, Low: N)
JSON report: .../docs/audit/audit-2026-04-15.json
MD summary:  .../docs/audit/audit-2026-04-15.md
```

- [ ] **Step 4: Verify output files exist**

```bash
ls docs/audit/
```

Expected: `audit-2026-04-15.json`, `audit-2026-04-15.md`, `screenshots/` directory with PNG files.

```bash
cat docs/audit/audit-2026-04-15.md | head -20
```

Expected: Summary header with finding counts.

- [ ] **Step 5: Add docs/audit to .gitignore (screenshots are large)**

Append to `.gitignore`:
```
docs/audit/screenshots/
```

Then commit the JSON and MD report:
```bash
git add docs/audit/audit-2026-04-15.json docs/audit/audit-2026-04-15.md .gitignore
git commit -m "audit: first audit run results 2026-04-15"
```

---

## Self-review notes

- `/api/subscribe` and `/api/contact` — both return 200, not 202 (corrected from spec)
- Cart has no `/cart` page and no quantity update UI — flow tests the drawer only
- `discoverHandles` may return 0 blog posts if `/blogs/news` has no posts yet — `runPageCrawl` handles empty arrays gracefully
- Shopify checkout order summary selector tries 5 CSS patterns — Shopify's DOM is not stable across checkout versions; if all fail the finding is `missing-element` not `critical`
- Email popup: fresh Playwright context has no localStorage, so popup fires automatically after 4s. No injection needed.
