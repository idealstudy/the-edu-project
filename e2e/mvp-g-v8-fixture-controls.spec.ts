import { type Page, expect, test } from '@playwright/test';

import { okBody } from './helpers/api-mock';
import { mockMemberInfo, setAuthCookie } from './helpers/auth-mock';
import { skipWithoutEnv } from './helpers/env-guard';

// 관리자 계정이 없으면 이 스펙만 skip 된다(나머지 스위트는 정상 실행).
skipWithoutEnv(['E2E_ADMIN_EMAIL', 'E2E_ADMIN_PASSWORD']);

const STUDENT = {
  id: 1052001,
  email: 'qa-tc35-fault-student@d-edu.site',
  name: '부분장애 학생',
  role: 'ROLE_STUDENT',
};

const TEACHER = {
  id: 1052002,
  email: 'qa-tc35-fault-teacher@d-edu.site',
  name: '저장오류 선생님',
  role: 'ROLE_TEACHER',
};

const requireValue = (value: string | undefined, name: string) => {
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

const loginAdmin = async (page: Page) => {
  await page.goto('/login');
  await page
    .getByTestId('login-email-input')
    .fill(requireValue(process.env.E2E_ADMIN_EMAIL, 'E2E_ADMIN_EMAIL'));
  await page
    .getByTestId('login-password-input')
    .fill(requireValue(process.env.E2E_ADMIN_PASSWORD, 'E2E_ADMIN_PASSWORD'));
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
};

async function baseApi(page: Page, member: object) {
  await setAuthCookie(page);
  await page.route('**/api/v1/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: okBody({}),
    })
  );
  await mockMemberInfo(page, member);
}

test.describe('MVP-G TC35 제어 fixture', () => {
  test('E1: 오늘의 문제 한 원천만 실패해도 나머지 대시보드 블록은 남는다', async ({
    page,
  }) => {
    await baseApi(page, STUDENT);
    await page.route('**/api/v1/student/daily-problems**', (route) =>
      route.fulfill({
        status: 503,
        contentType: 'application/json',
        body: JSON.stringify({
          code: 'QA_TC35_SOURCE_DOWN',
          message: '부분 장애',
        }),
      })
    );
    await page.route('**/api/v1/student/exams', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: okBody([]),
      })
    );
    await page.route('**/api/v1/student/wrong-answers**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: okBody({ totalCount: 0, items: [] }),
      })
    );
    await page.route('**/api/v1/student/dashboard/report**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: okBody({
          expectedGrade: null,
          studyRoomCount: 0,
          teachingNoteCount: 0,
          homeworkCount: 0,
          qnaCount: 0,
        }),
      })
    );

    await page.goto('/dashboard/student');

    await expect(
      page.getByRole('heading', { name: '단권화 노트' })
    ).toBeVisible();
    // 제목은 2026-08-13 시안 정합(커밋 09b302b26)에서 "오늘 할 일과 회고" -> "오늘 할 일"
    // 로 바뀌었는데 이 검사만 옛 문구를 보고 있었다. 그때부터 계속 빨간불이었다.
    // 제품은 정상이고 검사가 낡은 것이다.
    await expect(
      page.getByRole('heading', { name: '오늘 할 일' })
    ).toBeVisible();
    await expect(page.getByText('서버 오류가 발생했습니다.')).toBeVisible();
    await expect(page.getByText('401')).toHaveCount(0);
  });

  test('E12: 교사 결과 0 문제은행은 승인된 복구 행동 두 가지를 제공한다', async ({
    page,
  }) => {
    await baseApi(page, TEACHER);
    await page.route('**/api/v1/teacher/dashboard/study-rooms', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: okBody([{ id: 1052, name: 'QA TC35 빈 문제은행반' }]),
      })
    );
    await page.route('**/api/v1/common/tree', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: okBody({ nodes: [] }),
      })
    );
    await page.route('**/api/v1/teacher/question-bank**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: okBody({
          content: [],
          page: 0,
          size: 20,
          totalElements: 0,
          totalPages: 0,
        }),
      })
    );

    await page.goto('/dashboard/teacher/exams');

    const empty = page.getByTestId('question-bank-empty');
    await expect(empty).toBeVisible();
    await expect(empty.getByRole('button')).toHaveCount(2);
    await expect(
      empty.getByRole('button', { name: '난이도 조건 빼고 다시 찾기' })
    ).toBeVisible();
    await expect(
      empty.getByRole('button', { name: 'PDF로 직접 올리기' })
    ).toBeVisible();
  });

  test('E20: 관리자 문항 0건은 단원 문항 올리기 안내 한 가지를 제공한다', async ({
    page,
  }) => {
    await loginAdmin(page);
    await page.route('**/api/v1/admin/question-bank**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: okBody({
          content: [],
          page: 0,
          size: 20,
          totalElements: 0,
          totalPages: 0,
        }),
      })
    );
    await page.route('**/api/v1/admin/exams', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: okBody([]),
      })
    );
    await page.route('**/api/v1/common/tree', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: okBody({
          nodes: [
            {
              nodeId: 10,
              parentId: null,
              subject: 'ALGEBRA',
              unit: 'SEQUENCES',
              displayName: '수열',
              depth: 1,
              masteryScore: 0,
              diagnosedScore: null,
              attemptCount: 0,
              correctCount: 0,
              unitNotePageCount: 0,
            },
          ],
        }),
      })
    );

    await page.goto('/admin/question-bank');

    await expect(
      page.getByRole('heading', { name: '이 단원에는 아직 문항이 없어요' })
    ).toBeVisible();
    await page.getByTestId('admin-question-bank-unit-filter').click();
    await page.getByRole('option', { name: '수열' }).click();
    await expect(
      page.getByRole('link', { name: '이 단원 문항 올리기' })
    ).toHaveAttribute(
      'href',
      '/admin/open-challenge/new?grade=HIGH_2&treeNodeId=10'
    );
  });

  test('E13: 시험 저장 API만 실패하면 담은 문항이 남고 같은 문항으로 재시도한다', async ({
    page,
  }) => {
    await baseApi(page, TEACHER);
    await page.route('**/api/v1/teacher/dashboard/study-rooms', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: okBody([{ id: 1052, name: 'QA TC35 저장실패반' }]),
      })
    );
    await page.route('**/api/v1/common/tree', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: okBody({ nodes: [] }),
      })
    );
    await page.route('**/api/v1/teacher/question-bank**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: okBody({
          content: [
            {
              challengeId: 1052,
              questionNo: 1,
              title: 'QA TC35 저장 실패 문항',
              sourceText: 'QA TC35 fixture',
              questionText: '2+3의 값은?',
              questionImageUrl: null,
              treeNodePath: '대수 > 수열',
              treeNodeId: 1,
              wrongAnswerRate: 30,
              difficulty: 'MID',
              hasCorrectAnswer: true,
              hasCutoff: false,
            },
          ],
          page: 0,
          size: 20,
          totalElements: 1,
          totalPages: 1,
        }),
      })
    );
    await page.route('**/api/v1/teacher/exams', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 503,
          contentType: 'application/json',
          body: JSON.stringify({
            code: 'QA_TC35_SAVE_DOWN',
            message: '저장 원천만 실패',
          }),
        });
      }
      return route.continue();
    });

    await page.goto('/dashboard/teacher/exams');
    await page
      .getByTestId('question-bank-item-1052')
      .getByRole('button')
      .click();
    await page.getByRole('button', { name: '시험 내기' }).click();

    await expect(page.getByTestId('exam-create-error')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '담은 문항 1개' })
    ).toBeVisible();
    await expect(
      page.getByText('그대로 남아 있습니다', { exact: true })
    ).toBeVisible();
    await expect(page.getByText('담김', { exact: true })).toBeVisible();
  });

  test('E14 범위 가드: v22 승인 범위는 PDF 진입 카드까지다', async ({
    page,
  }) => {
    await baseApi(page, TEACHER);
    await page.route('**/api/v1/teacher/dashboard/study-rooms', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: okBody([{ id: 1052, name: 'QA TC35 PDF 검증반' }]),
      })
    );
    await page.goto('/dashboard/teacher/exams');

    await expect(page.getByText('PDF 올리기', { exact: true })).toBeVisible();
    await expect(page.getByText('정답을 직접 입력해야 합니다')).toBeVisible();
    await expect(page.getByText('정답이 비어 있는 문항:')).toHaveCount(0);
  });
});
