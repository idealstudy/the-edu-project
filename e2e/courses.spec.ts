import { PUBLIC } from '@/shared/constants';
import { expect, test } from '@playwright/test';

/* ─────────────────────────────────────────────────────
 * 코스 목록 — 공개 페이지(로그인 불필요).
 *  V44 데모 코스 시드(published)로 카드가 노출되는지 회귀 가드.
 *  ("코스가 비어있다" 데이터 갭 재발 방지)
 * ────────────────────────────────────────────────────*/
test.describe('코스 목록', () => {
  test('공개 코스 목록에 데모 코스가 노출된다', async ({ page }) => {
    await page.goto(PUBLIC.COURSE.LIST); // '/courses'

    // 시드된 코스가 있으면 최소 1개 카드가 보이고, 빈 상태 문구는 없어야 한다.
    await expect(page.getByTestId('course-card').first()).toBeVisible();
    await expect(page.getByText('아직 열린 코스가 없어요')).toHaveCount(0);
  });
});
