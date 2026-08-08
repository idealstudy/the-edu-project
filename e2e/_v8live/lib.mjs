import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

export const BASE = process.env.E2E_BASE_URL ?? 'https://dev.d-edu.site';
export const SHOT_DIR = path.resolve('../docs/mvp-g/qa-screens-v8-live');

export async function newBrowser() {
  await mkdir(SHOT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  return { browser, context };
}

export async function login(page, email, password) {
  await page.goto(`${BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('login-email-input').fill(email);
  await page.getByTestId('login-password-input').fill(password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 30_000,
  });
  await page.waitForLoadState('networkidle', { timeout: 8_000 }).catch(() => {});
}

export async function shot(page, name) {
  const p = path.join(SHOT_DIR, `${name}.png`);
  await page.screenshot({ path: p, fullPage: false }).catch(() => {});
  return `docs/mvp-g/qa-screens-v8-live/${name}.png`;
}

/** 클릭 후 무슨 일이 일어났는지 관찰: URL 변화 / 네트워크 호출 / DOM 변화 / 토스트 */
export function observer(page) {
  const calls = [];
  const onReq = (req) => {
    const u = req.url();
    if (u.includes('/api/')) calls.push(`${req.method()} ${new URL(u).pathname}`);
  };
  page.on('request', onReq);
  return {
    calls,
    stop: () => page.off('request', onReq),
  };
}

export async function domSnapshot(page) {
  return page.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').trim());
}
