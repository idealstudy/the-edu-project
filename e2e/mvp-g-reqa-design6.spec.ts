// 재QA: v2.0.0 핫픽스(a8eea8ef1) 후 dev 배포본에서 6개 빈/오류 상태 재캡처.
// mock은 상태 주입(500/빈배열/검색결과0)에만 쓴다 — 판정은 실제 dev 렌더 화면.
import { type Page, expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

import { envValue, skipWithoutEnv } from './helpers/env-guard';

skipWithoutEnv([
  'E2E_ADMIN_EMAIL',
  'E2E_ADMIN_PASSWORD',
  'E2E_TEACHER_EMAIL',
  'E2E_TEACHER_PASSWORD',
]);

const OUT = path.resolve(
  process.cwd(),
  '../docs/mvp-g/qa-reqa-design6-2026-08-25/screenshots'
);

const VIEWPORTS = [
  { name: '1280x800', width: 1280, height: 800 },
  { name: '390x844', width: 390, height: 844 },
];

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByTestId('login-email-input').fill(email);
  await page.getByTestId('login-password-input').fill(password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 15_000,
  });
}

async function shot(page: Page, name: string, vp: string) {
  await mkdir(OUT, { recursive: true });
  await page.screenshot({
    path: path.join(OUT, `actual-${name}-${vp}.png`),
    fullPage: true,
  });
}

test.describe('mvp-g reqa design6', () => {
  for (const vp of VIEWPORTS) {
    test(`admin empty/error states @${vp.name}`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();
      await login(
        page,
        envValue('E2E_ADMIN_EMAIL'),
        envValue('E2E_ADMIN_PASSWORD')
      );

      // 1) a-members-empty: 검색으로 0건
      await page.goto('/admin/members');
      await page.waitForLoadState('networkidle');
      const memberSearch = page.getByPlaceholder('이름 또는 이메일로 검색');
      await memberSearch.fill('zzzzzz없는값');
      await memberSearch.press('Enter');
      await expect(page.getByText('불러오는 중입니다')).toHaveCount(0, {
        timeout: 20_000,
      });
      await page.waitForTimeout(400);
      await shot(page, 'a-members-empty', vp.name);

      // 2) a-members-error: GET /admin/members 500 주입
      await page.route('**/api/v1/admin/members**', (route) =>
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ message: 'internal error' }),
        })
      );
      await page.goto('/admin/members', { waitUntil: 'load' });
      await page.waitForLoadState('networkidle');
      await expect(
        page.getByRole('heading', { name: '회원 관리' })
      ).toBeVisible({ timeout: 20_000 });
      await expect(page.getByText('불러오는 중입니다')).toHaveCount(0, {
        timeout: 20_000,
      });
      await page.waitForTimeout(600);
      await shot(page, 'a-members-error', vp.name);
      await page.unroute('**/api/v1/admin/members**');

      // 3) a-bank-empty: content=[] totalElements=0 주입
      await page.route('**/api/v1/admin/question-bank**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 200,
            data: { content: [], totalElements: 0, page: 0, size: 20 },
          }),
        })
      );
      await page.goto('/admin/question-bank', { waitUntil: 'load' });
      await expect(
        page.getByRole('heading', { name: '문제은행' })
      ).toBeVisible({ timeout: 20_000 });
      await expect(page.getByText('문항을 불러오는 중입니다')).toHaveCount(
        0,
        { timeout: 20_000 }
      );
      await page.waitForTimeout(400);
      await shot(page, 'a-bank-empty', vp.name);
      await page.unroute('**/api/v1/admin/question-bank**');

      // 4) a-consult-empty: 필터·검색어 없는 "진짜 초기 빈 상태"(content=[] 응답 주입).
      // 검색어로 0건을 만들면 검색창이 남아 있는 채(가둠 방지)라 시안의 zero-data
      // 빈 상태(칩·검색창까지 숨긴 카드)와 다른 조건을 대조하게 된다. 그래서 응답
      // 자체를 빈 배열로 주입해 필터·검색 없는 기본 진입 상태를 만든다.
      await page.route('**/api/v1/admin/consultation-cases**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 200,
            data: {
              content: [],
              totalElements: 0,
              statusCounts: {},
              delayedCount: 0,
            },
          }),
        })
      );
      await page.goto('/admin/consultations');
      await page.waitForLoadState('networkidle');
      await expect(page.getByText('받은 문의가 없어요')).toBeVisible({
        timeout: 20_000,
      });
      await page.waitForTimeout(400);
      await shot(page, 'a-consult-empty', vp.name);
      await page.unroute('**/api/v1/admin/consultation-cases**');

      // 5) a-hall-empty: postings=[] 주입
      await page.route('**/api/v1/admin/public-exams**', (route) =>
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: 200,
            data: { postings: [], clones: [] },
          }),
        })
      );
      await page.goto('/admin/public-exams', { waitUntil: 'load' });
      await expect(
        page.getByText('지금 게시 중인 시험이 없어요')
      ).toBeVisible({ timeout: 20_000 });
      await page.waitForTimeout(400);
      await shot(page, 'a-hall-empty', vp.name);
      await page.unroute('**/api/v1/admin/public-exams**');

      await context.close();
    });

    test(`teacher exam save error @${vp.name}`, async ({ browser }) => {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();
      await login(
        page,
        envValue('E2E_TEACHER_EMAIL'),
        envValue('E2E_TEACHER_PASSWORD')
      );

      await page.route('**/api/v1/teacher/exams', (route) => {
        if (route.request().method() === 'POST') {
          return route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'internal error' }),
          });
        }
        return route.continue();
      });

      await page.goto('/dashboard/teacher/exams');
      await page.waitForLoadState('networkidle');
      const firstToggle = page
        .locator('[data-testid^="question-bank-item-"] button')
        .first();
      await expect(firstToggle).toBeVisible({ timeout: 20_000 });
      await firstToggle.click();
      const submitBtn = page.getByTestId('teacher-exam-assign-button');
      await submitBtn.click();
      await expect(page.getByTestId('exam-create-error')).toBeVisible({
        timeout: 10_000,
      });
      await page.waitForTimeout(300);
      await shot(page, 't-exam-error', vp.name);

      await context.close();
    });
  }
});
