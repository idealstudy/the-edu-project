// MVP-G QA 5차 최근 복구 행동의 dev 실브라우저 검증기.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const WEB_BASE = process.env.E2E_BASE_URL ?? 'https://dev.d-edu.site';
const SCREEN_DIR = path.resolve(process.cwd(), '../docs/mvp-g/qa-screens');
const OUTPUT = '/tmp/mvpg-v50-critical-actions.json';

const credentials = {
  STUDENT: required('E2E_STUDENT_EMAIL', 'E2E_STUDENT_PASSWORD'),
  TEACHER: required('E2E_TEACHER_EMAIL', 'E2E_TEACHER_PASSWORD'),
};

function required(emailName, passwordName) {
  const email = process.env[emailName];
  const password = process.env[passwordName];
  if (!email || !password) throw new Error(`Missing ${emailName}`);
  return { email, password };
}

async function settle(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
}

async function login(page, role) {
  await page.goto(`${WEB_BASE}/login`);
  await page.getByTestId('login-email-input').fill(credentials[role].email);
  await page.getByTestId('login-password-input').fill(credentials[role].password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), { timeout: 20000 });
  await settle(page);
}

async function jsonData(page, endpoint) {
  const response = await page.request.get(`${WEB_BASE}${endpoint}`);
  const body = await response.json();
  return { status: response.status(), data: body.data ?? body };
}

async function postData(page, endpoint, data) {
  const response = await page.request.post(`${WEB_BASE}${endpoint}`, { data });
  const body = await response.json().catch(() => null);
  return { status: response.status(), data: body?.data ?? body };
}

async function verifyLearningLinks(page, roomId) {
  const labels = ['＋ 개념 노트', '＋ 할 일', '＋ 피드백', '새 노트 쓰기', '할 일 쓰기', '코멘트 쓰기', '시험 열기'];
  const rows = [];
  for (const label of labels) {
    await page.goto(`${WEB_BASE}/study-rooms/${roomId}/manage`);
    await settle(page);
    const link = page.locator('a').filter({ hasText: label }).first();
    const count = await link.count();
    if (count !== 1) {
      rows.push({ label, status: 'FAIL', observed: `link count ${count}` });
      continue;
    }
    const href = await link.getAttribute('href');
    if (!href) {
      rows.push({ label, status: 'FAIL', observed: 'href 없음' });
      continue;
    }
    await Promise.all([
      page.waitForURL((url) => `${url.pathname}${url.search}` === href, { timeout: 15000 }),
      link.click(),
    ]);
    await settle(page);
    const url = new URL(page.url());
    const authTextCount = await page.getByText(/401 인증 필요|인증이 필요|로그인이 필요/).count();
    rows.push({ label, status: authTextCount === 0 && !url.pathname.startsWith('/login') ? 'PASS' : 'FAIL', destination: `${url.pathname}${url.search}`, authTextCount });
  }
  await page.goto(`${WEB_BASE}/study-rooms/${roomId}/manage`);
  await settle(page);
  await page.screenshot({ path: path.join(SCREEN_DIR, 'critical-learning-management-7-links.png'), fullPage: false });
  return rows;
}

async function seedTeacherInbox(teacher, student, roomId) {
  const bank = await jsonData(teacher, '/api/v1/teacher/question-bank?subject=MATH&difficulty=MID&page=0&size=1');
  const item = bank.data?.content?.[0];
  if (!item?.challengeId) return { status: 'FAIL', reason: '문제은행 fixture 없음' };
  const title = `QA5-DIRECT-COMMENT-${Date.now()}`;
  const created = await postData(teacher, '/api/v1/teacher/exams', {
    title,
    subject: 'MATH',
    examType: 'NATIONAL',
    examTreeNodeIds: item.treeNodeId ? [item.treeNodeId] : [],
    questions: [{ questionNo: 1, challengeId: item.challengeId }],
  });
  if (created.status !== 200 || !created.data?.examId) return { status: 'FAIL', reason: `시험 생성 HTTP ${created.status}` };
  const assigned = await postData(teacher, `/api/v1/teacher/exams/${created.data.examId}/assignments`, {
    studyRoomId: roomId,
    excludedStudentIds: [],
    studentIds: [],
    periodStart: new Date().toISOString(),
    periodEnd: null,
  });
  if (assigned.status !== 200) return { status: 'FAIL', reason: `시험 배정 HTTP ${assigned.status}` };
  const hall = await jsonData(student, '/api/v1/student/exam-hall');
  const attempt = hall.data?.assigned?.find((row) => row.examId === created.data.examId);
  if (!attempt?.attemptId) return { status: 'FAIL', reason: '학생 attempt fixture 없음' };
  const submitted = await postData(student, `/api/v1/student/exams/${attempt.attemptId}/submit`, {
    answers: [{ questionNo: 1, selectedAnswer: '999', timeSpentSec: 1 }],
  });
  return { status: submitted.status === 200 ? 'PASS' : 'FAIL', examId: created.data.examId, attemptId: attempt.attemptId, submitStatus: submitted.status };
}

async function verifyTeacherDirectComment(page, studentPage) {
  const inboxResponse = await jsonData(page, '/api/v1/teacher/inbox');
  const inbox = inboxResponse.data ?? {};
  const apiItemCount = Number(inbox.recentExamCount ?? 0)
    + Number(inbox.neglectedCount ?? 0)
    + Number(inbox.stuckAfterGraduationCount ?? 0);
  const fresh = await page.context().newPage();
  await fresh.goto(`${WEB_BASE}/dashboard/teacher`);
  await settle(fresh);
  await fresh.getByTestId('teacher-learning-inbox').waitFor({ state: 'visible', timeout: 15000 }).catch(() => {});
  const direct = fresh.getByRole('button', { name: '직접 쓰기', exact: true }).first();
  if (!(await direct.count())) {
    await fresh.close();
    return apiItemCount > 0
      ? { status: 'FAIL', reason: `처리함 API ${apiItemCount}건이나 대시보드 직접 쓰기 DOM 0` }
      : { status: 'UNVERIFIED', reason: '처리함 오답 fixture 없음' };
  }
  const itemTestId = await direct
    .locator('xpath=ancestor::li[1]')
    .locator('[data-testid^="teacher-inbox-quick-comment-"]')
    .first()
    .getAttribute('data-testid');
  const wrongAnswerId = itemTestId?.replace('teacher-inbox-quick-comment-', '');
  await direct.click();
  const input = fresh.locator('input[placeholder="학생에게 남길 코멘트를 입력하세요"]').first();
  const comment = `QA5 직접 코멘트 ${Date.now()}`;
  await input.fill(comment);
  await input.locator('xpath=..').getByRole('button', { name: '저장', exact: true }).click();
  await fresh.getByText(`저장됨 · ${comment}`).waitFor({ state: 'visible', timeout: 15000 });
  await fresh.screenshot({ path: path.join(SCREEN_DIR, 'critical-teacher-direct-comment.png'), fullPage: false });
  await fresh.close();
  if (!wrongAnswerId) {
    return { status: 'FAIL', reason: '직접 쓰기 대상 오답 ID를 DOM에서 식별하지 못함' };
  }
  await studentPage.goto(`${WEB_BASE}/dashboard/student/wrong-answers`);
  await settle(studentPage);
  const card = studentPage.getByTestId(`wrong-answer-card-${wrongAnswerId}`);
  if (!(await card.isVisible().catch(() => false))) {
    return {
      status: 'FAIL',
      reason: `직접 쓰기 대상 오답 ${wrongAnswerId}가 현재 학생 목록에 없음`,
      wrongAnswerId,
    };
  }
  await studentPage.getByTestId(`wrong-answer-review-${wrongAnswerId}`).click();
  await studentPage.getByTestId('wrong-answer-teacher-comment').waitFor({ state: 'visible', timeout: 15000 });
  const studentCommentVisible = await studentPage.getByText(comment, { exact: true }).isVisible();
  await studentPage.screenshot({ path: path.join(SCREEN_DIR, 'critical-student-teacher-comment.png'), fullPage: false });
  return {
    status: studentCommentVisible ? 'PASS' : 'FAIL',
    observed: studentCommentVisible
      ? '직접 쓰기 저장 문자열이 같은 학생의 오답 상세에 표시'
      : '학생 오답 상세에 저장 문자열이 표시되지 않음',
    wrongAnswerId,
  };
}

async function verifyStudentTodo(page) {
  await page.goto(`${WEB_BASE}/dashboard/student`);
  await settle(page);
  const toggle = page.getByTestId('student-todo-add-toggle');
  if (!(await toggle.count())) return { status: 'FAIL', reason: '+ 추가 버튼 없음' };
  await toggle.click();
  const title = `QA5 직접 할 일 ${Date.now()}`;
  await page.getByRole('textbox', { name: '새 할 일' }).fill(title);
  await page.getByTestId('student-todo-add-form').getByRole('button', { name: '추가하기', exact: true }).click();
  await page.getByText(title, { exact: true }).waitFor({ state: 'visible', timeout: 15000 });
  await page.screenshot({ path: path.join(SCREEN_DIR, 'critical-student-todo-add.png'), fullPage: false });
  return { status: 'PASS', observed: '학생 입력 문자열이 오늘 할 일 목록에 표시' };
}

async function verifyLogout(page) {
  await page.goto(`${WEB_BASE}/dashboard/student`);
  await settle(page);
  const control = page.getByRole('button', { name: /로그아웃/ }).or(page.getByRole('link', { name: /로그아웃/ })).first();
  if (!(await control.count())) return { status: 'FAIL', reason: '로그아웃 컨트롤 없음' };
  await control.click();
  await page.waitForURL((url) => url.pathname === '/' || url.pathname.startsWith('/login'), { timeout: 15000 });
  await page.goto(`${WEB_BASE}/dashboard/student`);
  await page.waitForURL((url) => url.pathname.startsWith('/login'), { timeout: 15000 });
  return { status: 'PASS', observed: '로그아웃 뒤 보호 경로가 로그인으로 이동' };
}

async function main() {
  await mkdir(SCREEN_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const teacherContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
    const studentContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
    const teacher = await teacherContext.newPage();
    const student = await studentContext.newPage();
    await login(teacher, 'TEACHER');
    await login(student, 'STUDENT');
    const rooms = await jsonData(teacher, '/api/v1/teacher/dashboard/study-rooms');
    const roomId = Array.isArray(rooms.data) ? rooms.data[0]?.id : null;
    if (!roomId) throw new Error('Teacher room fixture missing');
    const learningLinks = await verifyLearningLinks(teacher, roomId);
    const inboxFixture = await seedTeacherInbox(teacher, student, roomId);
    const directComment = await verifyTeacherDirectComment(teacher, student);
    const studentTodo = await verifyStudentTodo(student);
    const logout = await verifyLogout(student);
    const result = { generatedAt: new Date().toISOString(), roomId, learningLinks, inboxFixture, directComment, studentTodo, logout };
    await writeFile(OUTPUT, `${JSON.stringify(result, null, 2)}\n`, { mode: 0o600 });
    const failCount = learningLinks.filter((row) => row.status !== 'PASS').length + (directComment.status !== 'PASS' ? 1 : 0) + (studentTodo.status !== 'PASS' ? 1 : 0) + (logout.status !== 'PASS' ? 1 : 0);
    console.log(JSON.stringify({ output: OUTPUT, linkPass: learningLinks.filter((row) => row.status === 'PASS').length, directComment: directComment.status, studentTodo: studentTodo.status, logout: logout.status, failCount }));
    if (failCount > 0) process.exitCode = 1;
    await teacherContext.close();
    await studentContext.close();
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ fatal: String(error?.message ?? error).split('\n')[0].slice(0, 400) }));
  process.exitCode = 1;
});
