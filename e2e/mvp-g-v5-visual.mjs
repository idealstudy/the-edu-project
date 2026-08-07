// MVP-G QA 6차 시각 증거 수집기. 정상 상태는 dev 실계정으로 관찰하고,
// 오류 전용 화면만 네트워크 실패를 주입해 복구 UI를 검증한다.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const WEB_BASE = process.env.E2E_BASE_URL ?? 'https://dev.d-edu.site';
const SCREEN_DIR = path.resolve(process.cwd(), '../docs/mvp-g/qa-screens-v6');
const OUTPUT =
  process.env.MVPG_V5_VISUAL_EVIDENCE ?? '/tmp/mvpg-v60-visual.json';

const credentials = {
  STUDENT: required('E2E_STUDENT_EMAIL', 'E2E_STUDENT_PASSWORD'),
  STUDENT2: required('E2E_STUDENT2_EMAIL', 'E2E_STUDENT2_PASSWORD'),
  STUDENT_NORESULT: required(
    'E2E_STUDENT_NORESULT_EMAIL',
    'E2E_STUDENT_NORESULT_PASSWORD'
  ),
  STUDENT_NONOTE: required(
    'E2E_STUDENT_NONOTE_EMAIL',
    'E2E_STUDENT_NONOTE_PASSWORD'
  ),
  STUDENT_NOWRONG: required(
    'E2E_STUDENT_NOWRONG_EMAIL',
    'E2E_STUDENT_NOWRONG_PASSWORD'
  ),
  TEACHER: required('E2E_TEACHER_EMAIL', 'E2E_TEACHER_PASSWORD'),
  TEACHER_EMPTY: required(
    'E2E_TEACHER_EMPTY_EMAIL',
    'E2E_TEACHER_EMPTY_PASSWORD'
  ),
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
  await page
    .locator('body')
    .evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve))
        )
    );
}

async function login(page, role) {
  await page.goto(`${WEB_BASE}/login`);
  await page.getByTestId('login-email-input').fill(credentials[role].email);
  await page
    .getByTestId('login-password-input')
    .fill(credentials[role].password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 20000,
  });
  await settle(page);
}

async function capture(page, name, note, action) {
  let actionError = null;
  try {
    await action();
    await settle(page);
  } catch (error) {
    actionError = String(error?.message ?? error)
      .split('\n')[0]
      .slice(0, 300);
  }
  const file = `${name}-1024x768.png`;
  await page.screenshot({ path: path.join(SCREEN_DIR, file), fullPage: false });
  const authTextCount = await page
    .getByText(/401 인증 필요|인증이 필요|로그인이 필요/)
    .count();
  return { name, file, note, url: page.url(), authTextCount, actionError };
}

async function apiData(page, endpoint) {
  const response = await page.request.get(`${WEB_BASE}${endpoint}`);
  const body = await response.json().catch(() => null);
  return { status: response.status(), data: body?.data ?? body };
}

async function postApi(page, endpoint, data) {
  const response = await page.request.post(`${WEB_BASE}${endpoint}`, { data });
  const body = await response.json().catch(() => null);
  return { status: response.status(), data: body?.data ?? body };
}

async function seedScanExam(teacher, roomId) {
  const runId = `QA5-SCAN-${Date.now()}`;
  const presigned = await postApi(
    teacher,
    '/api/v1/common/media/presign-batch',
    {
      mediaAssetList: [
        {
          fileName: `${runId}.pdf`,
          contentType: 'application/pdf',
          sizeBytes: 8,
          targetType: 'EXAM_PDF',
        },
      ],
    }
  );
  const asset = presigned.data?.mediaAssetList?.[0];
  if (!asset?.uploadUrl || !asset?.mediaId)
    return { status: 'FAIL', reason: `presign HTTP ${presigned.status}` };
  const upload = await teacher.request.put(asset.uploadUrl, {
    headers: { ...(asset.headers ?? {}), 'Content-Type': 'application/pdf' },
    data: Buffer.from('%PDF-QA5'),
  });
  if (upload.status() !== 200)
    return { status: 'FAIL', reason: `upload HTTP ${upload.status()}` };
  const created = await postApi(teacher, '/api/v1/teacher/exams', {
    title: runId,
    sourcePdfMediaId: asset.mediaId,
    subject: 'MATH',
    examType: 'SCHOOL',
    examTreeNodeIds: [],
    questions: [
      {
        questionNo: 1,
        correctAnswer: '1',
        prompt: 'QA5 올린 시험지 시각 검증',
      },
    ],
  });
  if (created.status !== 200 || !created.data?.examId)
    return { status: 'FAIL', reason: `create HTTP ${created.status}` };
  const assigned = await postApi(
    teacher,
    `/api/v1/teacher/exams/${created.data.examId}/assignments`,
    {
      studyRoomId: roomId,
      excludedStudentIds: [],
      studentIds: [],
      periodStart: new Date().toISOString(),
      periodEnd: null,
    }
  );
  return {
    status: assigned.status === 200 ? 'PASS' : 'FAIL',
    examId: created.data.examId,
    title: runId,
    assignStatus: assigned.status,
  };
}

async function prototypeCaptures(browser) {
  const page = await browser.newPage({
    viewport: { width: 1024, height: 768 },
  });
  const prototypePath = path.resolve(
    process.cwd(),
    '../prototypes/mvp-g-3역할-hub-opus.html'
  );
  await page.goto(pathToFileURL(prototypePath).href);
  const rows = [
    ['student', 's-learn', 'ok', 's-learn-ok'],
    ['student', 's-learn', 'empty', 's-learn-empty'],
    ['student', 's-learn', 'error', 's-learn-error'],
    ['student', 's-guard', 'v1', 's-guard-v1'],
    ['student', 's-guard', 'v2', 's-guard-v2'],
    ['student', 's-guard', 'v3', 's-guard-v3'],
    ['student', 's-note', 'subject', 's-note-subject'],
    ['student', 's-note', 'units', 's-note-units'],
    ['student', 's-note', 'pen', 's-note-pen'],
    ['student', 's-note', 'snip', 's-note-snip'],
    ['student', 's-note', 'upload', 's-note-upload'],
    ['student', 's-note', 'blank', 's-note-blank'],
    ['student', 's-note', 'error', 's-note-error'],
    ['student', 's-look', 'week', 's-look-week'],
    ['student', 's-look', 'month', 's-look-month'],
    ['student', 's-look', 'empty', 's-look-empty'],
    ['student', 's-result', 'ok', 's-result-ok'],
    ['student', 's-result', 'empty', 's-result-empty'],
    ['student', 's-review', 'ok', 's-review-ok'],
    ['student', 's-review', 'empty', 's-review-empty'],
    ['teacher', 't-rooms', 'ok', 't-rooms-ok'],
    ['teacher', 't-rooms', 'empty', 't-rooms-empty'],
    ['teacher', 't-room', 'note', 't-room-note'],
    ['teacher', 't-room', 'member', 't-room-member'],
    ['teacher', 't-room', 'manage', 't-room-manage'],
    ['teacher', 't-my', 'ok', 't-my-ok'],
    ['student', 's-take', 'scan', 's-take-scan'],
    ['student', 's-grade', '3form', 's-grade-3form'],
  ];
  const evidence = [];
  for (const [role, screen, screenState, id] of rows) {
    await page.locator(`[data-role="${role}"]`).click();
    await page.locator(`[data-screen="${screen}"]`).click();
    await page.evaluate((value) => {
      state.st = value;
      render();
    }, screenState);
    await settle(page);
    const file = `prototype-${id}-1024x768.png`;
    await page.screenshot({
      path: path.join(SCREEN_DIR, file),
      fullPage: false,
    });
    evidence.push({ id, file, role, screen, screenState });
  }
  await page.close();
  return evidence;
}

async function actualCaptures(browser) {
  const contexts = {};
  const pages = {};
  for (const role of [
    'STUDENT',
    'STUDENT2',
    'STUDENT_NORESULT',
    'STUDENT_NONOTE',
    'STUDENT_NOWRONG',
    'TEACHER',
    'TEACHER_EMPTY',
  ]) {
    contexts[role] = await browser.newContext({
      viewport: { width: 1024, height: 768 },
    });
    pages[role] = await contexts[role].newPage();
    await login(pages[role], role);
  }
  const student = pages.STUDENT;
  const student2 = pages.STUDENT2;
  const studentNoResult = pages.STUDENT_NORESULT;
  const studentNoNote = pages.STUDENT_NONOTE;
  const studentNoWrong = pages.STUDENT_NOWRONG;
  const teacher = pages.TEACHER;
  const teacherEmpty = pages.TEACHER_EMPTY;
  const rows = [];
  const go = (page, route) => page.goto(`${WEB_BASE}${route}`);

  rows.push(
    await capture(student, 'actual-s-learn-ok', '학생1 정상 데이터', () =>
      go(student, '/dashboard/student')
    )
  );
  rows.push(
    await capture(
      student2,
      'actual-s-learn-empty',
      '학생2 데이터 상태, 비어 있음 여부는 화면으로 판정',
      () => go(student2, '/dashboard/student')
    )
  );
  rows.push(
    await capture(
      student,
      'actual-s-learn-error',
      '오류 주입 없이 로그인된 정상 dev, 오류 상태 미재현',
      () => go(student, '/dashboard/student')
    )
  );
  rows.push(
    await capture(
      student,
      'actual-s-guard-v1',
      '현재 학생 데이터의 단일 위치 상태',
      () => go(student, '/dashboard/student')
    )
  );
  rows.push(
    await capture(
      student2,
      'actual-s-guard-v2',
      '학생2 현재 데이터의 단일 위치 상태',
      () => go(student2, '/dashboard/student')
    )
  );
  rows.push(
    await capture(
      student2,
      'actual-s-guard-v3',
      '현재 데이터에 해당하는 한 상태만 노출',
      () => go(student2, '/dashboard/student')
    )
  );

  rows.push(
    await capture(student, 'actual-s-note-subject', '단권화 과목 화면', () =>
      go(student, '/dashboard/student/unit-notes')
    )
  );
  await go(student, '/dashboard/student/unit-notes');
  await settle(student);
  const firstUnitHref = await student
    .locator('a[href*="/dashboard/student/unit-notes/"]')
    .first()
    .getAttribute('href');
  const unitRoute = firstUnitHref ?? '/dashboard/student/unit-notes';
  rows.push(
    await capture(student, 'actual-s-note-units', '단권화 단원 화면', () =>
      go(student, unitRoute)
    )
  );
  rows.push(
    await capture(student, 'actual-s-note-pen', '단권화 펜 모드', async () => {
      await go(student, unitRoute);
      const openEditor = student.getByTestId('unit-note-open-pen');
      if (await openEditor.count()) await openEditor.click();
      const button = student.getByTestId('unit-note-mode-pen');
      if (await button.count()) await button.click();
    })
  );
  rows.push(
    await capture(
      student,
      'actual-s-note-snip',
      '선생님 판서 조각 UI, 데이터 없으면 빈 상태',
      async () => {
        await go(student, unitRoute);
        const openEditor = student.getByTestId('unit-note-open-pen');
        if (await openEditor.count()) await openEditor.click();
        const details = student.locator('details').first();
        if (await details.count()) await details.locator('summary').click();
      }
    )
  );
  rows.push(
    await capture(
      student,
      'actual-s-note-upload',
      '단권화 업로드 모드',
      async () => {
        await go(student, unitRoute);
        const openEditor = student.getByTestId('unit-note-open-upload');
        if (await openEditor.count()) await openEditor.click();
        const button = student.getByTestId('unit-note-mode-upload');
        if (await button.count()) await button.click();
      }
    )
  );
  await go(studentNoNote, '/dashboard/student/unit-notes');
  await settle(studentNoNote);
  const student2UnitHref = await studentNoNote
    .locator('a[href*="/dashboard/student/unit-notes/"]')
    .first()
    .getAttribute('href');
  rows.push(
    await capture(
      studentNoNote,
      'actual-s-note-blank',
      '단권화 0 전용 fixture',
      async () => {
        await go(
          studentNoNote,
          student2UnitHref ?? '/dashboard/student/unit-notes'
        );
        const openEditor = studentNoNote.getByTestId('unit-note-open-pen');
        if (await openEditor.count()) await openEditor.click();
      }
    )
  );
  rows.push(
    await capture(
      student,
      'actual-s-note-error',
      '단권화 상세 API 실패를 주입해 잠긴 입력과 복구 행동을 관찰',
      async () => {
        const detailPattern = '**/student/unit-notes?nodeId=*';
        const failDetail = (route) =>
          route.fulfill({
            status: 500,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'QA injected unit note failure' }),
          });
        await student.route(detailPattern, failDetail);
        try {
          await go(student, unitRoute);
          await student
            .getByTestId('unit-note-detail-error')
            .waitFor({ state: 'visible', timeout: 15000 });
        } finally {
          await student.unroute(detailPattern, failDetail);
        }
      }
    )
  );

  rows.push(
    await capture(student, 'actual-s-look-week', '주간', () =>
      go(student, '/dashboard/student/look-back')
    )
  );
  rows.push(
    await capture(student, 'actual-s-look-month', '월간 탭 클릭', async () => {
      await go(student, '/dashboard/student/look-back');
      await student.getByRole('button', { name: '월간' }).click();
    })
  );
  rows.push(
    await capture(
      studentNoResult,
      'actual-s-look-empty',
      '신규 상태 전용 fixture',
      () => go(studentNoResult, '/dashboard/student/look-back')
    )
  );
  rows.push(
    await capture(student, 'actual-s-result-ok', '학생1 학습 지도', () =>
      go(student, '/dashboard/student/results')
    )
  );
  rows.push(
    await capture(
      studentNoResult,
      'actual-s-result-empty',
      '시험 결과 0 전용 fixture',
      () => go(studentNoResult, '/dashboard/student/results')
    )
  );

  rows.push(
    await capture(
      student,
      'actual-s-review-ok',
      '학생1 첫 오답 상세',
      async () => {
        await go(student, '/dashboard/student/wrong-answers');
        const review = student.getByText('다시 풀기', { exact: true }).first();
        const reviewReady = await review
          .waitFor({ state: 'visible', timeout: 15000 })
          .then(() => true)
          .catch(() => false);
        if (reviewReady) {
          await Promise.all([
            student.waitForURL(/\/dashboard\/student\/wrong-answers\/\d+$/, {
              timeout: 15000,
            }),
            review.click(),
          ]);
        }
      }
    )
  );
  rows.push(
    await capture(
      studentNoWrong,
      'actual-s-review-empty',
      '오답 0 전용 fixture',
      () => go(studentNoWrong, '/dashboard/student/wrong-answers')
    )
  );

  rows.push(
    await capture(teacher, 'actual-t-rooms-ok', '선생님 수업 목록', () =>
      go(teacher, '/dashboard/teacher')
    )
  );
  rows.push(
    await capture(
      teacherEmpty,
      'actual-t-rooms-empty',
      '수업 0 전용 fixture',
      () => go(teacherEmpty, '/dashboard/teacher')
    )
  );
  const roomResponse = await apiData(
    teacher,
    '/api/v1/teacher/dashboard/study-rooms'
  );
  const roomId = Array.isArray(roomResponse.data)
    ? roomResponse.data[0]?.id
    : null;
  const roomBase = roomId ? `/study-rooms/${roomId}` : '/dashboard/teacher';
  rows.push(
    await capture(teacher, 'actual-t-room-note', '수업노트 탭', () =>
      go(teacher, `${roomBase}/note`)
    )
  );
  rows.push(
    await capture(teacher, 'actual-t-room-member', '멤버 탭', () =>
      go(teacher, `${roomBase}/member`)
    )
  );
  rows.push(
    await capture(teacher, 'actual-t-room-manage', '학습 관리 탭', () =>
      go(teacher, `${roomBase}/manage`)
    )
  );
  rows.push(
    await capture(teacher, 'actual-t-my-ok', '선생님 마이페이지', () =>
      go(teacher, '/dashboard/teacher/my')
    )
  );

  const scanFixture = roomId
    ? await seedScanExam(teacher, roomId)
    : { status: 'FAIL', reason: 'room fixture 없음' };
  rows.push(
    await capture(
      student,
      'actual-s-take-scan',
      '미응시 시험이 있으면 응시 화면, 없으면 응시장',
      async () => {
        await go(student, '/dashboard/student/exam-hall');
        const take = student.getByText('응시하기', { exact: true }).first();
        const takeReady = await take
          .waitFor({ state: 'visible', timeout: 15000 })
          .then(() => true)
          .catch(() => false);
        if (takeReady) {
          await Promise.all([
            student.waitForURL(/\/dashboard\/student\/exams\/\d+$/, {
              timeout: 15000,
            }),
            take.click(),
          ]);
        }
      }
    )
  );
  rows.push(
    await capture(
      student,
      'actual-s-grade-3form',
      '실데이터에서 현재 해당하는 단일 등급 상태',
      () => go(student, '/dashboard/student')
    )
  );

  for (const context of Object.values(contexts)) await context.close();
  return {
    roomStatus: roomResponse.status,
    roomId,
    unitRoute,
    scanFixture,
    rows,
  };
}

async function main() {
  await mkdir(SCREEN_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const prototype = await prototypeCaptures(browser);
    const actual = await actualCaptures(browser);
    const summary = {
      generatedAt: new Date().toISOString(),
      viewport: '1024x768',
      prototypeCount: prototype.length,
      actualCount: actual.rows.length,
      authenticatedActualCount: actual.rows.filter(
        (row) => row.authTextCount === 0
      ).length,
      actionErrors: actual.rows.filter((row) => row.actionError),
    };
    await writeFile(
      OUTPUT,
      `${JSON.stringify({ summary, prototype, actual }, null, 2)}\n`,
      { mode: 0o600 }
    );
    console.log(JSON.stringify({ output: OUTPUT, ...summary }));
    if (
      summary.prototypeCount !== 28 ||
      summary.actualCount !== 28 ||
      summary.authenticatedActualCount !== 28 ||
      summary.actionErrors.length
    )
      process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(
    JSON.stringify({
      fatal: String(error?.message ?? error)
        .split('\n')[0]
        .slice(0, 400),
    })
  );
  process.exitCode = 1;
});
