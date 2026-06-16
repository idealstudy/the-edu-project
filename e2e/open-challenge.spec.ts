import { PRIVATE, PUBLIC } from '@/shared/constants';
import { expect, test } from '@playwright/test';

import { loginAsStudent } from './helpers/auth';

/* ─────────────────────────────────────────────────────
 * 오픈챌린지 — 2.0 핵심 플로우 E2E
 *  - 로그인 redirect 보존(도전장 링크 → 로그인 왕복 후 복귀) 회귀 가드
 *  - 풀이 제출 → 결과 화면 → 학습 허브 렌더 스모크
 * ────────────────────────────────────────────────────*/

// ─── 로그인 redirect 보존 ───
// 도전장(/invite/challenge/:token) 같은 딥링크에서 비로그인으로 진입하면
// ?redirect=<경로> 를 달고 로그인으로 보내는데, 로그인 후 그 경로로 돌아와야 한다.
// (이전 버그: useLogin 이 redirect 를 무시하고 역할별 기본 경로로만 이동)
test.describe('로그인 redirect 보존', () => {
  test('redirect 파라미터가 있으면 로그인 후 해당 경로로 복귀한다', async ({
    page,
  }) => {
    const target = PRIVATE.POINTS.INDEX; // 학생이 접근 가능한 내부 경로
    await page.goto(`/login?redirect=${encodeURIComponent(target)}`);

    await page
      .getByTestId('login-email-input')
      .fill(process.env.E2E_STUDENT_EMAIL!);
    await page
      .getByTestId('login-password-input')
      .fill(process.env.E2E_STUDENT_PASSWORD!);
    await page.getByTestId('login-submit-button').click();

    await page.waitForURL(`**${target}`);
    await expect(page).toHaveURL(new RegExp(`${target}$`));
  });

  test('redirect 가 외부 URL이면 무시하고 역할 기본 경로로 이동한다(오픈 리다이렉트 가드)', async ({
    page,
  }) => {
    await page.goto(
      `/login?redirect=${encodeURIComponent('https://evil.example.com')}`
    );

    await page
      .getByTestId('login-email-input')
      .fill(process.env.E2E_STUDENT_EMAIL!);
    await page
      .getByTestId('login-password-input')
      .fill(process.env.E2E_STUDENT_PASSWORD!);
    await page.getByTestId('login-submit-button').click();

    // 외부 도메인으로 나가지 않고 앱 내부(localhost)에 머무른다.
    await page.waitForURL('http://localhost:3000/**');
    expect(page.url()).toContain('localhost:3000');
    expect(page.url()).not.toContain('evil.example.com');
  });
});

// ─── 풀이 제출 → 결과 → 학습 허브 ───
// 시드된 오픈챌린지가 있어야 의미가 있으므로, 카드가 없으면 스킵한다.
test.describe('오픈챌린지 풀이 → 결과', () => {
  test.setTimeout(60_000);

  test('문제를 선택·제출하면 결과 화면으로 이동하고 학습 허브가 렌더된다', async ({
    page,
  }) => {
    await loginAsStudent(page);

    // '/' 가 오픈챌린지 리스트로 승격됨.
    await page.goto(PUBLIC.OPEN_CHALLENGE.LIST);

    const firstCard = page.getByTestId('open-challenge-card').first();
    const hasChallenge = (await firstCard.count()) > 0;
    test.skip(!hasChallenge, '시드된 오픈챌린지가 없어 스킵합니다.');

    await firstCard.click();
    await page.waitForURL(/\/open-challenge\/[^/]+$/);

    // 첫 번째 선택지 선택 후 제출 (정답 여부와 무관하게 결과 화면 이동).
    await page.getByTestId('choice-option-0').click();
    await page.getByTestId('challenge-submit-button').click();

    await page.waitForURL(/\/open-challenge\/[^/]+\/result$/);
    await expect(page).toHaveURL(/\/result$/);

    // 게이미피케이션 지표 페이지가 풀이 후에도 정상 렌더되는지 스모크.
    await page.goto(PRIVATE.LEARNING.INDEX);
    await expect(page).toHaveURL(/\/learning$/);
    await page.goto(PRIVATE.POINTS.INDEX);
    await expect(page).toHaveURL(/\/points$/);
  });
});
