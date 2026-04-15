import { chromium } from '@playwright/test'
const routes = [
  '/collections/moissanite-ear-rings',
  '/blogs/news/engagement-ring-moissanite-guide-how-to-choose-a-ring-that-shines-for-a-lifetime',
]
const b = await chromium.launch()
const ctx = await b.newContext({ ignoreHTTPSErrors: true })
await ctx.route('**/*', r => r.continue({ headers: { ...r.request().headers(), 'Cache-Control': 'no-cache' } }))
const p = await ctx.newPage()
await p.setViewportSize({ width: 1366, height: 900 })
for (const route of routes) {
  await p.goto('http://localhost:3000' + route + '?bust=' + Date.now(), { waitUntil: 'networkidle', timeout: 60000 })
  for (let i = 0; i < 6; i++) {
    await p.evaluate(() => window.scrollBy(0, window.innerHeight))
    await p.waitForTimeout(1200)
  }
  await p.waitForTimeout(2000)
  const info = await p.evaluate(() =>
    Array.from(document.querySelectorAll('img'))
      .filter(img => !img.complete || img.naturalWidth === 0)
      .map(img => img.src)
  )
  console.log('\n=== ' + route + ' ===')
  console.log('broken (' + info.length + '):')
  info.forEach(s => console.log('  ' + s.slice(0, 200)))
}
await b.close()
