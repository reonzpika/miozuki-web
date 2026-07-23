/**
 * Generates on-brand Pinterest/Instagram pin images: a real product photo
 * with a text-overlay title banner, using Playwright to render an HTML/CSS
 * template and screenshot it. Built for workstream A of the 2026-07-23
 * organic-growth session, after evidence-based tool research concluded
 * Playwright (already a devDependency here) beats sharp/canvas/Jimp for this
 * specific job: full CSS typography (wrapping, gradients, custom fonts) with
 * zero new dependency, and the "heavy browser" downside that rules Playwright
 * out for live serverless image generation doesn't apply to an offline batch
 * script like this one.
 *
 * Brand identity pulled directly from app/globals.css and app/layout.tsx, not
 * guessed: ivory #f5f0e9, crimson #7b1e22, charcoal #1f1f1f, Playfair Display
 * for display text, DM Sans for body. Uses the real Google Fonts CDN (same
 * fonts the live site loads via next/font/google), and the real logo file at
 * public/miozuki-logo-full-light.svg.
 *
 * Usage:
 *   npx tsx scripts/generate-pin-images.mts <batch.json> <outDir>
 *
 * batch.json shape: [{ "id": "item-1", "title": "...", "imageUrl": "https://..." }, ...]
 * Output: one 1000x1500 JPEG per item (Pinterest's recommended 2:3 ratio), named <id>.jpg
 */

import { chromium } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

const PIN_WIDTH = 1000
const PIN_HEIGHT = 1500

interface PinSpec {
  id: string
  title: string
  imageUrl: string
}

function buildHtml(spec: PinSpec, logoDataUri: string): string {
  // Escape user-provided text so it can't break the template markup.
  const escape = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body { width: ${PIN_WIDTH}px; height: ${PIN_HEIGHT}px; overflow: hidden; }
  .pin {
    position: relative;
    width: ${PIN_WIDTH}px;
    height: ${PIN_HEIGHT}px;
    background: #f5f0e9;
    font-family: 'DM Sans', sans-serif;
  }
  .photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .scrim {
    position: absolute;
    left: 0; right: 0; bottom: 0;
    height: 46%;
    background: linear-gradient(to bottom, rgba(31,31,31,0) 0%, rgba(31,31,31,0.72) 55%, rgba(31,31,31,0.88) 100%);
  }
  .accent-bar {
    position: absolute;
    left: 0; right: 0; top: 0;
    height: 10px;
    background: #7b1e22;
  }
  .title {
    position: absolute;
    left: 56px; right: 56px; bottom: 132px;
    font-family: 'Playfair Display', serif;
    font-weight: 700;
    font-size: 58px;
    line-height: 1.18;
    color: #f5f0e9;
    text-shadow: 0 2px 18px rgba(0,0,0,0.35);
  }
  .brand-row {
    position: absolute;
    left: 56px; right: 56px; bottom: 56px;
    display: flex;
    align-items: center;
    gap: 16px;
  }
  .logo { height: 34px; }
  .brand-name {
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    font-size: 22px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #f5f0e9;
    opacity: 0.92;
  }
</style>
</head>
<body>
  <div class="pin">
    <img class="photo" src="${spec.imageUrl}" />
    <div class="scrim"></div>
    <div class="accent-bar"></div>
    <div class="title">${escape(spec.title)}</div>
    <div class="brand-row">
      <img class="logo" src="${logoDataUri}" />
    </div>
  </div>
</body>
</html>`
}

async function run() {
  const [, , batchPath, outDirArg] = process.argv
  if (!batchPath || !outDirArg) {
    console.error('Usage: tsx scripts/generate-pin-images.mts <batch.json> <outDir>')
    process.exit(1)
  }
  const specs: PinSpec[] = JSON.parse(fs.readFileSync(batchPath, 'utf8'))
  const outDir = path.resolve(outDirArg)
  fs.mkdirSync(outDir, { recursive: true })

  const logoSvg = fs.readFileSync(path.resolve('public/miozuki-logo-full-light.svg'), 'utf8')
  const logoDataUri = `data:image/svg+xml;base64,${Buffer.from(logoSvg).toString('base64')}`

  const browser = await chromium.launch()
  const page = await browser.newPage({ viewport: { width: PIN_WIDTH, height: PIN_HEIGHT } })

  for (const spec of specs) {
    const html = buildHtml(spec, logoDataUri)
    await page.setContent(html, { waitUntil: 'networkidle' })
    // Give web fonts a moment to finish swapping in after networkidle.
    await page.evaluate(() => document.fonts.ready)
    const outPath = path.join(outDir, `${spec.id}.jpg`)
    await page.screenshot({ path: outPath, type: 'jpeg', quality: 92 })
    console.log(`Wrote ${outPath}`)
  }

  await browser.close()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
