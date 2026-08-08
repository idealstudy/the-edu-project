import { expect, test } from '@playwright/test';

import { skipWithoutEnv } from './helpers/env-guard';

// 관리자 계정이 없으면 이 스펙만 skip 된다(나머지 스위트는 정상 실행).
skipWithoutEnv(['E2E_ADMIN_EMAIL', 'E2E_ADMIN_PASSWORD']);

const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3001';
const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;

const requireValue = (value: string | undefined, name: string) => {
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

const percentile95 = (values: number[]) => {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil(sorted.length * 0.95) - 1];
};

test('학생 대시보드 production build 냉시작 LCP p95가 2초 미만이다', async ({
  browser,
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto(`${baseURL}/login`);
  await page
    .getByTestId('login-email-input')
    .fill(requireValue(adminEmail, 'E2E_ADMIN_EMAIL'));
  await page
    .getByTestId('login-password-input')
    .fill(requireValue(adminPassword, 'E2E_ADMIN_PASSWORD'));
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));

  const members = await page.request.get(
    `${baseURL}/api/v1/admin/members?role=STUDENT&keyword=${encodeURIComponent('qa-tc35-pdf-unit@d-edu.site')}&includeQaAccount=true&page=0&size=20`
  );
  expect(members.status()).toBe(200);
  const member = (await members.json()).data.content.find(
    (item: { email: string }) => item.email === 'qa-tc35-pdf-unit@d-edu.site'
  );
  expect(member).toBeTruthy();
  const impersonation = await page.request.post(
    `${baseURL}/api/v1/admin/auth/impersonate/${member.memberId}`
  );
  expect(impersonation.status()).toBe(200);
  const storageState = await page.context().storageState();

  const samples: Array<{
    lcpMs: number;
    responseEndMs: number;
    domContentLoadedMs: number;
  }> = [];
  for (let index = 0; index < 20; index += 1) {
    const context = await browser.newContext({ storageState });
    const samplePage = await context.newPage();
    await samplePage.addInitScript(() => {
      const target = window as typeof window & { __qaLcp?: number };
      target.__qaLcp = 0;
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const last = entries.at(-1);
        if (last) target.__qaLcp = last.startTime;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    });
    await samplePage.goto(`${baseURL}/dashboard/student?qaPerf=${index}`, {
      waitUntil: 'domcontentloaded',
    });
    await expect(
      samplePage.getByRole('heading', { name: '단권화 노트' })
    ).toBeVisible();
    await samplePage.waitForTimeout(750);
    samples.push(
      await samplePage.evaluate(() => {
        const target = window as typeof window & { __qaLcp?: number };
        const navigation = performance.getEntriesByType(
          'navigation'
        )[0] as PerformanceNavigationTiming;
        return {
          lcpMs: target.__qaLcp ?? 0,
          responseEndMs: navigation.responseEnd,
          domContentLoadedMs: navigation.domContentLoadedEventEnd,
        };
      })
    );
    await context.close();
  }

  const result = {
    environment: 'same-HEAD local production build, isolated MySQL/Redis',
    sampleCount: samples.length,
    lcpP95Ms: percentile95(samples.map((sample) => sample.lcpMs)),
    responseEndP95Ms: percentile95(
      samples.map((sample) => sample.responseEndMs)
    ),
    domContentLoadedP95Ms: percentile95(
      samples.map((sample) => sample.domContentLoadedMs)
    ),
    samples,
  };
  console.log(`QA8_PERFORMANCE ${JSON.stringify(result)}`);
  expect(result.lcpP95Ms).toBeGreaterThan(0);
  expect(result.lcpP95Ms).toBeLessThan(2_000);
});

test('캐시된 약점 나무 노드 클릭에서 세부 트리 표시까지 p95가 300ms 미만이다', async ({
  page,
}) => {
  test.setTimeout(120_000);
  await page.goto(`${baseURL}/login`);
  await page
    .getByTestId('login-email-input')
    .fill(requireValue(adminEmail, 'E2E_ADMIN_EMAIL'));
  await page
    .getByTestId('login-password-input')
    .fill(requireValue(adminPassword, 'E2E_ADMIN_PASSWORD'));
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));

  const members = await page.request.get(
    `${baseURL}/api/v1/admin/members?role=STUDENT&keyword=${encodeURIComponent('qa-student-teacher2@d-edu.site')}&includeQaAccount=true&page=0&size=20`
  );
  expect(members.status()).toBe(200);
  const member = (await members.json()).data.content.find(
    (item: { email: string }) => item.email === 'qa-student-teacher2@d-edu.site'
  );
  expect(member).toBeTruthy();
  const impersonation = await page.request.post(
    `${baseURL}/api/v1/admin/auth/impersonate/${member.memberId}`
  );
  expect(impersonation.status()).toBe(200);

  await page.goto(`${baseURL}/tree`);
  const node = page.getByRole('button', {
    name: /대수, .*누르면 세부 트리/,
  });
  const close = page.getByRole('button', { name: '세부 트리 닫기' });
  await expect(node).toBeVisible();

  await node.click();
  await expect(close).toBeVisible();
  await close.click();
  await expect(close).toBeHidden();

  const samples: number[] = [];
  for (let index = 0; index < 20; index += 1) {
    const started = await page.evaluate(() => performance.now());
    await node.click();
    await expect(close).toBeVisible();
    const ended = await page.evaluate(() => performance.now());
    samples.push(ended - started);
    await close.click();
    await expect(close).toBeHidden();
  }

  const result = {
    environment: 'same-HEAD local production build, cached tree payload',
    sampleCount: samples.length,
    treeClickP95Ms: percentile95(samples),
    samples,
  };
  console.log(`QA8_TREE_PERFORMANCE ${JSON.stringify(result)}`);
  expect(result.treeClickP95Ms).toBeLessThan(300);
});
