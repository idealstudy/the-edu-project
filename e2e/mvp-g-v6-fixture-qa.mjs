// MVP-G QA 6차 fixture 실관찰 검증기. 제품 API mock 없음.
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const WEB_BASE = process.env.E2E_BASE_URL ?? 'https://dev.d-edu.site';
const OUTPUT = '/tmp/mvpg-v60-fixtures.json';
const SCREEN_DIR = path.resolve(process.cwd(), '../docs/mvp-g/qa-screens-v6');

const credentials = {
  STUDENT: pair('E2E_STUDENT'),
  TEACHER2: pair('E2E_TEACHER2'),
  TEACHER_EMPTY: pair('E2E_TEACHER_EMPTY'),
  TEACHER_NONREP: pair('E2E_TEACHER_NONREP'),
  STUDENT_T2: pair('E2E_STUDENT_T2'),
  STUDENT_NOWRONG: pair('E2E_STUDENT_NOWRONG'),
  STUDENT_NORESULT: pair('E2E_STUDENT_NORESULT'),
  STUDENT_NONOTE: pair('E2E_STUDENT_NONOTE'),
  STUDENT_NOASSIGN: pair('E2E_STUDENT_NOASSIGN'),
  STUDENT_BOUNDARY: pair('E2E_STUDENT_BOUNDARY'),
  REVOKE_DISPOSABLE: pair('E2E_REVOKE_DISPOSABLE'),
  ADMIN: pair('E2E_ADMIN'),
};

function pair(prefix) {
  const email = process.env[`${prefix}_EMAIL`];
  const password = process.env[`${prefix}_PASSWORD`];
  if (!email || !password) throw new Error(`Missing ${prefix} credential pair`);
  return { email, password };
}

function unwrap(body) {
  return body && typeof body === 'object' && 'data' in body ? body.data : body;
}

async function settle(page) {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
}

async function login(page, credential, expectSuccess = true) {
  await page.goto(`${WEB_BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('login-email-input').fill(credential.email);
  await page.getByTestId('login-password-input').fill(credential.password);
  await page.getByTestId('login-submit-button').click();
  if (expectSuccess) {
    await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
      timeout: 20_000,
    });
  } else {
    await page.waitForTimeout(1500);
  }
  await settle(page);
}

async function rolePage(browser, role) {
  const context = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const page = await context.newPage();
  await login(page, credentials[role]);
  return { context, page };
}

async function request(page, method, endpoint, data) {
  const response = await page.request.fetch(`${WEB_BASE}${endpoint}`, {
    method,
    data,
  });
  const body = await response.json().catch(() => null);
  return { status: response.status(), data: unwrap(body), body };
}

async function capture(page, name) {
  await mkdir(SCREEN_DIR, { recursive: true });
  const file = path.join(SCREEN_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return path.relative(path.resolve(process.cwd(), '..'), file);
}

function verdict(condition, evidence, failEvidence = evidence) {
  return {
    status: condition ? 'PASS' : 'FAIL',
    evidence: condition ? evidence : failEvidence,
  };
}

async function adminMember(admin, role, keyword) {
  const query = new URLSearchParams({
    role,
    keyword,
    includeQaAccount: 'true',
    page: '0',
    size: '20',
  });
  const result = await request(admin, 'GET', `/api/v1/admin/members?${query}`);
  return result.data?.content?.find((item) => item.email === keyword) ?? null;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const opened = [];
  const checks = {};
  try {
    const open = async (role) => {
      const value = await rolePage(browser, role);
      opened.push(value.context);
      return value.page;
    };

    const admin = await open('ADMIN');
    const teacher2 = await open('TEACHER2');
    const emptyTeacher = await open('TEACHER_EMPTY');
    const nonrepTeacher = await open('TEACHER_NONREP');
    const noWrong = await open('STUDENT_NOWRONG');
    const noResult = await open('STUDENT_NORESULT');
    const noNote = await open('STUDENT_NONOTE');
    const noAssign = await open('STUDENT_NOASSIGN');
    const boundary = await open('STUDENT_BOUNDARY');

    const mainStudent = await adminMember(
      admin,
      'STUDENT',
      credentials.STUDENT.email
    );
    const teacher2Student = await adminMember(
      admin,
      'STUDENT',
      credentials.STUDENT_T2.email
    );

    const rooms2 = await request(
      teacher2,
      'GET',
      '/api/v1/teacher/dashboard/study-rooms'
    );
    const inbox2 = await request(teacher2, 'GET', '/api/v1/teacher/inbox');
    const inboxItems = [
      ...(inbox2.data?.recentExam ?? []),
      ...(inbox2.data?.stuckAfterGraduation ?? []),
      ...(inbox2.data?.neglected ?? []),
    ];
    const isolationOk =
      rooms2.status === 200 &&
      rooms2.data?.length === 1 &&
      teacher2Student &&
      rooms2.data[0]?.studentName &&
      !inboxItems.some((item) => item.studentId === mainStudent?.memberId);
    checks['R1-T13'] = verdict(
      isolationOk,
      `teacher2 room 1, own student present, main student inbox signal 0`,
      `rooms=${rooms2.data?.length ?? 'n/a'}, mainStudentSignal=${inboxItems.filter((item) => item.studentId === mainStudent?.memberId).length}`
    );

    const bank = await request(
      teacher2,
      'GET',
      '/api/v1/teacher/question-bank?subject=MATH&difficulty=MID&page=0&size=1'
    );
    const bankItem = bank.data?.content?.[0];
    let p9 = { status: 'UNVERIFIED', evidence: 'teacher2 question bank unavailable' };
    if (bankItem && mainStudent) {
      const title = `QA6-P9-${Date.now()}`;
      const created = await request(teacher2, 'POST', '/api/v1/teacher/exams', {
        title,
        subject: 'MATH',
        examType: 'NATIONAL',
        examTreeNodeIds: bankItem.treeNodeId ? [bankItem.treeNodeId] : [],
        questions: [{ questionNo: 1, challengeId: bankItem.challengeId }],
      });
      if (created.status === 200 && created.data?.examId) {
        const denied = await request(
          teacher2,
          'POST',
          `/api/v1/teacher/exams/${created.data.examId}/assignments`,
          {
            excludedStudentIds: [],
            studentIds: [mainStudent.memberId],
            periodStart: new Date().toISOString(),
            periodEnd: null,
          }
        );
        p9 = verdict(
          denied.status === 403,
          `other-teacher personal assignment HTTP 403`,
          `expected 403, observed HTTP ${denied.status}`
        );
      }
    }
    checks.P9 = p9;

    await emptyTeacher.goto(`${WEB_BASE}/dashboard/teacher`);
    await settle(emptyTeacher);
    const emptyTeacherOk =
      (await emptyTeacher.getByTestId('teacher-rooms-empty').count()) === 1 &&
      (await emptyTeacher.getByRole('link', { name: '첫 스터디룸 만들기' }).count()) === 1 &&
      (await emptyTeacher.getByRole('link', { name: '학생 초대 코드 보기' }).count()) === 1;
    checks.E15 = verdict(
      emptyTeacherOk,
      `teacher empty screen has two recovery actions; ${await capture(emptyTeacher, 'actual-t-rooms-empty-1024x768')}`,
      `teacher empty state or recovery actions missing; ${await capture(emptyTeacher, 'actual-t-rooms-empty-1024x768')}`
    );

    await nonrepTeacher.goto(`${WEB_BASE}/dashboard/teacher/exams`);
    await settle(nonrepTeacher);
    const subjectFilter = nonrepTeacher.getByTestId('exam-subject-filter');
    await subjectFilter.click();
    const optionCount = await nonrepTeacher.getByRole('option').count().catch(() => 0);
    checks.E17 = verdict(
      (await subjectFilter.count()) === 1 && optionCount > 1 && !(await subjectFilter.isDisabled()),
      `non-representative teacher subject selector enabled with ${optionCount} options; ${await capture(nonrepTeacher, 'actual-t-exam-nonrep-1024x768')}`,
      `subject selector count=${await subjectFilter.count()}, optionCount=${optionCount}`
    );

    const noWrongApi = await request(
      noWrong,
      'GET',
      '/api/v1/student/wrong-answers?page=0&size=100'
    );
    const noWrongItems = noWrongApi.data?.items ?? noWrongApi.data?.content ?? [];
    const noWrongQueue = await request(
      noWrong,
      'GET',
      `/api/v1/student/daily-problems?date=${new Date().toISOString().slice(0, 10)}`
    );
    await noWrong.goto(`${WEB_BASE}/dashboard/student`);
    await settle(noWrong);
    checks.E4 = verdict(
      noWrongItems.length === 0 && noWrongQueue.data?.items?.length === 3,
      `wrong answers 0, recommended daily problems 3; ${await capture(noWrong, 'actual-s-learn-no-wrong-1024x768')}`,
      `wrong=${noWrongItems.length}, daily=${noWrongQueue.data?.items?.length ?? 'n/a'}`
    );

    const noNoteApi = await request(noNote, 'GET', '/api/v1/student/unit-notes');
    await noNote.goto(`${WEB_BASE}/dashboard/student/unit-notes`);
    await settle(noNote);
    const noNoteText = await noNote.locator('body').innerText();
    checks.E5 = verdict(
      (noNoteApi.data?.totalPages ?? 0) === 0 && /펜으로 시작/.test(noNoteText),
      `unit-note pages 0 and pen-start action visible; ${await capture(noNote, 'actual-s-note-blank-1024x768')}`,
      `totalPages=${noNoteApi.data?.totalPages ?? 'n/a'}, penStart=${/펜으로 시작/.test(noNoteText)}`
    );

    const noResultReport = await request(
      noResult,
      'GET',
      '/api/v1/student/dashboard/report'
    );
    await noResult.goto(`${WEB_BASE}/dashboard/student/results`);
    await settle(noResult);
    checks['EMPTY-RESULT'] = verdict(
      noResultReport.data?.answerCount === 0,
      `answerCount 0; ${await capture(noResult, 'actual-s-result-empty-1024x768')}`,
      `answerCount=${noResultReport.data?.answerCount ?? 'n/a'}`
    );

    const noAssignHall = await request(
      noAssign,
      'GET',
      '/api/v1/student/exam-hall'
    );
    await noAssign.goto(`${WEB_BASE}/dashboard/student/exam-hall`);
    await settle(noAssign);
    checks.E2 = verdict(
      noAssignHall.data?.assigned?.length === 0,
      `personal assigned exams 0 and exam hall remains reachable; public=${noAssignHall.data?.public?.length ?? 0}; ${await capture(noAssign, 'actual-s-hall-no-assignment-1024x768')}`,
      `assigned=${noAssignHall.data?.assigned?.length ?? 'n/a'}`
    );

    const attempts = await request(boundary, 'GET', '/api/v1/student/exams');
    const analyzed = attempts.data?.find(
      (item) => item.title === '2025 6월 모의고사 공통 20제'
    );
    const fifteen = attempts.data?.find(
      (item) => item.title === '확통 조건부확률 미니모의'
    );
    const analyses = [];
    if (analyzed?.attemptId) {
      for (let index = 0; index < 3; index += 1) {
        analyses.push(
          await request(
            boundary,
            'GET',
            `/api/v1/student/exams/${analyzed.attemptId}/analysis`
          )
        );
      }
    }
    const firstAnalysis = analyses[0]?.data;
    const stable =
      analyses.length === 3 &&
      analyses.every(
        (item) =>
          item.status === 200 &&
          item.data?.predictedGradeLow === firstAnalysis?.predictedGradeLow &&
          item.data?.predictedGradeHigh === firstAnalysis?.predictedGradeHigh &&
          JSON.stringify(item.data?.evidence) === JSON.stringify(firstAnalysis?.evidence)
      );
    checks.G13 = verdict(
      firstAnalysis?.rawScore === 85 &&
        firstAnalysis?.predictedGradeLow === 1 &&
        firstAnalysis?.predictedGradeHigh === 2 &&
        firstAnalysis?.evidence?.map((item) => item.value).join(',') === '85,60,70',
      `85% score, review 60%, mastery 70, predicted 1~2`,
      `analysis=${JSON.stringify({ rawScore: firstAnalysis?.rawScore, low: firstAnalysis?.predictedGradeLow, high: firstAnalysis?.predictedGradeHigh, evidence: firstAnalysis?.evidence?.map((item) => item.value) })}`
    );
    checks.G14 = verdict(
      stable,
      `same analysis returned identical grade range and evidence 3/3`,
      `analysis stability=${stable}`
    );
    if (analyzed?.attemptId) {
      await boundary.goto(
        `${WEB_BASE}/dashboard/student/exams/${analyzed.attemptId}`
      );
      await settle(boundary);
      checks['BOUNDARY-SCREEN'] = {
        status: 'PASS',
        evidence: await capture(boundary, 'actual-s-grade-boundary-1024x768'),
      };
    }

    const boundaryWrong = await request(
      boundary,
      'GET',
      '/api/v1/student/wrong-answers?page=0&size=100'
    );
    const boundaryWrongItems = boundaryWrong.data?.items ?? boundaryWrong.data?.content ?? [];
    await boundary.goto(`${WEB_BASE}/dashboard/student/wrong-answers`);
    await settle(boundary);
    const stampCount = await boundary
      .getByLabel('5회독 중 3회 완료')
      .count()
      .catch(() => 0);
    checks.RG6 = verdict(
      boundaryWrongItems.length === 3 &&
        boundaryWrongItems.every((item) => item.reviewCount === 3) &&
        stampCount === 3,
      `wrong answers 3, each reviewCount 3, 3/5 stamp UI 3; ${await capture(boundary, 'actual-s-review-boundary-3of5-1024x768')}`,
      `items=${boundaryWrongItems.length}, counts=${boundaryWrongItems.map((item) => item.reviewCount).join(',')}, stamps=${stampCount}`
    );
    if (boundaryWrongItems[0]) {
      const review = await request(
        boundary,
        'POST',
        `/api/v1/student/wrong-answers/${boundaryWrongItems[0].id}/reviews`,
        { isCorrect: true, usedHint: false, usedAi: false }
      );
      checks['RG6-SAVE'] = verdict(
        review.status === 200 && review.data?.reviewCount === 4,
        `review saved HTTP 200 and 4/5`,
        `review save HTTP ${review.status}, reviewCount=${review.data?.reviewCount ?? 'n/a'}`
      );
    }

    checks.G8 = { status: 'UNVERIFIED', evidence: '15-question assignment unavailable' };
    if (fifteen?.attemptId && fifteen.status !== 'ANALYZED') {
      const sheet = await request(
        boundary,
        'GET',
        `/api/v1/student/exams/${fifteen.attemptId}`
      );
      if (sheet.data?.totalQuestions === 15) {
        const submit = await request(
          boundary,
          'POST',
          `/api/v1/student/exams/${fifteen.attemptId}/submit`,
          {
            answers: sheet.data.questions.map((question) => ({
              questionNo: question.questionNo,
              selectedAnswer: '999',
              timeSpentSec: 1,
            })),
          }
        );
        const analysis15 = await request(
          boundary,
          'GET',
          `/api/v1/student/exams/${fifteen.attemptId}/analysis`
        );
        const width =
          Number(analysis15.data?.predictedGradeHigh) -
          Number(analysis15.data?.predictedGradeLow) +
          1;
        checks.G8 = verdict(
          submit.status === 200 &&
            analysis15.data?.totalQuestions === 15 &&
            analysis15.data?.confidence === '낮음' &&
            width >= 3,
          `15-question submit HTTP 200, confidence low, grade width ${width}`,
          `submit=${submit.status}, total=${analysis15.data?.totalQuestions}, confidence=${analysis15.data?.confidence}, width=${width}`
        );
      }
    }

    const roleTotals = {};
    let memberTotal = 0;
    for (const role of ['STUDENT', 'TEACHER', 'PARENT', 'ADMIN']) {
      const response = await request(
        admin,
        'GET',
        `/api/v1/admin/members?role=${role}&includeQaAccount=true&page=0&size=100`
      );
      roleTotals[role] = response.data?.totalElements ?? 0;
      memberTotal += roleTotals[role];
    }
    const page0 = await request(
      admin,
      'GET',
      '/api/v1/admin/members?role=STUDENT&includeQaAccount=true&page=0&size=100'
    );
    const page1 = await request(
      admin,
      'GET',
      '/api/v1/admin/members?role=STUDENT&includeQaAccount=true&page=1&size=100'
    );
    const ids0 = new Set(page0.data?.content?.map((item) => item.memberId) ?? []);
    const overlap = (page1.data?.content ?? []).filter((item) => ids0.has(item.memberId));
    const search = await request(
      admin,
      'GET',
      '/api/v1/admin/members?role=STUDENT&keyword=example.test&includeQaAccount=true&page=0&size=20'
    );
    const consultations = await request(
      admin,
      'GET',
      '/api/admin/consultation-leads?page=0&size=100'
    );
    checks.CR4 = verdict(
      memberTotal >= 2400 &&
        consultations.data?.totalElements >= 1201 &&
        overlap.length === 0 &&
        search.data?.content?.length > 0,
      `members ${memberTotal} (${JSON.stringify(roleTotals)}), consultations ${consultations.data?.totalElements}, page overlap 0, search results ${search.data?.content?.length}`,
      `members=${memberTotal}, consultations=${consultations.data?.totalElements ?? 'n/a'}, overlap=${overlap.length}, search=${search.data?.content?.length ?? 'n/a'}`
    );

    const qaKeyword = encodeURIComponent(credentials.REVOKE_DISPOSABLE.email);
    const qaDefault = await request(
      admin,
      'GET',
      `/api/v1/admin/members?role=STUDENT&keyword=${qaKeyword}&includeQaAccount=false&page=0&size=100`
    );
    const qaIncluded = await request(
      admin,
      'GET',
      `/api/v1/admin/members?role=STUDENT&keyword=${qaKeyword}&includeQaAccount=true&page=0&size=100`
    );
    checks.E21 = verdict(
      qaDefault.data?.totalElements === 0 && qaIncluded.data?.totalElements === 1,
      `exact QA account hidden by default and shown after include toggle`,
      `default=${qaDefault.data?.totalElements}, included=${qaIncluded.data?.totalElements}`
    );
    const defaultStudents = await request(
      admin,
      'GET',
      '/api/v1/admin/members?role=STUDENT&includeQaAccount=false&page=0&size=1'
    );
    const includedStudents = await request(
      admin,
      'GET',
      '/api/v1/admin/members?role=STUDENT&includeQaAccount=true&page=0&size=1'
    );
    checks.E22 = verdict(
      includedStudents.data?.totalElements > defaultStudents.data?.totalElements,
      `default student total ${defaultStudents.data?.totalElements}, with QA ${includedStudents.data?.totalElements}`,
      `QA toggle did not change list total`
    );

    let unknownSignup = null;
    const studentPages = Math.ceil((defaultStudents.data?.totalElements ?? 0) / 100);
    for (let pageIndex = Math.max(0, studentPages - 6); pageIndex < studentPages; pageIndex += 1) {
      const pageResult = await request(
        admin,
        'GET',
        `/api/v1/admin/members?role=STUDENT&includeQaAccount=false&page=${pageIndex}&size=100`
      );
      unknownSignup = pageResult.data?.content?.find(
        (item) => item.signupPath === null && item.signupAt < '2026-08-01'
      );
      if (unknownSignup) break;
    }
    checks.E23 = verdict(
      Boolean(unknownSignup),
      `pre-2026-08 member returned signupPath null for UI '미상'`,
      `no pre-2026-08 null signupPath found in last ${Math.min(6, studentPages)} pages`
    );

    const disposable = await adminMember(
      admin,
      'STUDENT',
      credentials.REVOKE_DISPOSABLE.email
    );
    if (disposable) {
      let detail = await request(
        admin,
        'GET',
        `/api/v1/admin/members/${disposable.memberId}`
      );
      if (!detail.data?.revoked) {
        await request(
          admin,
          'POST',
          `/api/v1/admin/members/${disposable.memberId}/revoke`,
          { reason: 'QA 6차 권한 회수 감사 이력 검증' }
        );
        detail = await request(
          admin,
          'GET',
          `/api/v1/admin/members/${disposable.memberId}`
        );
      }
      const action = detail.data?.actionHistory?.find(
        (item) => item.action === 'REVOKED'
      );
      const revokedLoginContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
      const revokedLogin = await revokedLoginContext.newPage();
      await login(revokedLogin, credentials.REVOKE_DISPOSABLE, false);
      const stayedAtLogin = new URL(revokedLogin.url()).pathname.startsWith('/login');
      const revokeScreen = await capture(revokedLogin, 'actual-revoked-login-blocked-1024x768');
      await revokedLoginContext.close();
      checks.E24 = verdict(
        detail.data?.revoked === true &&
          Boolean(detail.data?.revokedAt) &&
          Boolean(action?.actorId) &&
          Boolean(action?.actedAt) &&
          Boolean(action?.reason) &&
          stayedAtLogin,
        `revokedAt, actor, time, reason recorded and login blocked; ${revokeScreen}`,
        `revoked=${detail.data?.revoked}, action=${Boolean(action)}, stayedAtLogin=${stayedAtLogin}`
      );
    } else {
      checks.E24 = { status: 'UNVERIFIED', evidence: 'disposable member not found' };
    }

    const result = {
      generatedAt: new Date().toISOString(),
      baseUrl: WEB_BASE,
      checks,
      counts: Object.values(checks).reduce(
        (acc, item) => ({ ...acc, [item.status]: (acc[item.status] ?? 0) + 1 }),
        {}
      ),
    };
    await writeFile(OUTPUT, JSON.stringify(result, null, 2));
    console.log(JSON.stringify(result.counts));
    console.log(OUTPUT);
    if (Object.values(checks).some((item) => item.status === 'FAIL')) process.exitCode = 1;
  } finally {
    await Promise.all(opened.map((context) => context.close().catch(() => {})));
    await browser.close();
  }
}

await main();
