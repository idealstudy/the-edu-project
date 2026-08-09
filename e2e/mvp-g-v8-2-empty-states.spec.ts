import fs from 'node:fs';
import path from 'node:path';

import { type Page, expect, test } from '@playwright/test';

import { skipWithoutEnv } from './helpers/env-guard';

/*
 * qa-report-v8-A 가 미검증으로 남긴 빈 상태 9건(E2·E3·E4·E5·E6·E7·E15·E17·E22)을 실제 dev 에서 닫는다.
 * 전부 전용 상태 계정이 필요하다. 계정 값은 .local-secrets 에만 있고 이 파일은 변수 이름만 안다.
 * 계정을 공유해 로그인하므로 반드시 --workers=1 로 돌린다(회원당 refresh token 1개).
 */

skipWithoutEnv([
  'E2E_STUDENT_NOASSIGN_EMAIL',
  'E2E_STUDENT_NOASSIGN_PASSWORD',
  'E2E_STUDENT_NOWRONG_EMAIL',
  'E2E_STUDENT_NONOTE_EMAIL',
  'E2E_STUDENT_NORESULT_EMAIL',
  'E2E_TEACHER_EMPTY_EMAIL',
  'E2E_TEACHER_NONREP_EMAIL',
  'E2E_ADMIN_EMAIL',
]);

const SHOT_DIR = path.resolve(
  __dirname,
  '../../docs/mvp-g/qa-screens-v8-2'
);

const shot = async (page: Page, name: string) => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  await page.screenshot({
    path: path.join(SHOT_DIR, `${name}.png`),
    fullPage: true,
  });
};

const need = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} 이(가) 없습니다.`);
  return value;
};

const login = async (page: Page, emailVar: string, passwordVar: string) => {
  await page.goto('/login');
  await page.getByTestId('login-email-input').fill(need(emailVar));
  await page.getByTestId('login-password-input').fill(need(passwordVar));
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 30_000,
  });
};

const openStudentHome = async (page: Page) => {
  await page.goto('/dashboard/student');
  await expect(page.getByTestId('student-agenda-flow-card')).toBeVisible({
    timeout: 30_000,
  });
};

test.describe.configure({ mode: 'serial' });

test.describe('MVP-G v8-2 빈 상태 전수', () => {
  test('E2: 배정 시험 0 학생 홈은 응시장 버튼을 유지하고 배지를 띄우지 않는다', async ({
    page,
  }) => {
    await login(page, 'E2E_STUDENT_NOASSIGN_EMAIL', 'E2E_STUDENT_NOASSIGN_PASSWORD');
    await openStudentHome(page);

    const examHall = page.getByTestId('expected-grade-card');
    await expect(examHall).toBeVisible();
    // 응시장으로 가는 길은 배정이 0이어도 남아 있어야 한다.
    await expect(
      examHall.locator('a[href="/dashboard/student/exam-hall"]').first()
    ).toBeVisible();
    // 배정 0인데 "이어 풀기"(진행 중 시험 배지)가 뜨면 안 된다.
    await expect(page.getByRole('heading', { name: '이어 풀기' })).toHaveCount(0);
    await shot(page, 'e2-noassign-home');
  });

  test('E3: 스터디룸 0 학생 홈은 소속 구획 없이 선생님 연결 길을 보여준다', async ({
    page,
  }) => {
    await login(page, 'E2E_STUDENT_NOASSIGN_EMAIL', 'E2E_STUDENT_NOASSIGN_PASSWORD');
    const rooms = await page.request.get('/api/v1/student/study-rooms');
    const body = await rooms.json().catch(() => null);
    const roomList = body?.data ?? body;
    await openStudentHome(page);
    await shot(page, 'e3-noroom-home');

    expect(rooms.ok()).toBe(true);
    // 이 계정은 소속 0 전용이다. 조건부로 넘기면 검사가 헛돈다.
    expect(Array.isArray(roomList)).toBe(true);
    expect(roomList).toHaveLength(0);
    // 소속이 0이므로 스터디룸 상세로 가는 구획이 홈에 없어야 한다.
    await expect(page.locator('a[href^="/study-rooms/"]')).toHaveCount(0);
    // 홈 자체는 죽지 않고 다음 행동(오늘 할 일과 회고)이 살아 있어야 한다.
    await expect(page.getByTestId('student-agenda-flow-card')).toBeVisible();
  });

  test('E4: 오답 0 학생의 오늘의 문제는 빈 화면 없이 추천을 채운다', async ({
    page,
  }) => {
    await login(page, 'E2E_STUDENT_NOWRONG_EMAIL', 'E2E_STUDENT_NOWRONG_PASSWORD');
    await openStudentHome(page);
    const section = page.getByTestId('daily-problems-section');
    const empty = page.getByTestId('daily-problems-empty');
    const error = page.getByTestId('daily-problems-error');
    await expect(section.or(empty).or(error).first()).toBeVisible({
      timeout: 30_000,
    });
    await shot(page, 'e4-nowrong-today-problems');

    await expect(error).toHaveCount(0);
    await expect(section).toBeVisible();
    await expect(page.getByTestId('daily-problem-card-1')).toBeVisible();
  });

  test('E5: 정리 과목 0 학생의 단권화는 과목 행과 시작 길을 유지한다', async ({
    page,
  }) => {
    await login(page, 'E2E_STUDENT_NONOTE_EMAIL', 'E2E_STUDENT_NONOTE_PASSWORD');
    await openStudentHome(page);
    const card = page.getByTestId('unit-note-entry-card');
    await expect(card).toBeVisible({ timeout: 30_000 });
    await shot(page, 'e5-nonote-unit-note-card');

    // 과목 행이 남아 있고(빈 화면 아님) 게이지는 0, 단권화로 들어가는 길이 있다.
    const gauges = card.locator('[role="img"][aria-label*="퍼센트"]');
    expect(await gauges.count()).toBeGreaterThan(0);
    for (const label of await gauges.evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('aria-label') ?? '')
    )) {
      expect(label).toContain('정리 0퍼센트');
    }
    await expect(card.getByRole('link', { name: /단권화 열기/ })).toBeVisible();

    await page.goto('/dashboard/student/unit-notes');
    await page.waitForLoadState('networkidle');
    await shot(page, 'e5-nonote-unit-notes-page');
    // 정리 0이어도 죽은 화면이 아니라 쓰기 시작하는 길이 있어야 한다.
    await expect(page.getByText(/펜으로 시작|이어서 정리하기|열기/).first()).toBeVisible({
      timeout: 20_000,
    });
  });

  test('E6: 회고 미작성일에도 홈은 재촉 문구를 띄우지 않는다', async ({
    page,
  }) => {
    await login(page, 'E2E_STUDENT_NORESULT_EMAIL', 'E2E_STUDENT_NORESULT_PASSWORD');
    await openStudentHome(page);
    const agenda = page.getByTestId('student-agenda-flow-card');
    await shot(page, 'e6-noretro-home');

    const text = (await agenda.innerText()).replace(/\s+/g, ' ');
    // 재촉·질책 어휘가 없어야 한다.
    for (const nag of ['아직도', '빨리', '밀렸', '지키지 않', '경고']) {
      expect(text).not.toContain(nag);
    }
  });

  test('E7: 기록 0 학생의 돌아보기는 코치 문장을 지어내지 않는다', async ({
    page,
  }) => {
    await login(page, 'E2E_STUDENT_NORESULT_EMAIL', 'E2E_STUDENT_NORESULT_PASSWORD');
    await page.goto('/dashboard/student/look-back');
    await page.waitForLoadState('networkidle');
    await shot(page, 'e7-norecord-look-back');

    const body = (await page.locator('main, body').first().innerText()).replace(
      /\s+/g,
      ' '
    );
    expect(body.length).toBeGreaterThan(0);
    // 500·빈 페이지가 아니어야 한다.
    expect(body).not.toContain('문제가 발생');
    // 기록이 없으면 없다고 말해야 한다. 없는 기록으로 코치 문장을 지어내면 안 된다.
    expect(body).toContain('아직 돌아볼 기록이 없어요');
    expect(body).toContain('지어내서');
  });

  test('E15: 수업 0 선생님 대시보드는 첫 스터디룸과 초대 코드 두 행동을 준다', async ({
    page,
  }) => {
    await login(page, 'E2E_TEACHER_EMPTY_EMAIL', 'E2E_TEACHER_EMPTY_PASSWORD');
    await page.goto('/dashboard/teacher');
    const empty = page.getByTestId('teacher-rooms-empty');
    const list = page.getByTestId('teacher-rooms-list');
    await expect(empty.or(list).first()).toBeVisible({ timeout: 30_000 });
    await shot(page, 'e15-teacher-empty-dashboard');

    await expect(empty).toBeVisible();
    await expect(empty.getByRole('link', { name: '첫 스터디룸 만들기' })).toBeVisible();
    await expect(
      empty.getByRole('link', { name: '학생 초대 코드 보기' })
    ).toBeVisible();
  });

  test('E17: 대표가 아닌 선생님도 시험 과목을 고를 수 있고 수학에 고정되지 않는다', async ({
    page,
  }) => {
    await login(page, 'E2E_TEACHER_NONREP_EMAIL', 'E2E_TEACHER_NONREP_PASSWORD');
    await page.goto('/dashboard/teacher/exams');
    await page.waitForLoadState('networkidle');
    const filter = page.getByTestId('exam-subject-filter');
    await expect(filter).toBeVisible({ timeout: 30_000 });
    await shot(page, 'e17-nonrep-exam-subject');

    await expect(filter).toBeEnabled();
    // 라딕스 Select 는 포인터 이벤트로 열린다. 클릭이 먹지 않으면 키보드로 연다.
    await filter.click();
    const options = page.getByRole('option');
    if ((await options.count()) === 0) {
      await filter.focus();
      await page.keyboard.press('Enter');
    }
    await expect(options.first()).toBeVisible({ timeout: 10_000 });
    // 펼친 목록은 포털이라 전체 페이지 캡처(스크롤)로 닫힌다. 값을 먼저 읽고 캡처한다.
    const labels = await options.allInnerTexts();
    await page.screenshot({
      path: path.join(SHOT_DIR, 'e17-nonrep-exam-subject-open.png'),
    });
    // 과목 목록이 열리고 수학 말고 다른 선택지가 실제로 있어야 한다.
    expect(labels.length).toBeGreaterThan(1);

    // 실제로 다른 과목으로 바꿀 수 있어야 한다(수학 고정 아님).
    const other = options.filter({ hasNotText: '수학' }).first();
    const otherLabel = (await other.innerText()).trim();
    await other.click();
    await expect(filter).toContainText(otherLabel);
    await shot(page, 'e17-nonrep-exam-subject-changed');
  });

  test('E22: 관리자 요약의 회원 수는 QA 계정을 빼고 센다', async ({ page }) => {
    await login(page, 'E2E_ADMIN_EMAIL', 'E2E_ADMIN_PASSWORD');
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    await shot(page, 'e22-admin-summary');

    const summaryResponse = await page.request.get('/api/v1/admin/summary');
    expect(summaryResponse.ok()).toBe(true);
    const summary = (await summaryResponse.json())?.data;
    expect(typeof summary?.totalMemberCount).toBe('number');

    // 회원 목록은 기본이 학생 역할 + QA 제외다. QA 포함/제외 총계를 맞대 QA 제외가 실제로 도는지 본다.
    const totalOf = async (includeQa: boolean): Promise<number> => {
      const response = await page.request.get(
        `/api/v1/admin/members?role=STUDENT&page=0&size=1&includeQaAccount=${includeQa}`
      );
      expect(response.ok()).toBe(true);
      const data = (await response.json())?.data;
      return data?.totalElements ?? data?.page?.totalElements ?? -1;
    };
    const withoutQa = await totalOf(false);
    const withQa = await totalOf(true);

    // eslint-disable-next-line no-console
    console.log(
      `E22 요약 회원수=${summary.totalMemberCount} / 학생 QA제외=${withoutQa} / 학생 QA포함=${withQa}`
    );
    expect(withoutQa).toBeGreaterThan(0);
    // QA 계정이 존재하고, 기본 집계에서 빠져 있어야 한다.
    expect(withQa).toBeGreaterThan(withoutQa);

    // QA 계정 하나를 실제로 지목해 QA 표시가 붙어 있는지 확인한다.
    const qaEmail = need('E2E_STUDENT_NOASSIGN_EMAIL');
    const qaLookup = await page.request.get(
      `/api/v1/admin/members?role=STUDENT&includeQaAccount=true&keyword=${encodeURIComponent(qaEmail)}&page=0&size=5`
    );
    expect(qaLookup.ok()).toBe(true);
    const qaItems = (await qaLookup.json())?.data?.content ?? [];
    expect(qaItems.length).toBeGreaterThan(0);
    expect(qaItems[0]?.isQaAccount).toBe(true);
  });
});
