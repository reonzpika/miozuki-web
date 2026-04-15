import { chromium } from '@playwright/test'
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
