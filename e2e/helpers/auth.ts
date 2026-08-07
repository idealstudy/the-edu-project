import { PRIVATE } from '@/shared/constants';
import { type Page, expect } from '@playwright/test';

// 로그인
export async function loginAsTeacher(page: Page) {
  await page.goto('/login');
  await page
    .getByTestId('login-email-input')
    .fill(process.env.E2E_TEACHER_EMAIL!);
  await page
    .getByTestId('login-password-input')
    .fill(process.env.E2E_TEACHER_PASSWORD!);
  await page.getByTestId('login-submit-button').click();

  await page.waitForURL(PRIVATE.DASHBOARD.TEACHER);
  await expect(page).toHaveURL(PRIVATE.DASHBOARD.TEACHER);
}

export async function findOwnedStudyRoomId(page: Page): Promise<number> {
  await page.goto(PRIVATE.DASHBOARD.TEACHER);
  const roomLink = page
    .locator('a[href^="/study-rooms/"][href$="/note"]')
    .first();
  await expect(roomLink).toBeVisible();
  const href = await roomLink.getAttribute('href');
  const studyRoomId = Number(href?.match(/^\/study-rooms\/(\d+)\/note$/)?.[1]);
  if (!Number.isSafeInteger(studyRoomId) || studyRoomId <= 0) {
    throw new Error('로그인한 선생님의 소유 스터디룸을 찾지 못했습니다.');
  }
  return studyRoomId;
}

export async function loginAsStudent(page: Page) {
  await page.goto('/login');
  await page
    .getByTestId('login-email-input')
    .fill(process.env.E2E_STUDENT_EMAIL!);
  await page
    .getByTestId('login-password-input')
    .fill(process.env.E2E_STUDENT_PASSWORD!);
  await page.getByTestId('login-submit-button').click();

  // 2.0: 학생 로그인은 /learning(개인 학습 허브)로 랜딩한다(ADR-0019).
  // /dashboard/student(1.0 학생 대시보드)도 살아 있어, 둘 중 하나면 통과.
  await page.waitForURL(/\/(learning|dashboard\/student)(\?|$)/);
}
