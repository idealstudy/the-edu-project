import { PRIVATE } from '@/shared/constants';
import { type Page, expect, test } from '@playwright/test';

import { okBody, setupCatchAll } from './helpers/api-mock';
import { mockMemberInfo, setAuthCookie } from './helpers/auth-mock';

const TEACHER_MEMBER = {
  id: 1,
  email: 'teacher@test.com',
  name: '테스트선생님',
  role: 'ROLE_TEACHER',
};

const EMPTY_INBOX = {
  recentExamCount: 0,
  recentExam: [],
  stuckAfterGraduationCount: 0,
  stuckAfterGraduation: [],
  neglectedCount: 0,
  neglected: [],
  neglectedThresholdDays: 3,
};

const EMPTY_RECOMMENDATIONS = {
  weekOf: '2026-08-03',
  weekEnd: '2026-08-09',
  totalCount: 0,
  doneCount: 0,
  skippedCount: 0,
  items: [],
};

const room = (id: number, studentName: string, todoCount: number) => ({
  id,
  name: `${studentName} 수업`,
  studentName,
  state: 'ACTIVE',
  todoCount,
  todoBreakdown: {
    commentNeeded: todoCount,
    todoApproval: 0,
    notDoneReason: 0,
    unreadSubmission: 0,
  },
});

async function routeGet(page: Page, url: string, data: unknown) {
  await page.route(url, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: okBody(data),
    })
  );
}

async function setupTeacherDashboard(page: Page) {
  await setupCatchAll(page);
  await setAuthCookie(page);
  await mockMemberInfo(page, TEACHER_MEMBER);
  await routeGet(page, '**/api/v1/teacher/dashboard/study-rooms', []);
  await routeGet(page, '**/api/v1/teacher/inbox', EMPTY_INBOX);
  await routeGet(
    page,
    '**/api/v1/teacher/todos/recommendations',
    EMPTY_RECOMMENDATIONS
  );
}

test.describe('선생님 v22 대시보드 계약', () => {
  test.beforeEach(async ({ page }) => {
    await setupTeacherDashboard(page);
  });

  test('수업 0개는 첫 스터디룸과 학생 초대 코드 행동을 보인다', async ({
    page,
  }) => {
    await page.goto(PRIVATE.DASHBOARD.TEACHER);

    const empty = page.getByTestId('teacher-rooms-empty');
    await expect(empty).toContainText('아직 스터디룸이 하나도 없어요');
    await expect(
      empty.getByRole('link', { name: '첫 스터디룸 만들기' })
    ).toHaveAttribute('href', PRIVATE.ROOM.CREATE);
    await expect(
      empty.getByRole('link', { name: '학생 초대 코드 보기' })
    ).toHaveAttribute('href', PRIVATE.DASHBOARD.TEACHER_MY);
  });

  test('수업이 있으면 학생 카드와 손볼 것 수를 보인다', async ({ page }) => {
    await routeGet(page, '**/api/v1/teacher/dashboard/study-rooms', [
      room(11, '김서준', 4),
    ]);

    await page.goto(PRIVATE.DASHBOARD.TEACHER);

    const rooms = page.getByTestId('teacher-rooms-list');
    await expect(rooms).toContainText('김서준');
    await expect(rooms).toContainText('손볼 것 4건');
  });

  test('수업 카드는 손볼 것 많은 순으로 정렬한다', async ({ page }) => {
    await routeGet(page, '**/api/v1/teacher/dashboard/study-rooms', [
      room(12, '박하윤', 1),
      room(11, '김서준', 4),
    ]);

    await page.goto(PRIVATE.DASHBOARD.TEACHER);

    const cards = page.getByTestId('teacher-rooms-list').locator('a');
    await expect(cards.nth(0)).toContainText('김서준');
    await expect(cards.nth(1)).toContainText('박하윤');
  });

  test('상단 수업 만들기는 실제 생성 경로로 간다', async ({ page }) => {
    await routeGet(page, '**/api/v1/teacher/dashboard/study-rooms', [
      room(11, '김서준', 4),
    ]);
    await page.goto(PRIVATE.DASHBOARD.TEACHER);

    await expect(
      page.getByRole('link', { name: '수업 만들기' })
    ).toHaveAttribute('href', PRIVATE.ROOM.CREATE);
  });

  test('마이페이지는 초대 코드와 사용 시간을 보인다', async ({ page }) => {
    await page.goto(PRIVATE.DASHBOARD.TEACHER_MY);

    await expect(page.getByTestId('teacher-my-page')).toBeVisible();
    await expect(page.getByText('학생 초대 코드')).toBeVisible();
    await expect(page.getByText('이번 주 사용 시간')).toBeVisible();
  });

  test('과거 온보딩 컴포넌트를 다시 노출하지 않는다', async ({ page }) => {
    await page.goto(PRIVATE.DASHBOARD.TEACHER);

    await expect(page.getByTestId('teacher-onboarding')).toHaveCount(0);
    await expect(page.getByText('학생별 수업')).toBeVisible();
  });

  test('처리할 항목이 없으면 처리함 0 상태를 보인다', async ({ page }) => {
    await routeGet(page, '**/api/v1/teacher/dashboard/study-rooms', [
      room(11, '김서준', 0),
    ]);
    await page.goto(PRIVATE.DASHBOARD.TEACHER);

    await expect(page.getByRole('heading', { name: '처리함' })).toBeVisible();
    await expect(
      page.getByText('지금 확인할 방치 오답이나 5회독 실패 신호가 없어요.')
    ).toBeVisible();
  });

  test('시험 오답이 있으면 처리함에 직접 쓰기를 보인다', async ({ page }) => {
    await routeGet(page, '**/api/v1/teacher/dashboard/study-rooms', [
      room(11, '김서준', 1),
    ]);
    await routeGet(page, '**/api/v1/teacher/inbox', {
      ...EMPTY_INBOX,
      recentExamCount: 1,
      recentExam: [
        {
          id: 71,
          studentId: 2,
          sourceType: 'EXAM',
          challengeId: null,
          challengeAttemptId: null,
          examAnswerId: 91,
          questionSnapshot: { sourceText: 'v22 시험' },
          treeNodeId: 14,
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
          difficulty: null,
          nationalWrongRate: null,
          title: '수열 12번',
          questionText: '수열의 합을 구하세요.',
          questionImageUrl: null,
        },
      ],
    });

    await page.goto(PRIVATE.DASHBOARD.TEACHER);

    await expect(page.getByTestId('teacher-learning-inbox')).toBeVisible();
    await expect(page.getByRole('button', { name: '직접 쓰기' })).toBeVisible();
  });

  test('수업 카드는 기존 스터디룸 노트 경로를 유지한다', async ({ page }) => {
    await routeGet(page, '**/api/v1/teacher/dashboard/study-rooms', [
      room(11, '김서준', 4),
    ]);

    await page.goto(PRIVATE.DASHBOARD.TEACHER);

    await expect(page.getByRole('link', { name: /김서준/ })).toHaveAttribute(
      'href',
      '/study-rooms/11/note'
    );
  });
});
