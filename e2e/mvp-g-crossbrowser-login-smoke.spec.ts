import { type Page, expect, test } from '@playwright/test';

import { skipWithoutEnv } from './helpers/env-guard';

// 3역할 로그인 크로스브라우저 스모크.
// 목적: v2.0.2 QA 교차브라우저 매트릭스에서 관찰된 Firefox 첫 로그인 실패 / WebKit 미실행을
// 로그인 경로 자체가 브라우저 호환인지로 좁혀 재현·판정한다.
// 로그인 코드는 이 브랜치 변경 범위 밖(원격 dev 배포본)이므로 원격 dev 대상으로 직접 검증 가능하다.
skipWithoutEnv([
  'E2E_STUDENT_EMAIL',
  'E2E_STUDENT_PASSWORD',
  'E2E_TEACHER_EMAIL',
  'E2E_TEACHER_PASSWORD',
  'E2E_ADMIN_EMAIL',
  'E2E_ADMIN_PASSWORD',
]);

const baseURL = process.env.E2E_BASE_URL ?? 'https://dev.d-edu.site';

const login = async (page: Page, email: string, password: string) => {
  await page.goto(`${baseURL}/login`);
  await page.getByTestId('login-email-input').fill(email);
  await page.getByTestId('login-password-input').fill(password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 30_000,
  });
};

const roles: Array<[string, string, string]> = [
  ['학생', 'E2E_STUDENT_EMAIL', 'E2E_STUDENT_PASSWORD'],
  ['교사', 'E2E_TEACHER_EMAIL', 'E2E_TEACHER_PASSWORD'],
  ['관리자', 'E2E_ADMIN_EMAIL', 'E2E_ADMIN_PASSWORD'],
];

test.describe('MVP-G 3역할 로그인 크로스브라우저 스모크', () => {
  for (const [label, emailKey, pwKey] of roles) {
    test(`${label} 로그인 후 세션이 유지된다`, async ({ page }) => {
      await login(page, process.env[emailKey]!, process.env[pwKey]!);
      // 로그인 성공 = /login 을 벗어나 인증 페이지에 도달, 세션 쿠키 존재
      expect(page.url()).not.toContain('/login');
      const cookies = await page.context().cookies();
      expect(cookies.some((c) => c.name === 'Authorization')).toBe(true);
    });
  }
});
