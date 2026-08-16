import { type Page, expect, test } from '@playwright/test';

import { okBody } from './helpers/api-mock';
import { envValue, skipWithoutEnv } from './helpers/env-guard';

// 관리자 레이아웃은 서버에서 백엔드 /members/info 를 직접 호출한다.
// page.route 목으로는 권한을 만들 수 없으므로 실제 관리자 계정으로 로그인한다.
skipWithoutEnv(['E2E_ADMIN_EMAIL', 'E2E_ADMIN_PASSWORD']);

test.setTimeout(90_000);

const loginAsAdmin = async (page: Page) => {
  await page.goto('/login');
  await page.getByTestId('login-email-input').fill(envValue('E2E_ADMIN_EMAIL'));
  await page
    .getByTestId('login-password-input')
    .fill(envValue('E2E_ADMIN_PASSWORD'));
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 30_000,
  });
};

test('관리자 문의 검색 입력은 태블릿과 모바일 화면 안에 머문다', async ({
  page,
}) => {
  await loginAsAdmin(page);

  // 로그인과 세션 조회는 실서버를 계속 통과시킨다.
  // 폭 회귀에 필요한 문의 목록만 고정해 데이터 크기를 통제한다.
  await page.route('**/api/v1/admin/consultation-cases**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: okBody({
        content: [
          {
            caseId: 91,
            status: 'RECEIVED',
            title: '로그인 뒤에도 학습 기록이 보이지 않아 확인이 필요합니다',
            message: '어제 푼 수열 기록이 오늘 화면에서 보이지 않습니다.',
            senderName: '김서준',
            senderRole: 'STUDENT',
            senderContact: null,
            senderMemberId: 31,
            receivedAt: '2026-08-15T01:00:00Z',
            assigneeName: null,
            answer: null,
            answeredAt: null,
            delayed: true,
          },
        ],
        totalElements: 1,
        statusCounts: { RECEIVED: 1200, IN_PROGRESS: 820, ANSWERED: 399 },
        delayedCount: 1200,
      }),
    })
  );

  for (const width of [1024, 390]) {
    await page.setViewportSize({ width, height: width === 1024 ? 768 : 844 });
    await page.goto('/admin/consultations');
    const searchbox = page.getByRole('searchbox', {
      name: '이름, 내용으로 검색',
    });
    await expect(searchbox).toBeVisible();
    const bounds = await searchbox.evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return {
        right: Math.round(rect.right),
        minWidth: getComputedStyle(element).minWidth,
        parentWidth: Math.round(
          element.parentElement!.getBoundingClientRect().width
        ),
        width: Math.round(rect.width),
        rootWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      };
    });
    expect(
      bounds.right,
      `${width}px 검색 입력 오른쪽 경계`
    ).toBeLessThanOrEqual(bounds.rootWidth + 1);
    expect(bounds.scrollWidth, `${width}px 페이지 몸통 너비`).toBe(
      bounds.rootWidth
    );
    expect(bounds.minWidth, `${width}px 검색 입력 최소 너비`).toBe('0px');
    expect(
      bounds.width,
      `${width}px 검색 입력 wrapper 맞춤`
    ).toBeLessThanOrEqual(bounds.parentWidth + 1);
  }
});
