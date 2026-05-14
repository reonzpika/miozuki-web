import { chromium } from '@playwright/test';

const url = process.argv[2];
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

const beforeScroll = await page.evaluate(() =>
  Array.from(document.querySelectorAll('img'))
    .filter(img => !img.complete || img.naturalWidth === 0).length
);

// Scroll to bottom in steps to trigger all lazy-loads
for (let i = 0; i < 20; i++) {
  await page.evaluate(() => window.scrollBy(0, window.innerHeight));
  await page.waitForTimeout(300);
}
await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
await page.waitForTimeout(2000);

const afterScroll = await page.evaluate(() => {
  const imgs = Array.from(document.querySelectorAll('img'));
  const broken = imgs.filter(img => !img.complete || img.naturalWidth === 0);
  return {
    total: imgs.length,
    broken: broken.length,
    brokenSrcs: broken.slice(0, 5).map(i => i.src),
  };
});

console.log(JSON.stringify({ url, beforeScroll, afterScroll }, null, 2));
await browser.close();
