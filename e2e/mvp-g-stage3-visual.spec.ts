import { expect, test } from '@playwright/test';

import { okBody } from './helpers/api-mock';
import { mockMemberInfo, setAuthCookie } from './helpers/auth-mock';

const STUDENT = {
  id: 31,
  email: 'stage3-student@test.com',
  name: '김서준',
  role: 'ROLE_STUDENT',
};
const TEACHER = {
  id: 41,
  email: 'stage3-teacher@test.com',
  name: '한지원',
  role: 'ROLE_TEACHER',
};

const treeNodes = [
  ['ALGEBRA', '등차수열', 78],
  ['ALGEBRA', '등비수열', 48],
  ['ALGEBRA', '수열의 합', 42],
  ['CALCULUS_1', '수열의 극한', 62],
  ['CALCULUS_1', '급수', 18],
  ['CALCULUS_1', '미분법', 84],
  ['PROBABILITY_STATISTICS', '경우의 수', 74],
  ['PROBABILITY_STATISTICS', '조건부확률', 35],
  ['PROBABILITY_STATISTICS', '통계적 추정', 0],
].map(([subject, displayName, masteryScore], index) => ({
  nodeId: index + 1,
  parentId: null,
  subject,
  unit: `unit-${index + 1}`,
  displayName,
  depth: 0,
  masteryScore,
  diagnosedScore: null,
  attemptCount: 8,
  correctCount: 5,
  unitNotePageCount: index % 4,
}));

async function baseApi(page: import('@playwright/test').Page, member: object) {
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

test.describe('MVP-G 3단계 1024×768 첫 화면', () => {
  test.use({ viewport: { width: 1024, height: 768 } });

  test('학생 내 성과는 읽기 전용 학습 지도가 첫 카드다', async ({ page }) => {
    await baseApi(page, STUDENT);
    await page.route('**/api/v1/common/tree', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: okBody({ nodes: treeNodes }),
      })
    );
    await page.goto('/dashboard/student/results');
    await expect(page.getByTestId('learning-map')).toBeVisible();
    await expect(
      page.getByRole('heading', { name: '내 학습 지도' })
    ).toBeVisible();
    await expect(
      page.getByTestId('learning-map').getByText('오픈챌린지').first()
    ).toBeVisible();
    await expect(page.getByRole('button', { name: /필기|업로드/ })).toHaveCount(
      0
    );
    await page.screenshot({
      path: 'test-results/mvp-g-stage3/s-result-ok-1024x768.png',
      fullPage: true,
    });
  });

  test('학생 돌아보기는 코치가 보낸 말이 첫 카드다', async ({ page }) => {
    await baseApi(page, STUDENT);
    await page.route('**/api/v1/student/look-back**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: okBody({
          coachMessage:
            '이번 주에는 하루를 적었네. 그날은 무엇부터 시작해서 잘 굴러갔어?',
          calendar: Array.from({ length: 7 }, (_, index) => ({
            date: `2026-08-${String(index + 3).padStart(2, '0')}`,
            todoDone: index === 2 ? 3 : 0,
            todoTotal: index === 2 ? 4 : 0,
            studyMinutes: 0,
            hasRetrospect: index === 2,
            examCount: 0,
          })),
          retrospects: [
            {
              date: '2026-08-05',
              chips: ['FOCUSED'],
              learned: '수열의 합에서 항의 개수를 먼저 셌다.',
              reflected: null,
              tomorrow: null,
            },
          ],
        }),
      })
    );
    await page.goto('/dashboard/student/look-back');
    await expect(page.getByTestId('coach-message')).toBeVisible();
    await expect(page.getByText('코치가 보낸 말')).toBeVisible();
    await expect(page.getByText(/그날은 무엇부터/)).toBeVisible();
    await page.screenshot({
      path: 'test-results/mvp-g-stage3/s-look-week-1024x768.png',
      fullPage: true,
    });
    await page.getByRole('button', { name: '월간' }).click();
    await expect(page.getByText('이 달 회고 1건')).toBeVisible();
  });

  test('학생 돌아보기 기록 0은 코치 말을 지어내지 않는다', async ({ page }) => {
    await baseApi(page, STUDENT);
    await page.route('**/api/v1/student/look-back**', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: okBody({ coachMessage: null, calendar: [], retrospects: [] }),
      })
    );
    await page.goto('/dashboard/student/look-back');
    await expect(
      page.getByText(/없는 기록을 지어내서 칭찬하진 않을게/)
    ).toBeVisible();
    await expect(
      page.getByText(
        '아직 돌아볼 기록이 없어요. 빈 날을 채우라고 재촉하지 않습니다.'
      )
    ).toBeVisible();
  });

  test('선생님 내 수업 카드가 손볼 것 내역을 한 줄로 보인다', async ({
    page,
  }) => {
    await baseApi(page, TEACHER);
    await page.route('**/api/v1/teacher/dashboard/study-rooms', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: okBody([
          { id: 12, name: '김서준' },
          { id: 13, name: '박하윤' },
        ]),
      })
    );
    await page.goto('/dashboard/teacher');
    const roomList = page.getByTestId('teacher-rooms-list');
    const inbox = page.getByTestId('teacher-learning-inbox-after-rooms');
    await expect(roomList).toBeVisible();
    await expect(page.getByText('피드백 달 것').first()).toBeVisible();
    await expect(page.getByText('미확인 제출').first()).toBeVisible();
    await expect
      .poll(async () =>
        roomList.evaluate(
          (element, inboxElement) => {
            if (!(inboxElement instanceof Node)) return false;
            return Boolean(
              element.compareDocumentPosition(inboxElement) &
                Node.DOCUMENT_POSITION_FOLLOWING
            );
          },
          await inbox.elementHandle()
        )
      )
      .toBe(true);
    await page.screenshot({
      path: 'test-results/mvp-g-stage3/t-rooms-ok-1024x768.png',
      fullPage: true,
    });
  });

  test('선생님 내 수업 0개는 첫 스터디룸과 초대 코드 행동을 보인다', async ({
    page,
  }) => {
    await baseApi(page, TEACHER);
    await page.route('**/api/v1/teacher/dashboard/study-rooms', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: okBody([]),
      })
    );
    await page.goto('/dashboard/teacher');
    const emptyState = page.getByTestId('teacher-rooms-empty');
    await expect(emptyState).toBeVisible();
    await expect(
      page.getByRole('link', { name: '첫 스터디룸 만들기' })
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: '학생 초대 코드 보기' })
    ).toBeVisible();
    await expect(
      page.getByTestId('teacher-learning-inbox-after-rooms')
    ).toHaveCount(0);
    await expect(page.getByRole('link', { name: '수업 만들기' })).toHaveCount(
      0
    );
  });

  test('선생님 마이페이지는 두 번째 전역 화면이다', async ({ page }) => {
    await baseApi(page, TEACHER);
    await page.goto('/dashboard/teacher/my');
    await expect(page.getByTestId('teacher-my-page')).toBeVisible();
    await expect(page.getByText('학생 초대 코드')).toBeVisible();
    await expect(page.getByText('이번 주 사용 시간')).toBeVisible();
  });
});
