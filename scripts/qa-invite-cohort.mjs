import { chromium } from 'playwright';
const browser = await chromium.launch();
const results = [];
for (const w of [390, 834, 1024]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.goto('http://localhost:4200/invite/cohort/11111111-1111-1111-1111-111111111111', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(1000);
  const m = await page.evaluate(() => ({
    sw: document.documentElement.scrollWidth,
    cw: document.documentElement.clientWidth,
  }));
  const targets = await page.evaluate(() => {
    const els = Array.from(document.querySelectorAll('a, button'));
    return els.map(el => {
      const r = el.getBoundingClientRect();
      return { text: (el.textContent||'').trim().slice(0,30), w: Math.round(r.width), h: Math.round(r.height) };
    }).filter(t => t.w > 0);
  });
  results.push({ width: w, overflow: m.sw - m.cw, targets });
  await page.close();
}
await browser.close();
console.log(JSON.stringify(results, null, 2));
