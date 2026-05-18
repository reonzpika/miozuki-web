import { chromium } from '@playwright/test'

const targets = [
  'http://localhost:3000/collections/moissanite-ear-rings',
  'http://localhost:3000/collections/moissanite-rings',
  'http://localhost:3000/blogs/news/engagement-ring-moissanite-guide-how-to-choose-a-ring-that-shines-for-a-lifetime',
  'http://localhost:3000/blogs/news/moissanite-vs-diamond-for-nz-engagement-rings-9-crucial-differences-nobody-explains-clearly',
]

const browser = await chromium.launch({ headless: true })

for (const url of targets) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } })
  await page.goto(url, { waitUntil: 'networkidle', timeout: 60_000 })
  // Scroll exhaustively to trigger lazy load
  await page.evaluate(async () => {
    const h = document.body.scrollHeight
    for (let y = 0; y < h; y += 400) {
      window.scrollTo(0, y)
      await new Promise(r => setTimeout(r, 250))
    }
    window.scrollTo(0, 0)
    await new Promise(r => setTimeout(r, 500))
  })
  await page.waitForLoadState('networkidle', { timeout: 15_000 }).catch(() => {})

  const data = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'))
    return imgs.map(img => ({
      src: img.currentSrc || img.src || '',
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      loading: img.loading,
      rect: (() => { const r = img.getBoundingClientRect(); return { w: r.width, h: r.height, top: r.top } })(),
      visible: img.offsetParent !== null,
    }))
  })

  const broken = data.filter(d => !d.complete || d.naturalWidth === 0)
  console.log(`\n=== ${url}`)
  console.log(`Total imgs: ${data.length} | Reported broken: ${broken.length}`)
  for (const b of broken) {
    console.log(`  [${b.complete ? 'incomplete' : 'incomplete'}|nw=${b.naturalWidth}|loading=${b.loading}|w=${Math.round(b.rect.w)}|visible=${b.visible}] ${b.src.slice(0, 180)}`)
  }
  await page.close()
}
await browser.close()
