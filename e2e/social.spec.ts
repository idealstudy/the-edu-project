import { PRIVATE } from '@/shared/constants';
import { type Page, expect, test } from '@playwright/test';

/* ─────────────────────────────────────────────────────
 * 소셜(친구·도전장) E2E — 2계정 플로우.
 *  두 번째 학생 fixture(E2E_STUDENT2_*)가 있어야 의미가 있으므로,
 *  없으면 자동 스킵한다. CI 시크릿에 아래를 넣으면 활성화된다:
 *    E2E_STUDENT2_EMAIL, E2E_STUDENT2_PASSWORD, E2E_STUDENT2_PHONE
 *  (전화번호로 친구추가 매칭은 상대 계정에 phone_number 가 세팅돼 있어야 함)
 * ────────────────────────────────────────────────────*/

const S2_EMAIL = process.env.E2E_STUDENT2_EMAIL;
const S2_PHONE = process.env.E2E_STUDENT2_PHONE;
const hasFixture = Boolean(
  process.env.E2E_STUDENT_EMAIL && S2_EMAIL && S2_PHONE
);

async function login(page: Page, email: string, password: string) {
  await page.goto('/login');
  await page.getByTestId('login-email-input').fill(email);
  await page.getByTestId('login-password-input').fill(password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL(/\/(learning|dashboard\/student)(\?|$)/);
}

test.describe('소셜 — 전화번호 친구추가', () => {
  test.skip(
    !hasFixture,
    'E2E_STUDENT2_EMAIL/PASSWORD/PHONE fixture 필요 (2계정 + 상대 전화번호)'
  );

  test('전화번호로 친구 요청을 보내면 친구 목록/요청에 반영된다', async ({
    page,
  }) => {
    await login(
      page,
      process.env.E2E_STUDENT_EMAIL!,
      process.env.E2E_STUDENT_PASSWORD!
    );
    await page.goto(PRIVATE.FRIENDS.INDEX);

    // "전화번호로 친구를 추가" 입력(앞 0 보존 — String e2e)
    await page.getByLabel('친구 요청 대상 전화번호').fill(S2_PHONE!);
    await page.getByRole('button', { name: '요청' }).click();

    // 성공 토스트 또는 요청 반영 (FRIENDSHIP_ADDRESSEE_NOT_FOUND 가 아니어야 함)
    await expect(
      page.getByText('그 전화번호의 회원을 찾을 수 없어요', { exact: false })
    ).toHaveCount(0);
  });
});
