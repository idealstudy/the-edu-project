/*
 * MVP-G QA 8차 B조 성능 측정.
 * 학생, 선생님, 관리자 세 화면의 초기 로딩을 dev 환경에서 직접 재고 숫자만 남긴다.
 *
 * 실행: node e2e/mvp-g-v8-B-perf.mjs
 * 계정 값은 .local-secrets 에서만 읽고 출력하지 않는다.
 *
 * 같은 계정으로 동시에 로그인하면 서버가 회원당 refresh token 을 1개만 들고 있어
 * 먼저 로그인한 세션이 무효가 된다. 그래서 이 스크립트는 화면을 하나씩 차례로 잰다.
 */
import { chromium } from '@playwright/test';
import dotenv from 'dotenv';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

// .local-secrets 는 git 미추적이고 이 스크립트는 경로만 안다. 값은 출력하지 않는다.
// worktree 로 작업할 때는 메인 체크아웃 쪽에만 있으므로 그쪽도 후보에 넣는다.
const secretDirs = [];
for (let depth = 0, dir = process.cwd(); depth < 5; depth += 1, dir = path.dirname(dir)) {
  secretDirs.push(path.join(dir, '.local-secrets'));
}
try {
  const commonDir = execFileSync('git', ['rev-parse', '--git-common-dir'], {
    cwd: process.cwd(),
    encoding: 'utf8',
  }).trim();
  if (commonDir) {
    secretDirs.push(
      path.join(path.dirname(path.resolve(process.cwd(), commonDir)), '.local-secrets')
    );
  }
} catch {
  // git 이 없으면 위 후보만 쓴다.
}
for (const candidate of secretDirs) {
  if (!fs.existsSync(candidate)) continue;
  for (const file of fs.readdirSync(candidate)) {
    if (file.endsWith('.env')) dotenv.config({ path: path.join(candidate, file) });
  }
}

const BASE = process.env.E2E_BASE_URL ?? 'https://dev.d-edu.site';
const SAMPLES = Number(process.env.PERF_SAMPLES ?? 10);

const need = (name) => {
  const v = process.env[name]?.trim();
  if (!v) throw new Error(`환경변수 없음: ${name}`);
  return v;
};

const p = (values, q) => {
  const s = [...values].sort((a, b) => a - b);
  return s[Math.max(0, Math.ceil(s.length * q) - 1)];
};

const stat = (values) => ({
  n: values.length,
  최소: Math.round(Math.min(...values)),
  중앙: Math.round(p(values, 0.5)),
  p95: Math.round(p(values, 0.95)),
  최대: Math.round(Math.max(...values)),
});

async function login(page, email, password) {
  await page.goto(`${BASE}/login`);
  await page.getByTestId('login-email-input').fill(email);
  await page.getByTestId('login-password-input').fill(password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 60_000,
  });
}

async function measure(browser, storageState, label, pathname, readySelector) {
  const ttfb = [];
  const dcl = [];
  const lcp = [];
  const ready = [];
  const apiCounts = [];
  const apiSlowest = [];

  for (let i = 0; i < SAMPLES; i += 1) {
    const context = await browser.newContext({ storageState });
    const page = await context.newPage();

    const apiCalls = [];
    page.on('requestfinished', async (req) => {
      if (!req.url().includes('/api/')) return;
      const timing = req.timing();
      apiCalls.push({
        url: req.url().split('?')[0],
        ms: timing.responseEnd - timing.requestStart,
      });
    });

    await page.addInitScript(() => {
      const w = window;
      w.__lcp = 0;
      new PerformanceObserver((list) => {
        const last = list.getEntries().at(-1);
        if (last) w.__lcp = last.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    });

    const started = Date.now();
    await page.goto(`${BASE}${pathname}?perf=${i}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
    await page.locator(readySelector).first().waitFor({ timeout: 60_000 });
    ready.push(Date.now() - started);
    await page.waitForTimeout(1000);

    const nav = await page.evaluate(() => {
      const w = window;
      const n = performance.getEntriesByType('navigation')[0];
      return {
        lcp: w.__lcp ?? 0,
        ttfb: n.responseStart,
        dcl: n.domContentLoadedEventEnd,
      };
    });
    ttfb.push(nav.ttfb);
    dcl.push(nav.dcl);
    if (nav.lcp > 0) lcp.push(nav.lcp);

    apiCounts.push(apiCalls.length);
    const slowest = apiCalls.sort((a, b) => b.ms - a.ms)[0];
    if (slowest) apiSlowest.push(slowest);

    await context.close();
  }

  const topApis = {};
  for (const c of apiSlowest) {
    topApis[c.url] = Math.max(topApis[c.url] ?? 0, Math.round(c.ms));
  }

  return {
    화면: label,
    경로: pathname,
    'TTFB(ms)': stat(ttfb),
    'DOMContentLoaded(ms)': stat(dcl),
    'LCP(ms)': lcp.length ? stat(lcp) : '측정 안 됨',
    '핵심요소 표시까지(ms)': stat(ready),
    '초기 API 호출 수': stat(apiCounts),
    '가장 느린 API(ms)': topApis,
  };
}

const run = async () => {
  const browser = await chromium.launch();
  const results = [];

  // 1) 관리자 화면
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await login(page, need('E2E_ADMIN_EMAIL'), need('E2E_ADMIN_PASSWORD'));
    const state = await page.context().storageState();
    results.push(
      await measure(browser, state, '관리자 회원 목록', '/admin/members', 'table, [role="table"], main')
    );
    results.push(
      await measure(browser, state, '관리자 상담 목록', '/admin/consultations', 'table, [role="table"], main')
    );
    await ctx.close();
  }

  // 2) 선생님 대시보드
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await login(page, need('E2E_TEACHER_EMAIL'), need('E2E_TEACHER_PASSWORD'));
    const state = await page.context().storageState();
    results.push(
      await measure(browser, state, '선생님 대시보드', '/dashboard/teacher', 'main')
    );
    await ctx.close();
  }

  // 3) 학생 대시보드
  {
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await login(page, need('E2E_STUDENT_EMAIL'), need('E2E_STUDENT_PASSWORD'));
    const state = await page.context().storageState();
    results.push(
      await measure(browser, state, '학생 대시보드', '/dashboard/student', 'main')
    );
    await ctx.close();
  }

  await browser.close();
  console.log('PERF_RESULT ' + JSON.stringify({ base: BASE, samples: SAMPLES, results }, null, 2));
};

run().catch((error) => {
  console.error('측정 실패:', error.message);
  process.exit(1);
});
