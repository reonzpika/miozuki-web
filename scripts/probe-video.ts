/**
 * Video playback probe for the Miozuki PDP.
 *
 * Reproduces and diagnoses the "video does not play" bug on a product page.
 * Inspects both video surfaces (the gallery main viewer and the "See it in
 * motion" modal): element state (paused/readyState/networkState/error/currentSrc),
 * the child <source> list, whether play() is rejected by autoplay policy, and the
 * HTTP status + content-type of every Shopify video asset request.
 *
 * Run: npx tsx scripts/probe-video.ts            (defaults to localhost:3000)
 *      AUDIT_URL=https://miozuki-web.vercel.app npx tsx scripts/probe-video.ts
 *      VIDEO_HANDLE=some-product npx tsx scripts/probe-video.ts   (skip discovery)
 *      --headless                                  (run headless)
 */
import { chromium } from '@playwright/test'
import type { Browser, Page } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const CONFIG = {
  baseUrl: process.env.AUDIT_URL ?? 'http://localhost:3000',
  fixedHandle: process.env.VIDEO_HANDLE ?? '',
  headless: process.argv.includes('--headless'),
  outDir: path.resolve(process.cwd(), 'docs/audit/video'),
  pageTimeout: 20_000,
}

type VideoState = {
  found: boolean
  paused?: boolean
  readyState?: number
  networkState?: number
  errorCode?: number | null
  currentSrc?: string
  videoWidth?: number
  videoHeight?: number
  sources?: { src: string; type: string }[]
  playRejected?: boolean
  playError?: string
}

type VideoRequest = { url: string; status: number; contentType: string }

type Surface = 'gallery' | 'modal'

function isVideoAsset(url: string): boolean {
  return /\.mp4|\.m3u8|\.webm|\/video\//i.test(url)
}

/** Read the state of a <video> matched by the given selector, then try to play it. */
async function inspectVideo(page: Page, selector: string): Promise<VideoState> {
  const state = await page.evaluate((sel) => {
    const v = document.querySelector(sel) as HTMLVideoElement | null
    if (!v) return { found: false }
    return {
      found: true,
      paused: v.paused,
      readyState: v.readyState,
      networkState: v.networkState,
      errorCode: v.error ? v.error.code : null,
      currentSrc: v.currentSrc,
      videoWidth: v.videoWidth,
      videoHeight: v.videoHeight,
      sources: Array.from(v.querySelectorAll('source')).map((s) => ({
        src: (s as HTMLSourceElement).src,
        type: (s as HTMLSourceElement).type,
      })),
    } as VideoState
  }, selector)

  if (!state.found) return state

  // Give the element a moment to buffer, then attempt explicit playback.
  // Race play() against a timeout: a source that returns HTML/404 leaves the
  // play() promise pending forever, so never await it unbounded.
  await page.waitForTimeout(1500)
  const play = await page.evaluate(async (sel) => {
    const v = document.querySelector(sel) as HTMLVideoElement | null
    if (!v) return { rejected: true, error: 'element vanished' }
    const timeout = new Promise<{ rejected: boolean; error: string }>((resolve) =>
      setTimeout(() => resolve({ rejected: true, error: 'play() did not settle in 6s (source likely not decodable)' }), 6000),
    )
    const attempt = v
      .play()
      .then(() => ({ rejected: false, error: '' }))
      .catch((e: unknown) => ({ rejected: true, error: (e as Error).message }))
    return Promise.race([attempt, timeout])
  }, selector)

  await page.waitForTimeout(1500)
  const after = await page.evaluate((sel) => {
    const v = document.querySelector(sel) as HTMLVideoElement | null
    return v
      ? { paused: v.paused, readyState: v.readyState, errorCode: v.error ? v.error.code : null }
      : null
  }, selector)

  return {
    ...state,
    paused: after?.paused ?? state.paused,
    readyState: after?.readyState ?? state.readyState,
    errorCode: after?.errorCode ?? state.errorCode,
    playRejected: play.rejected,
    playError: play.error,
  }
}

async function findVideoHandle(page: Page): Promise<string | null> {
  if (CONFIG.fixedHandle) return CONFIG.fixedHandle

  await page.goto(`${CONFIG.baseUrl}/collections`, {
    waitUntil: 'domcontentloaded',
    timeout: CONFIG.pageTimeout,
  })
  const handles: string[] = await page.$$eval('a[href*="/products/"]', (links) =>
    [
      ...new Set(
        links
          .map((l) => (l as HTMLAnchorElement).href.match(/\/products\/([^/?#]+)/)?.[1])
          .filter((h): h is string => !!h),
      ),
    ],
  )

  // Walk product pages until one exposes a video (the "See it in motion" button
  // only renders when the product has a video in its media).
  for (const handle of handles) {
    await page.goto(`${CONFIG.baseUrl}/products/${handle}`, {
      waitUntil: 'domcontentloaded',
      timeout: CONFIG.pageTimeout,
    })
    const hasVideoButton = await page
      .getByRole('button', { name: 'See it in motion' })
      .isVisible({ timeout: 2000 })
      .catch(() => false)
    const hasVideoThumb = await page
      .locator('button[aria-label*="video"]')
      .first()
      .isVisible({ timeout: 1000 })
      .catch(() => false)
    if (hasVideoButton || hasVideoThumb) {
      console.log(`  Found video product: ${handle}`)
      return handle
    }
  }
  return null
}

async function probe(browser: Browser) {
  const page = await browser.newPage()

  // Third-party beacons (Meta pixel, GA) never let the network go idle, which
  // hangs waitUntil:'networkidle'. Block them so navigation settles, and use
  // 'domcontentloaded' below regardless.
  await page.route(/connect\.facebook\.net|facebook\.com\/tr|google-analytics|googletagmanager|judge\.me/, (r) =>
    r.abort().catch(() => {}),
  )

  const consoleErrors: string[] = []
  const pageErrors: string[] = []
  const videoRequests: VideoRequest[] = []

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', (err) => pageErrors.push(err.message))
  page.on('response', (res) => {
    const url = res.url()
    if (isVideoAsset(url)) {
      videoRequests.push({
        url,
        status: res.status(),
        contentType: res.headers()['content-type'] ?? '',
      })
    }
  })

  console.log(`Target: ${CONFIG.baseUrl}`)
  console.log('Discovering a product with a video...')
  const handle = await findVideoHandle(page)
  if (!handle) {
    console.error('FAIL: no product with a video found. Set VIDEO_HANDLE to force one.')
    await page.close()
    return { handle: null }
  }

  const pdpUrl = `${CONFIG.baseUrl}/products/${handle}`
  console.log(`Navigating to ${pdpUrl} ...`)
  await page.goto(pdpUrl, { waitUntil: 'domcontentloaded', timeout: CONFIG.pageTimeout })
  console.log('  loaded (domcontentloaded)')
  await page.waitForTimeout(1500) // let the client gallery hydrate

  const result: Record<Surface, VideoState> = {
    gallery: { found: false },
    modal: { found: false },
  }

  // --- Gallery surface: activate the video thumbnail, inspect the main viewer ---
  console.log('Gallery: locating video thumbnail...')
  const videoThumb = page.locator('button[aria-label*="video"]').first()
  if (await videoThumb.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('  thumbnail found, clicking')
    await videoThumb.click().catch(() => {})
    await page.waitForTimeout(800)
  } else {
    console.log('  no video thumbnail visible (video may be media[0] already)')
  }
  result.gallery = await inspectVideo(page, '#product-gallery video')
  console.log(`  gallery inspected: ${verdict(result.gallery)}`)
  await page
    .screenshot({ path: path.join(CONFIG.outDir, 'gallery.png'), fullPage: false })
    .catch(() => {})

  // --- Modal surface: open "See it in motion", inspect the modal video ---
  const motionBtn = page.getByRole('button', { name: 'See it in motion' })
  if (await motionBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await motionBtn.click()
    await page.waitForTimeout(800)
    result.modal = await inspectVideo(page, '.fixed.inset-0 video')
    await page
      .screenshot({ path: path.join(CONFIG.outDir, 'modal.png'), fullPage: false })
      .catch(() => {})
  }

  await page.close()
  return { handle, pdpUrl, result, consoleErrors, pageErrors, videoRequests }
}

function verdict(s: VideoState): string {
  if (!s.found) return 'NOT RENDERED (video element absent)'
  if (s.errorCode) return `MediaError code ${s.errorCode} (broken/unplayable source)`
  if (s.networkState === 3) return 'NO_SOURCE (no playable source matched)'
  if (!s.currentSrc) return 'no currentSrc resolved'
  if (s.paused && s.playRejected) return `AUTOPLAY BLOCKED (play() rejected: ${s.playError})`
  if (!s.paused && (s.readyState ?? 0) >= 3) return 'PLAYING ✓'
  if (s.paused) return 'paused (autoplay not started)'
  return `playing? readyState=${s.readyState}`
}

async function main() {
  fs.mkdirSync(CONFIG.outDir, { recursive: true })
  const browser = await chromium.launch({ headless: CONFIG.headless })
  try {
    const out = await probe(browser)
    if (!out.handle) {
      process.exitCode = 1
      return
    }
    const { result, consoleErrors, pageErrors, videoRequests } = out

    console.log('\n=== VIDEO PROBE RESULT ===')
    console.log(`Product: ${out.pdpUrl}\n`)
    for (const surface of ['gallery', 'modal'] as Surface[]) {
      const s = result![surface]
      console.log(`[${surface}] ${verdict(s)}`)
      if (s.found) {
        console.log(
          `    paused=${s.paused} readyState=${s.readyState} networkState=${s.networkState} ` +
            `error=${s.errorCode} playRejected=${s.playRejected}`,
        )
        console.log(`    currentSrc=${s.currentSrc}`)
        console.log(`    sources=${JSON.stringify(s.sources)}`)
      }
    }

    console.log('\nVideo asset requests:')
    if (videoRequests!.length === 0) console.log('    (none captured)')
    for (const r of videoRequests!) {
      console.log(`    [${r.status}] ${r.contentType}  ${r.url}`)
    }

    console.log(`\nConsole errors: ${consoleErrors!.length}`)
    consoleErrors!.slice(0, 10).forEach((e) => console.log(`    ${e}`))
    console.log(`Page errors: ${pageErrors!.length}`)
    pageErrors!.slice(0, 10).forEach((e) => console.log(`    ${e}`))

    const jsonPath = path.join(CONFIG.outDir, 'probe-result.json')
    fs.writeFileSync(jsonPath, JSON.stringify(out, null, 2))
    console.log(`\nJSON: ${jsonPath}`)
    console.log(`Screenshots: ${CONFIG.outDir}`)

    // --- Regression gate (the guard) ---
    // Catches the whole class: a video source that 404s or returns non-video
    // content (the cutover-domain redirect bug), or a surface that never plays.
    const failures: string[] = []
    for (const r of videoRequests!) {
      if (r.status >= 400) failures.push(`video asset ${r.status}: ${r.url}`)
      if (r.contentType && !/^(video\/|application\/(vnd\.apple\.mpegurl|x-mpegurl))/i.test(r.contentType))
        failures.push(`video asset served as "${r.contentType}" (not video): ${r.url}`)
    }
    for (const surface of ['gallery', 'modal'] as Surface[]) {
      const s = result![surface]
      if (!s.found) continue
      if (s.errorCode) failures.push(`${surface}: MediaError code ${s.errorCode}`)
      if (s.networkState === 3) failures.push(`${surface}: NO_SOURCE`)
      if (s.currentSrc && !s.currentSrc.includes('cdn.shopify.com'))
        failures.push(`${surface}: currentSrc host is not cdn.shopify.com (${s.currentSrc})`)
    }
    if (failures.length) {
      console.error(`\nGUARD FAILED (${failures.length}):`)
      failures.forEach((f) => console.error(`    ✗ ${f}`))
      process.exitCode = 1
    } else {
      console.log('\nGUARD PASSED: video sources are video, on cdn.shopify.com, and playable.')
    }
  } finally {
    await browser.close()
  }
}

main().catch((err) => {
  console.error('Probe failed:', err)
  process.exit(1)
})
