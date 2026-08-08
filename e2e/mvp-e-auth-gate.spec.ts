import { test } from '@playwright/test';

import { login, logout } from './helpers/mvp-e-devremote';

test('MVP-E dev UI 로그인·로그아웃 인증 관문', async ({ page }) => {
  let loginFailure: unknown;
  let logoutFailure: unknown;

  try {
    await login(page);
  } catch (error) {
    loginFailure = error;
  }

  // 세션 확인 경로만 실패한 경우에도 UI 로그아웃과 refresh-token 제거를 검증한다.
  const hasAuthorization = (await page.context().cookies()).some(
    ({ name }) => name === 'Authorization'
  );
  if (hasAuthorization) {
    try {
      await logout(page);
    } catch (error) {
      logoutFailure = error;
    }
  }

  if (loginFailure && logoutFailure) {
    throw new AggregateError(
      [loginFailure, logoutFailure],
      'UI 로그인 관문과 로그아웃 정리가 모두 실패했다'
    );
  }
  if (loginFailure) throw loginFailure;
  if (logoutFailure) throw logoutFailure;
});
