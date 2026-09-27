// phase1 web-mobile-v12 QA: overflow + touch target measurement
// usage: node scripts/qa-phase1-overflow.mjs
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.env.QA_BASE_URL || 'http://localhost:4100';
const OUT_DIR = path.resolve(
  process.cwd(),
  '../docs/qa/web-mobile-v12/phase1'
);
fs.mkdirSync(OUT_DIR, { recursive: true });

const widths = [390, 512, 768, 834, 1024];
const pages = [
  { id: 'PUB-HOME', path: '/' },
  { id: 'LOGIN', path: '/login' },
  { id: 'SIGNUP', path: '/register' },
  { id: 'PUB-ROOM-LIST', path: '/list/study-rooms' },
];

const results = [];

let browser = await chromium.launch();
for (const p of pages) {
  for (const w of widths) {
    if (!browser.isConnected()) {
      browser = await chromium.launch();
    }
    let page;
    try {
      page = await browser.newPage({ viewport: { width: w, height: 900 } });
    } catch (e) {
      browser = await chromium.launch();
      page = await browser.newPage({ viewport: { width: w, height: 900 } });
    }
    const consoleErrors = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    let status = null;
    try {
      const resp = await page.goto(BASE + p.path, {
        waitUntil: 'domcontentloaded',
        timeout: 60000,
      });
      status = resp ? resp.status() : null;
      await page.waitForTimeout(2000);
    } catch (e) {
      results.push({
        page: p.id,
        width: w,
        error: String(e),
      });
      try {
        await page.close();
      } catch {}
      continue;
    }

    const metrics = await page.evaluate(() => {
      const doc = document.documentElement;
      return {
        scrollWidth: doc.scrollWidth,
        clientWidth: doc.clientWidth,
        overflow: doc.scrollWidth - doc.clientWidth,
      };
    });

    // touch targets: header hamburger / notification / primary buttons
    const targets = await page.evaluate(() => {
      const sel = [
        '[aria-label*="메뉴"]',
        '[aria-label*="menu" i]',
        'button[aria-label*="알림"]',
        'header button',
        'nav button',
        '[data-testid*="hamburger" i]',
      ];
      const found = [];
      const seen = new Set();
      for (const s of sel) {
        document.querySelectorAll(s).forEach((el) => {
          if (seen.has(el)) return;
          seen.add(el);
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) return;
          found.push({
            selector: s,
            text: (el.textContent || '').trim().slice(0, 20),
            width: Math.round(r.width),
            height: Math.round(r.height),
          });
        });
      }
      return found;
    });

    const shotName = `${p.id}__${w}.png`;
    if (w === 390 || w === 834) {
      await page.screenshot({
        path: path.join(OUT_DIR, shotName),
        fullPage: false,
      });
    }

    results.push({
      page: p.id,
      path: p.path,
      width: w,
      status,
      ...metrics,
      consoleErrorCount: consoleErrors.length,
      consoleErrors: consoleErrors.slice(0, 5),
      touchTargets: targets,
    });

    try {
      await page.close();
    } catch {}
    fs.writeFileSync(
      path.join(OUT_DIR, 'results.json'),
      JSON.stringify(results, null, 2)
    );
  }
}
try {
  await browser.close();
} catch {}

console.log(JSON.stringify(results, null, 2));
