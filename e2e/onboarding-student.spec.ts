import { PRIVATE } from '@/shared/constants';
import { type Page, expect, test } from '@playwright/test';

import { okBody, setupCatchAll } from './helpers/api-mock';
import { mockMemberInfo, setAuthCookie } from './helpers/auth-mock';

const STUDENT_MEMBER = {
  id: 2,
  email: 'student@test.com',
  name: '테스트학생',
  role: 'ROLE_STUDENT',
};

const EMPTY_UNIT_NOTE_LIBRARY = { totalPages: 0, nodes: [], detail: null };

async function routeGet(page: Page, url: string, data: unknown) {
  await page.route(url, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: okBody(data),
    })
  );
}

async function setupStudentDashboard(page: Page) {
  await setupCatchAll(page);
  await setAuthCookie(page);
  await mockMemberInfo(page, STUDENT_MEMBER);
  await routeGet(page, '**/api/v1/student/exams', []);
  await routeGet(page, '**/api/v1/student/dashboard/report**', {
    studyRoomCount: 0,
    questionCount: 0,
    answerCount: 0,
    submittedHomeworkCount: 0,
    referenceExpectedGrade: null,
  });
  await routeGet(
    page,
    '**/api/v1/student/unit-notes**',
    EMPTY_UNIT_NOTE_LIBRARY
  );
  await routeGet(page, '**/api/v1/student/daily-problems**', {
    queueDate: '2026-08-07',
    backlogCount: 0,
    onboarding: true,
    items: [],
    handoff: { returnUrl: '/dashboard/student', origin: 'DAILY_PROBLEM' },
  });
  await routeGet(page, '**/api/v1/student/wrong-answers**', {
    totalCount: 0,
    items: [],
  });
}

test.describe('학생 v22 대시보드 계약', () => {
  test.beforeEach(async ({ page }) => {
    await setupStudentDashboard(page);
  });

  test('첫 화면은 과거 온보딩 대신 지금 내 상태와 오늘 할 것을 보인다', async ({
    page,
  }) => {
    await page.goto(PRIVATE.DASHBOARD.STUDENT);

    await expect(page.getByText('지금 내 상태')).toBeVisible();
    await expect(page.getByText('오늘 할 것')).toBeVisible();
    await expect(page.getByTestId('student-onboarding')).toHaveCount(0);
  });

  test('근거가 없으면 등급 숫자를 만들지 않고 응시장 행동을 보인다', async ({
    page,
  }) => {
    await page.goto(PRIVATE.DASHBOARD.STUDENT);

    const position = page.getByTestId('expected-grade-none');
    await expect(position).toContainText('아직 등급을 계산할 자료가 없어요');
    await expect(
      page.getByRole('link', { name: /응시장 열기/ })
    ).toHaveAttribute('href', PRIVATE.DASHBOARD.EXAM_HALL);
  });

  test('시험과 수업 데이터가 없어도 오늘의 문제 빈 상태를 보인다', async ({
    page,
  }) => {
    await page.goto(PRIVATE.DASHBOARD.STUDENT);

    await expect(page.getByTestId('daily-problems-empty')).toBeVisible();
    await expect(
      page.getByRole('link', { name: '단권화 책 구경' })
    ).toHaveAttribute('href', PRIVATE.DASHBOARD.UNIT_NOTES);
  });

  test('단권화 진입은 과거 수업노트 온보딩과 무관하게 항상 보인다', async ({
    page,
  }) => {
    await page.goto(PRIVATE.DASHBOARD.STUDENT);

    await expect(page.getByTestId('unit-note-entry-card')).toBeVisible();
    await expect(
      page.getByRole('link', { name: '단권화 열기' })
    ).toHaveAttribute('href', PRIVATE.DASHBOARD.UNIT_NOTES);
  });

  test('돌아보기는 오늘 할 일과 회고 카드에서 직접 연다', async ({ page }) => {
    await page.goto(PRIVATE.DASHBOARD.STUDENT);

    await expect(page.getByTestId('student-agenda-flow-card')).toBeVisible();
    await expect(page.getByRole('link', { name: /돌아보기/ })).toHaveAttribute(
      'href',
      PRIVATE.DASHBOARD.STUDENT_LOOK_BACK
    );
  });
});
