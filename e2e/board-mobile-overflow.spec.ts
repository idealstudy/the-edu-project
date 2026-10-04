import { expect, test } from '@playwright/test';

test('TC-BOARD-OVERFLOW-001 390폭 /board는 가로 넘침이 없다', async ({
  page,
}) => {
  // Regression: ISSUE-BOARD-MOBILE-OVERFLOW — 긴 해시태그가 카드와 페이지를 1428px로 확장했다.
  // Found by /qa on 2026-10-04
  // Report: docs/build-log.md
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/board', { waitUntil: 'networkidle' });

  await expect
    .poll(() => page.getByTestId('column-card').count())
    .toBeGreaterThanOrEqual(3);
  await expect(page.getByText('데이터를 불러올 수 없습니다.')).toHaveCount(0);

  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));

  expect(dimensions, '문서 폭은 390px 뷰포트를 넘지 않아야 한다').toEqual({
    clientWidth: 390,
    scrollWidth: 390,
  });
});
