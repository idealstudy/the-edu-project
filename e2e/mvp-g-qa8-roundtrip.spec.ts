import { type Page, expect, test } from '@playwright/test';
import path from 'node:path';

import { skipWithoutEnv } from './helpers/env-guard';

// 관리자 계정이 없으면 이 스펙만 skip 된다(나머지 스위트는 정상 실행).
skipWithoutEnv(['E2E_ADMIN_EMAIL', 'E2E_ADMIN_PASSWORD']);

const baseURL = process.env.E2E_BASE_URL ?? 'https://dev.d-edu.site';
const adminEmail = process.env.E2E_ADMIN_EMAIL;
const adminPassword = process.env.E2E_ADMIN_PASSWORD;
const screenDir = path.resolve(process.cwd(), '../docs/mvp-g/qa-screens');

const requireValue = (value: string | undefined, name: string) => {
  if (!value) throw new Error(`Missing ${name}`);
  return value;
};

const login = async (page: Page, email: string, password: string) => {
  await page.goto(`${baseURL}/login`);
  await page.getByTestId('login-email-input').fill(email);
  await page.getByTestId('login-password-input').fill(password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'));
};

const impersonateStudent = async (page: Page, email: string) => {
  await login(
    page,
    requireValue(adminEmail, 'E2E_ADMIN_EMAIL'),
    requireValue(adminPassword, 'E2E_ADMIN_PASSWORD')
  );
  const memberResponse = await page.request.get(
    `${baseURL}/api/v1/admin/members?role=STUDENT&keyword=${encodeURIComponent(email)}&includeQaAccount=true&page=0&size=20`
  );
  expect(memberResponse.status()).toBe(200);
  const member = (await memberResponse.json()).data.content.find(
    (item: { email: string }) => item.email === email
  );
  expect(member).toBeTruthy();
  const impersonation = await page.request.post(
    `${baseURL}/api/v1/admin/auth/impersonate/${member.memberId}`
  );
  expect(impersonation.status()).toBe(200);
};

const screenshot = async (page: Page, name: string) => {
  await page.screenshot({
    path: path.join(screenDir, name),
    fullPage: true,
  });
};

const findPublicChallenge = async (page: Page, sourceText: string) => {
  for (let pageNumber = 0; pageNumber < 10; pageNumber += 1) {
    const response = await page.request.get(
      `${baseURL}/api/v1/public/challenges?sort=LATEST&page=${pageNumber}&size=30`
    );
    expect(response.status()).toBe(200);
    const body = await response.json();
    const challenge = body.data.content.find(
      (item: { sourceText: string }) => item.sourceText === sourceText
    );
    if (challenge) return challenge as { challengeId: number };
    if (body.data.last) break;
  }
  return undefined;
};

test.describe('MVP-G QA8 화면 왕복 5건', () => {
  test('R1-T9 단권화와 내 학습 지도에 같은 단원 숙련도가 표시된다', async ({
    page,
  }) => {
    await impersonateStudent(page, 'qa-tc35-pdf-unit@d-edu.site');
    const noteResponse = await page.request.get(
      `${baseURL}/api/v1/student/unit-notes`
    );
    const treeResponse = await page.request.get(
      `${baseURL}/api/v1/common/tree`
    );
    expect(noteResponse.status()).toBe(200);
    expect(treeResponse.status()).toBe(200);
    const noteNodes = (await noteResponse.json()).data.nodes as Array<{
      nodeId: number;
      masteryScore: number;
    }>;
    const treeNodes = (await treeResponse.json()).data.nodes as Array<{
      nodeId: number;
      masteryScore: number;
    }>;
    const shared = noteNodes.find((noteNode) =>
      treeNodes.some(
        (treeNode) =>
          treeNode.nodeId === noteNode.nodeId &&
          treeNode.masteryScore === noteNode.masteryScore
      )
    );
    expect(shared).toBeTruthy();

    await page.goto(`${baseURL}/dashboard/student/unit-notes`);
    await expect(
      page.getByText('단권화 노트', { exact: true }).first()
    ).toBeVisible();
    await screenshot(page, 'qa8-r1-t9-unit-notes.png');
    await page.goto(`${baseURL}/dashboard/student/results`);
    await expect(page.getByTestId('learning-map')).toBeVisible();
    await screenshot(page, 'qa8-r1-t9-learning-map.png');
  });

  test('R2-U9 관리자 화면에서 초대 가입 선생님의 가입 정보와 상세를 왕복한다', async ({
    page,
  }) => {
    await login(
      page,
      requireValue(adminEmail, 'E2E_ADMIN_EMAIL'),
      requireValue(adminPassword, 'E2E_ADMIN_PASSWORD')
    );
    const teacherResponse = await page.request.get(
      `${baseURL}/api/v1/admin/members?role=TEACHER&includeQaAccount=false&page=0&size=100`
    );
    expect(teacherResponse.status()).toBe(200);
    const invitedTeacher = (
      (await teacherResponse.json()).data.content as Array<{
        email: string;
        signupPath: string | null;
      }>
    ).find((member) => member.signupPath === 'TEACHER_INVITE');
    expect(invitedTeacher).toBeTruthy();

    await page.goto(`${baseURL}/admin/members`);
    await page.getByTestId('member-tab-teacher').click();
    const search = page.getByPlaceholder('이름 또는 이메일로 검색');
    await search.fill(invitedTeacher!.email);
    await search.press('Enter');
    const row = page
      .getByRole('row')
      .filter({ hasText: invitedTeacher!.email });
    await expect(row).toBeVisible();
    await expect(
      page.getByRole('columnheader', { name: '가입 시각' })
    ).toBeVisible();
    await screenshot(page, 'qa8-r2-u9-admin-member-list.png');
    await row.getByRole('link', { name: '상세' }).click();
    await expect(page.getByTestId('admin-member-detail')).toBeVisible();
    await expect(page.getByText(/가입 경로/).first()).toBeVisible();
    await screenshot(page, 'qa8-r2-u9-admin-member-detail.png');
  });

  test('E9 교사 노트는 학생 화면에 삭제 동작이 없고 API도 403이다', async ({
    page,
  }) => {
    await impersonateStudent(page, 'qa-tc35-note@d-edu.site');
    const libraryResponse = await page.request.get(
      `${baseURL}/api/v1/student/unit-notes`
    );
    const library = (await libraryResponse.json()).data;
    let teacherPage: { nodeId: number; pageId: number } | null = null;
    for (const node of library.nodes as Array<{ nodeId: number }>) {
      const detailResponse = await page.request.get(
        `${baseURL}/api/v1/student/unit-notes?nodeId=${node.nodeId}`
      );
      const detail = (await detailResponse.json()).data.detail;
      const pageItem = detail?.pages?.find(
        (item: { source: string }) => item.source === 'TEACHER'
      );
      if (pageItem) {
        teacherPage = { nodeId: node.nodeId, pageId: pageItem.pageId };
        break;
      }
    }
    expect(teacherPage).toBeTruthy();
    await page.goto(
      `${baseURL}/dashboard/student/unit-notes/${teacherPage!.nodeId}`
    );
    const pageCard = page.getByTestId(`unit-note-page-${teacherPage!.pageId}`);
    await expect(pageCard).toBeVisible();
    await expect(pageCard.getByRole('button', { name: /삭제/ })).toHaveCount(0);
    await screenshot(page, 'qa8-e9-teacher-note-no-delete.png');

    const deleted = await page.request.delete(
      `${baseURL}/api/v1/student/unit-notes/${teacherPage!.nodeId}/pages/${teacherPage!.pageId}`
    );
    expect(deleted.status()).toBe(403);
  });

  test('E11 미완료 오픈챌린지에 재진입하면 같은 문항이 열린다', async ({
    page,
  }) => {
    await impersonateStudent(page, 'qa-tc35-challenge@d-edu.site');
    const challenge = await findPublicChallenge(page, 'QA TC35 OPEN');
    expect(challenge).toBeTruthy();
    if (!challenge) throw new Error('QA TC35 OPEN fixture가 없습니다.');
    await page.goto(`${baseURL}/open-challenge/${challenge.challengeId}`);
    await expect(page.getByText('1+1의 값은?')).toBeVisible();
    await screenshot(page, 'qa8-e11-resumed-challenge.png');
  });

  test('RG7 공개 문제를 제출하고 결과를 본 뒤 문제 화면으로 복귀한다', async ({
    page,
  }) => {
    await impersonateStudent(page, 'qa-tc35-challenge@d-edu.site');
    const challenge = await findPublicChallenge(page, 'QA TC35 OPEN');
    expect(challenge).toBeTruthy();
    if (!challenge) throw new Error('QA TC35 OPEN fixture가 없습니다.');
    await page.goto(`${baseURL}/open-challenge/${challenge.challengeId}`);
    await page.getByTestId('choice-option-1').click();
    await page.getByTestId('challenge-submit-button').click();
    await page.waitForURL(
      new RegExp(`/open-challenge/${challenge.challengeId}/result`)
    );
    await expect(page.getByText('1+1의 값은?')).toBeVisible();
    await screenshot(page, 'qa8-rg7-result.png');
    await page.getByRole('button', { name: '이전으로' }).click();
    await page.waitForURL(
      new RegExp(`/open-challenge/${challenge.challengeId}$`)
    );
    await expect(page.getByText('1+1의 값은?')).toBeVisible();
    await screenshot(page, 'qa8-rg7-return.png');
  });
});
