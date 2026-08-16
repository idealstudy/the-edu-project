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

  test('수업이 있으면 학생 카드와 승인된 큰 손볼 것 수를 보인다', async ({
    page,
  }) => {
    await routeGet(page, '**/api/v1/teacher/dashboard/study-rooms', [
      room(11, '김서준', 4),
    ]);

    await page.goto(PRIVATE.DASHBOARD.TEACHER);

    const roomCard = page.getByTestId('teacher-room-card-11');
    await expect(roomCard).toBeVisible();
    await expect(roomCard.getByText('4', { exact: true })).toBeVisible();
    await expect(roomCard.getByText('손볼 것', { exact: true })).toBeVisible();
  });

  test('수업 카드는 손볼 것 많은 순으로 정렬한다', async ({ page }) => {
    await routeGet(page, '**/api/v1/teacher/dashboard/study-rooms', [
      room(12, '박하윤', 1),
      room(11, '김서준', 4),
    ]);

    await page.goto(PRIVATE.DASHBOARD.TEACHER);

    const cards = page
      .getByTestId('teacher-rooms-list')
      .getByTestId(/^teacher-room-card-/);
    await expect(cards).toHaveCount(2);
    expect(
      await cards.evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute('data-testid'))
      )
    ).toEqual(['teacher-room-card-11', 'teacher-room-card-12']);
  });

  test('상단 스터디룸 만들기는 실제 생성 경로로 간다', async ({ page }) => {
    await routeGet(page, '**/api/v1/teacher/dashboard/study-rooms', [
      room(11, '김서준', 4),
    ]);
    await page.goto(PRIVATE.DASHBOARD.TEACHER);

    await expect(
      page.getByRole('link', { name: '스터디룸 만들기' })
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
    await expect(page.getByRole('heading', { name: '내 수업' })).toBeVisible();
  });

  test('처리할 항목이 없어도 제거된 전역 처리함을 다시 노출하지 않는다', async ({
    page,
  }) => {
    await routeGet(page, '**/api/v1/teacher/dashboard/study-rooms', [
      room(11, '김서준', 0),
    ]);
    await page.goto(PRIVATE.DASHBOARD.TEACHER);

    await expect(page.getByTestId('teacher-rooms-list')).toBeVisible();
    await expect(page.getByTestId('teacher-learning-inbox')).toHaveCount(0);
  });

  test('손볼 것 내역은 해당 스터디룸 학습 관리로 연결한다', async ({
    page,
  }) => {
    await routeGet(page, '**/api/v1/teacher/dashboard/study-rooms', [
      room(11, '김서준', 1),
    ]);
    await routeGet(
      page,
      '**/api/v1/teacher/study-rooms/11/learning-management',
      {
        noteRows: [],
        todoRows: [],
        feedbackRows: [
          {
            wrongAnswerId: 71,
            studentId: 31,
            studentName: '김서준',
            title: '수열 12번',
            reason: '회독이 멈춰 있습니다',
            sourceLabel: '오답',
            teacherComment: null,
            studentQuestion: null,
          },
        ],
        pendingCount: 1,
      }
    );
    await page.goto(PRIVATE.DASHBOARD.TEACHER);

    const roomCard = page.getByTestId('teacher-room-card-11');
    await expect(roomCard).toContainText(
      '피드백 달 것 1 · 할 일 승인 0 · 못했어요 사유 0 · 미확인 제출 0'
    );
    const manageLink = roomCard.getByRole('link', { name: '학습 관리 열기' });
    await expect(manageLink).toHaveAttribute('href', PRIVATE.ROOM.MANAGE(11));
    await manageLink.click();
    await expect(page).toHaveURL(PRIVATE.ROOM.MANAGE(11), { timeout: 15_000 });

    const feedbackRow = page.getByTestId('learning-management-feedback-row-71');
    await expect(feedbackRow).toContainText('김서준 · 수열 12번');
    await feedbackRow.getByRole('button', { name: '코멘트 쓰기' }).click();
    await feedbackRow
      .getByLabel('오답 코멘트')
      .fill('풀이 첫 줄에서 공식을 다시 확인해보자');
    const commentRequest = page.waitForRequest(
      (request) =>
        request.method() === 'POST' &&
        request.url().includes('/teacher/inbox/wrong-answers/71/comments')
    );
    await feedbackRow.getByRole('button', { name: '저장' }).click();
    expect((await commentRequest).postDataJSON()).toEqual({
      comment: '풀이 첫 줄에서 공식을 다시 확인해보자',
    });
  });

  test('손볼 것이 없는 수업은 기존 스터디룸 경로를 유지한다', async ({
    page,
  }) => {
    await routeGet(page, '**/api/v1/teacher/dashboard/study-rooms', [
      room(11, '김서준', 0),
    ]);

    await page.goto(PRIVATE.DASHBOARD.TEACHER);

    const roomLink = page.getByRole('link', { name: '스터디룸 열기' });
    await expect(roomLink).toHaveAttribute('href', PRIVATE.ROOM.DETAIL(11));
    await roomLink.click();
    await expect(page).toHaveURL(PRIVATE.ROOM.DETAIL(11), { timeout: 15_000 });
  });
});
