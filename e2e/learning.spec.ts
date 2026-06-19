import { PRIVATE } from '@/shared/constants';
import { expect, test } from '@playwright/test';

import { loginAsStudent } from './helpers/auth';

/* ─────────────────────────────────────────────────────
 * 학생 2.0 인증 표면 렌더 스모크.
 *  "약점트리/포인트/뱃지 안 떠요·불러오기 안돼요" 류 회귀 가드 —
 *  로그인 후 핵심 허브 페이지가 크래시/빈화면 없이 렌더되는지 확인.
 *  (게이미 값 증가 검증은 결정적 시드 fixture 후 별도)
 * ────────────────────────────────────────────────────*/
test.describe('학생 학습 허브 렌더', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsStudent(page);
  });

  const surfaces: Array<{ name: string; path: string }> = [
    { name: '내 학습', path: PRIVATE.LEARNING.INDEX },
    { name: '약점 트리', path: PRIVATE.TREE.INDEX },
    { name: '포인트', path: PRIVATE.POINTS.INDEX },
    { name: '친구', path: PRIVATE.FRIENDS.INDEX },
  ];

  for (const { name, path } of surfaces) {
    test(`${name}(${path}) 페이지가 정상 렌더된다`, async ({ page }) => {
      await page.goto(path);
      // 로그인으로 튕기지 않고 해당 인증 라우트에 머무름 = 인증+렌더 성공.
      await expect(page).toHaveURL(new RegExp(`${path}(\\?|$)`));
      // 전역 에러 바운더리("문제가 발생...")가 뜨지 않아야 한다.
      await expect(page.getByText('문제가 발생', { exact: false })).toHaveCount(
        0
      );
    });
  }
});
