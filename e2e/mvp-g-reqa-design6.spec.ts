// 재QA: v2.0.0 핫픽스(a8eea8ef1) 후 dev 배포본에서 6개 빈/오류 상태 재캡처.
// mock은 상태 주입(500/빈배열/검색결과0)에만 쓴다 — 판정은 실제 dev 렌더 화면.
import { type Browser, type Page, expect, test } from '@playwright/test';
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

async function openAdminPage(
  browser: Browser,
  viewport: (typeof VIEWPORTS)[number],
  prepare?: (page: Page) => Promise<void>
) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
  });
  const page = await context.newPage();
  await prepare?.(page);
  await login(
    page,
    envValue('E2E_ADMIN_EMAIL'),
    envValue('E2E_ADMIN_PASSWORD')
  );
  return { context, page };
}

test.describe('mvp-g reqa design6', () => {
  // 이 파일은 같은 관리자·선생님 계정을 반복 사용한다. 백엔드가 회원별 refresh
  // token 하나만 유지하므로 fullyParallel 전역값을 상속하면 서로의 세션을 끊는다.
  test.describe.configure({ mode: 'serial' });

  for (const vp of VIEWPORTS) {
    test(`a-members-empty @${vp.name}`, async ({ browser }) => {
      test.setTimeout(60_000);
      const { context, page } = await openAdminPage(browser, vp);
      await expect(page).toHaveURL(/\/admin\/members(?:\?|$)/);
      const memberSearch = page.getByPlaceholder('이름 또는 이메일로 검색');
      await expect(memberSearch).toBeVisible();
      await memberSearch.fill('zzzzzz없는값');
      await memberSearch.press('Enter');
      await expect(page.getByTestId('admin-members-empty')).toBeVisible();
      await shot(page, 'a-members-empty', vp.name);
      await context.close();
    });

    test(`a-members-error @${vp.name}`, async ({ browser }) => {
      test.setTimeout(60_000);
      let routeHits = 0;
      const { context, page } = await openAdminPage(
        browser,
        vp,
        async (adminPage) => {
          await adminPage.route('**/api/v1/admin/members**', (route) => {
            routeHits += 1;
            return route.fulfill({
              status: 500,
              contentType: 'application/json',
              body: JSON.stringify({ message: 'internal error' }),
            });
          });
        }
      );
      await expect(page).toHaveURL(/\/admin\/members(?:\?|$)/);
      await expect(
        page.getByText('회원 목록을 불러오는 중입니다.')
      ).toHaveCount(0, { timeout: 45_000 });
      await expect(page.getByTestId('admin-members-error')).toBeVisible();
      expect(routeHits).toBeGreaterThan(0);
      await shot(page, 'a-members-error', vp.name);
      await context.close();
    });

    test(`a-bank-empty @${vp.name}`, async ({ browser }) => {
      const { context, page } = await openAdminPage(
        browser,
        vp,
        async (adminPage) => {
          await adminPage.route('**/api/v1/admin/question-bank**', (route) =>
            route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                status: 200,
                data: { content: [], totalElements: 0, page: 0, size: 20 },
              }),
            })
          );
        }
      );
      await page.goto('/admin/question-bank', { waitUntil: 'load' });
      await expect(page.getByTestId('admin-question-bank-empty')).toBeVisible();
      await shot(page, 'a-bank-empty', vp.name);
      await context.close();
    });

    test(`a-consult-empty @${vp.name}`, async ({ browser }) => {
      const { context, page } = await openAdminPage(browser, vp);
      // 필터·검색어 없는 "진짜 초기 빈 상태"(content=[] 응답 주입).
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
      await expect(page.getByText('받은 문의가 없어요')).toBeVisible({
        timeout: 20_000,
      });
      await shot(page, 'a-consult-empty', vp.name);
      await context.close();
    });

    test(`a-hall-empty @${vp.name}`, async ({ browser }) => {
      const { context, page } = await openAdminPage(browser, vp);
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
      await expect(page.getByText('지금 게시 중인 시험이 없어요')).toBeVisible({
        timeout: 20_000,
      });
      await shot(page, 'a-hall-empty', vp.name);
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
