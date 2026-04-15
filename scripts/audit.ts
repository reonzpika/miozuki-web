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
