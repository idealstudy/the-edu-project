import { type Page, expect, test } from '@playwright/test';

import { okBody } from './helpers/api-mock';
import { mockMemberInfo, setAuthCookie } from './helpers/auth-mock';

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

const PDF_PARSE_20_WITH_3_BLANKS = Array.from({ length: 20 }, (_, index) => ({
  questionNo: index + 1,
  correctAnswer: [4, 11, 18].includes(index + 1) ? '' : String((index % 5) + 1),
}));

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
    await expect(
      page.getByRole('heading', { name: '오늘 할 일과 회고' })
    ).toBeVisible();
    await expect(page.getByText('서버 오류가 발생했습니다.')).toBeVisible();
    await expect(page.getByText('401')).toHaveCount(0);
  });

  test('E12/E20: 결과 0 문제은행은 복구 행동 세 가지를 제공한다', async ({
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
    await expect(empty.getByRole('button')).toHaveCount(3);
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
    await expect(page.getByTestId('question-bank-item-1052')).toContainText(
      '담김'
    );
  });

  test('E14: PDF 20문항 중 빈 정답 4·11·18번을 표시하고 저장을 막는다', async ({
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
    await page.route('**/api/v1/teacher/exams/pdf/parse', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: okBody({ questions: PDF_PARSE_20_WITH_3_BLANKS }),
      })
    );

    await page.goto('/dashboard/teacher/exams');

    await page.getByRole('button', { name: 'PDF 올리기' }).click();
    await expect(
      page.getByText('정답이 비어 있는 문항: 4, 11, 18')
    ).toBeVisible();
    await expect(
      page.getByRole('button', { name: '시험 내기' })
    ).toBeDisabled();
  });
});
