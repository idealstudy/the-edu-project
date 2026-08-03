// student dashboard (API route fixtures; authentication guard renders guest-safe shell)
import { type Page, expect, test } from '@playwright/test';

import type {
  DailyProblemQueue,
  WrongAnswerItem,
} from '@/entities/wrong-answer';
import type { AssignedExam, ExamAnalysis } from '@/entities/exam';

import { okBody } from './helpers/api-mock';
import { mockMemberInfo, setAuthCookie } from './helpers/auth-mock';

const STUDENT_MEMBER = {
  id: 7,
  email: 'mvp-g-student@test.com',
  name: 'MVP-G 학생',
  role: 'ROLE_STUDENT',
};

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
    teacherComment: null,
    commentedByTeacherId: null,
    commentedAt: null,
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
    teacherComment: null,
    commentedByTeacherId: null,
    commentedAt: null,
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
    teacherComment: null,
    commentedByTeacherId: null,
    commentedAt: null,
    difficulty: null,
    nationalWrongRate: null,
    title: '졸업한 문제',
    questionText: '목록에 보이면 안 되는 문제',
    questionImageUrl: null,
  },
] satisfies WrongAnswerItem[];

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
} satisfies DailyProblemQueue;

const ASSIGNED_EXAMS = [
  {
    examId: 801,
    attemptId: 901,
    title: '수학Ⅰ 수열 진단시험',
    subject: 'MATH',
    examType: 'SCHOOL',
    status: 'ANALYZED',
    totalQuestions: 10,
    periodStart: '2026-07-30T09:00:00',
    periodEnd: null,
    predictedGradeLow: 2,
    predictedGradeHigh: 3,
  },
] satisfies AssignedExam[];

const EXAM_ANALYSIS = {
  attemptId: 901,
  examTitle: '수학Ⅰ 수열 진단시험',
  examType: 'SCHOOL',
  rawScore: 80,
  predictedGradeLow: 2,
  predictedGradeHigh: 3,
  weakUnits: [
    { treeNodeId: 11, name: '수열', wrongCount: 2 },
    { treeNodeId: 12, name: '수열의 합', wrongCount: 1 },
    { treeNodeId: 13, name: '수학적 귀납법', wrongCount: 0 },
  ],
  teacherPins: [],
  evidence: [
    { source: 'EXAM_SCORE', label: '시험 정답률 80%', value: 80 },
    {
      source: 'WRONG_ANSWER_REVIEW',
      label: '오답 회독 진행도 40%',
      value: 40,
    },
    {
      source: 'WEAKNESS_TREE',
      label: '약점트리 평균 숙련도 40점',
      value: 40,
    },
  ],
  estimateSource: 'AI_STUB',
  realDataLinked: false,
  referenceOnly: true,
  realDataFollowUpRequired: false,
  dataNotice: '내신 시험 분석은 AI 추정이며 참고용입니다.',
} satisfies ExamAnalysis;

const setupDashboardApi = async (page: Page) => {
  await setAuthCookie(page);
  await page.route('**/api/v1/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: okBody({}),
    });
  });
  await mockMemberInfo(page, STUDENT_MEMBER);
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
  await page.route('**/api/v1/student/exams', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: okBody(ASSIGNED_EXAMS),
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

  test('예상등급 범위·약점 3개·추정 근거를 분석 화면에 표시한다', async ({
    page,
  }) => {
    await setupDashboardApi(page);
    await page.route('**/api/v1/student/exams/901', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: okBody({
          attemptId: 901,
          title: '수학Ⅰ 수열 진단시험',
          examType: 'SCHOOL',
          totalQuestions: 10,
          questions: [],
          status: 'ANALYZED',
        }),
      });
    });
    await page.route('**/api/v1/student/exams/901/analysis', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: okBody(EXAM_ANALYSIS),
      });
    });

    await page.goto('/dashboard/student/exams/901');

    await expect(page.getByTestId('exam-analysis-card')).toContainText(
      '2~3등급'
    );
    await expect(page.getByText('내신 · AI 추정 참고용')).toBeVisible();
    await expect(page.getByText('이 추정이 나온 곳')).toBeVisible();
    await expect(page.getByText('수열', { exact: true })).toBeVisible();
    await expect(page.getByText('2문항 오답', { exact: true })).toBeVisible();
    await expect(
      page.getByText('수학적 귀납법', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText('숙련도 보완 필요', { exact: true })
    ).toBeVisible();
    await expect(
      page.getByText('내신 시험 분석은 AI 추정이며 참고용입니다.')
    ).toBeVisible();
  });
});
