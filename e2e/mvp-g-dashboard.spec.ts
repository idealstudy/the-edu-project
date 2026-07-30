// student dashboard (API route fixtures; authentication guard renders guest-safe shell)
import { type Page, expect, test } from '@playwright/test';

import { okBody } from './helpers/api-mock';

const WRONG_ANSWER_ITEMS = [
  {
    id: 101,
    studentId: 7,
    sourceType: 'TEACHER',
    challengeId: 201,
    challengeAttemptId: 301,
    examAnswerId: null,
    questionSnapshot: {
      sourceText: '6월 모평 28번',
      unit: '수열 · 점화식',
    },
    treeNodeId: 401,
    status: 'ACTIVE',
    reviewCount: 1,
    hintFreeSolveCount: 0,
    lastReviewCorrect: false,
    wrongAgainCount: 0,
    nextReviewAt: null,
    graduatedAt: null,
    difficulty: 'HIGHEST',
    nationalWrongRate: 89,
    title: '역수형 점화식',
    questionText: '수열 {aₙ}의 점화식을 이용하여 a₅의 값을 구하시오.',
    questionImageUrl: null,
  },
  {
    id: 102,
    studentId: 7,
    sourceType: 'EXAM',
    challengeId: 202,
    challengeAttemptId: 302,
    examAnswerId: 502,
    questionSnapshot: { sourceText: '3월 학평 19번' },
    treeNodeId: 402,
    status: 'ACTIVE',
    reviewCount: 2,
    hintFreeSolveCount: 1,
    lastReviewCorrect: true,
    wrongAgainCount: 0,
    nextReviewAt: null,
    graduatedAt: null,
    difficulty: 'MIDDLE',
    nationalWrongRate: 46,
    title: '로그 방정식',
    questionText: '진수 조건을 확인한 뒤 로그 방정식의 해를 구하시오.',
    questionImageUrl: null,
  },
  {
    id: 103,
    studentId: 7,
    sourceType: 'SELF_REVIEW',
    challengeId: null,
    challengeAttemptId: null,
    examAnswerId: null,
    questionSnapshot: {},
    treeNodeId: null,
    status: 'GRADUATED',
    reviewCount: 5,
    hintFreeSolveCount: 3,
    lastReviewCorrect: true,
    wrongAgainCount: 0,
    nextReviewAt: null,
    graduatedAt: '2026-07-29T12:00:00',
    difficulty: null,
    nationalWrongRate: null,
    title: '졸업한 문제',
    questionText: '목록에 보이면 안 되는 문제',
    questionImageUrl: null,
  },
];

const DAILY_PROBLEMS = {
  queueDate: '2026-07-30',
  backlogCount: 11,
  onboarding: false,
  items: [
    {
      position: 1,
      provider: 'TEACHER',
      wrongAnswerId: 101,
      challengeId: 201,
      reason: '어제 수업에서 다룬 급소예요.',
      difficulty: 'HIGHEST',
      nationalWrongRate: 89,
      stampsFilled: 1,
      stampsTotal: 5,
      solvedStatus: 'PENDING',
    },
    {
      position: 2,
      provider: 'OPEN_CHALLENGE_RECOMMEND',
      wrongAnswerId: 102,
      challengeId: 202,
      reason: '복습 주기가 도착한 오답이에요.',
      difficulty: 'MIDDLE',
      nationalWrongRate: 46,
      stampsFilled: 2,
      stampsTotal: 5,
      solvedStatus: 'PENDING',
    },
    {
      position: 3,
      provider: 'OPEN_CHALLENGE_RECOMMEND',
      wrongAnswerId: null,
      challengeId: 203,
      reason: '오늘 큐의 부족분을 약점트리에서 추천했어요.',
      difficulty: 'HIGH',
      nationalWrongRate: 62,
      stampsFilled: 0,
      stampsTotal: 5,
      solvedStatus: 'PENDING',
    },
  ],
};

const setupDashboardApi = async (page: Page) => {
  await page.route('**/api/v1/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: okBody({}),
    });
  });
  await page.route('**/api/v1/student/daily-problems**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: okBody(DAILY_PROBLEMS),
    });
  });
  await page.route('**/api/v1/student/wrong-answers**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: okBody({
        totalCount: WRONG_ANSWER_ITEMS.length,
        items: WRONG_ANSWER_ITEMS,
      }),
    });
  });
};

test.describe('MVP-G 학생 대시보드 코어', () => {
  test('오늘의 문제 3장과 졸업 제외 오답 창고를 렌더한다', async ({ page }) => {
    await setupDashboardApi(page);

    await page.goto('/dashboard/student');

    await expect(page.getByTestId('daily-problems-section')).toBeVisible();
    await expect(
      page.locator('[data-testid^="daily-problem-card-"]')
    ).toHaveCount(3);
    await expect(page.getByText('밀린 오답')).toBeVisible();

    await page.goto('/dashboard/student/wrong-answers');

    await expect(page.getByTestId('wrong-answer-card-101')).toBeVisible();
    await expect(page.getByTestId('wrong-answer-card-102')).toBeVisible();
    await expect(page.getByTestId('wrong-answer-card-103')).toHaveCount(0);
    await expect(page.getByText('졸업한 문제')).toHaveCount(0);

    await page.screenshot({
      path: '/tmp/mvp-g-wrong-answer-warehouse.png',
      fullPage: true,
    });
  });

  test('정오답·힌트 사용을 회독 POST로 보내고 결과 도장을 보여준다', async ({
    page,
  }) => {
    await setupDashboardApi(page);
    await page.route(
      '**/api/v1/student/wrong-answers/101/reviews',
      async (route) => {
        expect(route.request().postDataJSON()).toEqual({
          isCorrect: false,
          usedHint: true,
          usedAi: false,
        });
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: okBody({
            reviewNo: 2,
            reviewCount: 2,
            graduated: false,
            nextReviewAt: '2026-08-02T09:00:00',
            hintFreeSolveCount: 0,
            stampsFilled: 2,
            stampsTotal: 5,
          }),
        });
      }
    );

    await page.goto('/dashboard/student/wrong-answers/101');
    await page.getByTestId('wrong-answer-used-hint').click();
    await page.getByTestId('wrong-answer-submit-incorrect').click();

    await expect(page.getByTestId('wrong-answer-review-result')).toBeVisible();
    await expect(page.getByText('오답으로 기록했어요')).toBeVisible();
    await expect(page.getByText('도움 받고 해결')).toBeVisible();
  });

  test('하루 1회독 409를 코드 없이 사용자 문장으로 노출한다', async ({
    page,
  }) => {
    await setupDashboardApi(page);
    await page.route(
      '**/api/v1/student/wrong-answers/101/reviews',
      async (route) => {
        await route.fulfill({
          status: 409,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'WRONG_ANSWER_ALREADY_REVIEWED_TODAY',
            message: '같은 오답은 하루에 한 번만 회독할 수 있습니다.',
          }),
        });
      }
    );

    await page.goto('/dashboard/student/wrong-answers/101');
    await page.getByTestId('wrong-answer-submit-correct').click();

    await expect(page.getByTestId('wrong-answer-review-error')).toContainText(
      '같은 오답은 하루에 한 번만 회독할 수 있습니다.'
    );
    await expect(page.getByText('401')).toHaveCount(0);
  });
});
