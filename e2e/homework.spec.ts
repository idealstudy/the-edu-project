import { Page, expect, test } from '@playwright/test';

import {
  findJoinedStudyRoomId,
  findOwnedStudyRoomId,
  loginAsStudent,
  loginAsTeacher,
} from './helpers/auth';

const homeworkContent = 'E2E 과제 내용';

async function goToTeacherHomeworkCreatePage(page: Page) {
  // 개발 서버에서 로딩이 오래 걸리는 이슈로 인해 타임아웃 시간 증가
  test.setTimeout(60000);

  await loginAsTeacher(page);
  const studyRoomId = await findOwnedStudyRoomId(page);
  await page.goto(`/study-rooms/${studyRoomId}/homework`);
  await page.getByTestId('homework-create-button').click();
  await page.waitForURL(`/study-rooms/${studyRoomId}/homework/new`);

  await expect(page).toHaveURL(`/study-rooms/${studyRoomId}/homework/new`);
  return studyRoomId;
}

async function createHomeworkAsTeacher(page: Page) {
  const homeworkTitle = `E2E 과제 제목-${Date.now()}`;

  const studyRoomId = await goToTeacherHomeworkCreatePage(page);

  const submitButton = page.getByTestId('homework-submit-button');
  const contentEditor = page.locator('.ProseMirror').first();

  await page.getByTestId('homework-title-input').fill(homeworkTitle);
  await page.getByTestId('homework-student-tag-input').click();
  const seededStudentOption = page
    .getByTestId('homework-student-tag-input-option')
    .first();
  await expect(seededStudentOption).toBeVisible({ timeout: 10_000 });
  await seededStudentOption.click();
  await expect(
    page.getByTestId('homework-student-tag-input-selected-item')
  ).toBeVisible();

  await page.getByTestId('homework-deadline-input').fill('2026-12-31T23:59');
  await contentEditor.click();
  await page.keyboard.type(homeworkContent);

  await expect(submitButton).toBeEnabled();
  await submitButton.click();

  await page.waitForURL(`/study-rooms/${studyRoomId}/homework`);

  const newHomeworkLink = page
    .getByTestId('homework-list-item')
    .filter({ hasText: homeworkTitle })
    .first();

  await expect(newHomeworkLink).toBeVisible({ timeout: 10000 });

  const newHomeworkHref = await newHomeworkLink.getAttribute('href');
  expect(newHomeworkHref).not.toBeNull();

  const homeworkId = newHomeworkHref?.match(/\/homework\/(\d+)$/)?.[1] ?? null;
  expect(homeworkId).not.toBeNull();

  return { homeworkId: homeworkId!, homeworkTitle, studyRoomId };
}

// teacher account
test.describe('과제 - 선생님', () => {
  test('과제 만들기 버튼을 통해 생성 페이지로 이동할 수 있다', async ({
    page,
  }) => {
    await goToTeacherHomeworkCreatePage(page);
  });

  test('필수 입력값이 하나라도 없으면 저장 버튼이 비활성화된다.', async ({
    page,
  }) => {
    const homeworkTitle = `E2E 과제 제목-${Date.now()}`;

    await goToTeacherHomeworkCreatePage(page);

    const submitButton = page.getByTestId('homework-submit-button');
    const contentEditor = page.locator('.ProseMirror').first();

    await expect(submitButton).toBeDisabled();

    await page.getByTestId('homework-title-input').fill(homeworkTitle);
    await expect(submitButton).toBeDisabled();

    await page.getByTestId('homework-deadline-input').fill('2026-12-31T23:59');
    await expect(submitButton).toBeDisabled();

    await contentEditor.click();
    await page.keyboard.type(homeworkContent);

    await expect(submitButton).toBeEnabled();
  });

  test('과제 정보를 모두 입력한 후 과제를 생성하고 확인할 수 있다', async ({
    page,
  }) => {
    const { homeworkId, homeworkTitle, studyRoomId } =
      await createHomeworkAsTeacher(page);

    await page.goto(`/study-rooms/${studyRoomId}/homework/${homeworkId}`);

    await expect(page).toHaveURL(
      new RegExp(`/study-rooms/${studyRoomId}/homework/\\d+$`)
    );

    const homeworkTitleHeading = page
      .getByRole('heading')
      .filter({ hasText: homeworkTitle });

    await expect(homeworkTitleHeading).toBeVisible({ timeout: 10000 });
  });
});

// student account
test.describe('과제 - 학생', () => {
  test.setTimeout(60000);

  test('과제 URL 직접 접근 시 수업노트로 이동한다', async ({ page }) => {
    await loginAsStudent(page);

    const studyRoomId = await findJoinedStudyRoomId(page);

    await page.goto(`/study-rooms/${studyRoomId}/homework`);
    await page.waitForURL(`/study-rooms/${studyRoomId}/note`);
    await expect(page).toHaveURL(`/study-rooms/${studyRoomId}/note`);
  });
});
