import { type Page, expect, test } from '@playwright/test';

import { okBody } from './helpers/api-mock';
import { mockMemberInfo, setAuthCookie } from './helpers/auth-mock';

const STUDENT = {
  id: 31,
  email: 'geometry-student@test.com',
  name: '김서준',
  role: 'ROLE_STUDENT',
};

const TREE_NODES = [
  ['ALGEBRA', '등차수열', 78],
  ['ALGEBRA', '등비수열', 48],
  ['CALCULUS_1', '급수', 18],
  ['CALCULUS_1', '미분법', 84],
  ['PROBABILITY_STATISTICS', '경우의 수', 74],
  ['PROBABILITY_STATISTICS', '조건부확률', 35],
].map(([subject, displayName, masteryScore], index) => ({
  nodeId: index + 1,
  parentId: null,
  subject,
  unit: `unit-${index + 1}`,
  displayName,
  depth: 1,
  masteryScore,
  diagnosedScore: null,
  attemptCount: 8,
  correctCount: 5,
  unitNotePageCount: index % 3,
}));

const GROWTH = {
  level: 3,
  daysGrown: 12,
  xp: 80,
  xpToNextLevel: 100,
  totalExperience: 280,
  streakDays: 4,
  stage: 'HEALTHY',
  wiltingDays: 0,
  lastActivityDate: '2026-09-03',
  lastReflectionDate: '2026-09-02',
  overallMasteryPercent: 48,
  weaknessTreeCells: [],
};

async function mockStudentResultsApi(page: Page) {
  await setAuthCookie(page);
  await page.route('**/api/v1/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: okBody({}),
    })
  );
  await mockMemberInfo(page, STUDENT);

  const replies: Array<[string, unknown]> = [
    ['**/api/v1/common/tree', { nodes: TREE_NODES }],
    ['**/api/v1/student/growth', GROWTH],
    ['**/api/v1/common/points', { balance: 320, transactions: [] }],
    ['**/api/v1/student/wrong-answers**', { totalCount: 0, items: [] }],
    ['**/api/v1/student/exams**', []],
    ['**/api/v1/student/dashboard/study-rooms', []],
  ];

  for (const [url, data] of replies) {
    await page.route(url, (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: okBody(data),
      })
    );
  }
}

const viewports = [
  { name: '1024x768', width: 1024, height: 768 },
  { name: '390x844', width: 390, height: 844 },
] as const;

test.describe('MVP-G 학생 성과 chrome geometry', () => {
  for (const viewport of viewports) {
    test(`TC-SHELL-002 ${viewport.name}에서 chrome 순서와 비겹침을 지킨다`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize(viewport);
      await mockStudentResultsApi(page);
      await page.goto('/dashboard/student/results');

      const header = page.locator('[data-dashboard-app-header]');
      const learningMap = page.getByTestId('learning-map');
      await expect(header).toBeVisible();
      await expect(learningMap).toBeVisible();

      const [headerBox, mapBox] = await Promise.all([
        header.boundingBox(),
        learningMap.boundingBox(),
      ]);
      expect(headerBox).not.toBeNull();
      expect(mapBox).not.toBeNull();
      expect(headerBox!.y + headerBox!.height).toBeLessThanOrEqual(mapBox!.y);
      expect(
        await page.evaluate(() =>
          Math.max(
            document.documentElement.scrollWidth,
            document.body.scrollWidth
          )
        )
      ).toBeLessThanOrEqual(viewport.width);

      const screenshotPath = testInfo.outputPath(
        `student-results-initial-${viewport.name}.png`
      );
      await page.screenshot({ path: screenshotPath, fullPage: false });
      await testInfo.attach(`student-results-initial-${viewport.name}`, {
        path: screenshotPath,
        contentType: 'image/png',
      });

      const sidebar = page.locator('[data-dashboard-sidebar] aside');
      const bottomNavigation = page.getByTestId('student-bottom-navigation');

      if (viewport.width === 1024) {
        await expect(sidebar).toBeVisible();
        await expect(sidebar).toHaveAttribute(
          'data-sidebar-mode',
          'full-from-tablet'
        );
        const sidebarBox = await sidebar.boundingBox();
        expect(sidebarBox).not.toBeNull();
        expect(sidebarBox!.width).toBe(260);
        expect(sidebarBox!.x + sidebarBox!.width).toBeLessThanOrEqual(
          mapBox!.x
        );
        await expect(bottomNavigation).toBeHidden();
      } else {
        await expect(sidebar).toBeHidden();
        await expect(bottomNavigation).toBeVisible();
        await expect(
          bottomNavigation
            .getByRole('link')
            .evaluateAll((links) =>
              links.map((link) => link.getAttribute('aria-label'))
            )
        ).resolves.toEqual([
          '내 학습',
          '내 성과',
          '돌아보기',
          '오답 회독',
          '마이페이지',
        ]);

        await page
          .getByTestId('student-results-rewards')
          .scrollIntoViewIfNeeded();
        const [rewardsBox, navigationBox] = await Promise.all([
          page.getByTestId('student-results-rewards').boundingBox(),
          bottomNavigation.boundingBox(),
        ]);
        expect(rewardsBox).not.toBeNull();
        expect(navigationBox).not.toBeNull();
        expect(rewardsBox!.y + rewardsBox!.height).toBeLessThanOrEqual(
          navigationBox!.y
        );
        expect(navigationBox!.y + navigationBox!.height).toBeLessThanOrEqual(
          viewport.height
        );
      }
    });
  }
});
