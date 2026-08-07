import { test } from '@playwright/test';

import { saveSessionState } from './helpers/mvp-e-devremote';

// 세션 정본을 한 번만 만든다. 이후 시나리오들은 이 상태를 재사용하므로
// 브라우저가 매 테스트마다 로그인 화면을 다시 거치지 않는다.
// 로그인·로그아웃 동작 자체의 회귀 검증은 mvp-e-auth-gate.spec.ts 가 계속 담당한다.
test('학생 세션 상태 저장', async ({ browser }) => {
  await saveSessionState(browser, '');
  await saveSessionState(browser, '2');
});
