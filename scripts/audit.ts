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

    // Fallback: scrape best-sellers collection for product handles if main scrape is sparse
    if (handles.products.length < 3) {
      await page.goto(`${CONFIG.baseUrl}/collections/best-sellers`, {
        waitUntil: 'networkidle',
        timeout: CONFIG.pageTimeout,
      })
      const fallbackProducts = await page.$$eval('a[href*="/products/"]', links =>
        [...new Set(
          links
            .map(l => (l as HTMLAnchorElement).href.match(/\/products\/([^/?#]+)/)?.[1])
            .filter((h): h is string => !!h)
        )]
      )
      handles.products = [...new Set([...handles.products, ...fallbackProducts])]
    }

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
          .filter((h): h is string => !!h && h !== 'tagged')
      )]
    )
  } finally {
    await page.close()
  }

  return handles
}

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
        message: 'Add to Cart button did not change state after click',
        url,
        screenshotPath: await takeScreenshot(page, 'flow-cart-no-state-change.png'),
      }))
    }

    await page.waitForTimeout(2000)

    const cartIcon = page.getByRole('button', { name: /Cart/i })
    await cartIcon.click()
    await page.waitForTimeout(500)

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

    await removeBtn.click()
    await page.waitForTimeout(1500)

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

    await page.getByRole('button', { name: /Cart/i }).click()
    await page.waitForTimeout(500)

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
        message: 'Contact form accepted empty submission — required validation not blocking',
        url,
        screenshotPath: await takeScreenshot(page, 'flow-contact-empty-accepted.png'),
      }))
      return
    }

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

    // Fresh browser context: localStorage empty, shouldShow() returns true, popup fires after 4s
    await page.waitForTimeout(5000)

    const popupHeading = page.getByRole('heading', { name: 'New drops, first.' })
    if (!(await popupHeading.isVisible({ timeout: 2000 }).catch(() => false))) {
      allFindings.push(makeFinding(counter, {
        severity: 'medium',
        tier: 2,
        page: '/',
        type: 'flow-failure',
        message: 'Email popup did not appear after 5s on fresh session',
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
      detail: ok ? 'Returned 200 ok:true' : `Unexpected status ${status}`,
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
      detail: ok ? 'Returned 200 ok:true' : `Unexpected status ${status}`,
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
