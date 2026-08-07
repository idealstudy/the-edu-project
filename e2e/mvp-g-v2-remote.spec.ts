// MVP-G v2.0 remote QA. Real accounts and real dev/prod data only. No route mocks.
import { type Browser, type Page, expect, test } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

type Role = 'STUDENT' | 'STUDENT2' | 'TEACHER' | 'ADMIN';
type JsonRecord = Record<string, unknown>;
type TreeNodeStatus = {
  nodeId: number;
  masteryScore: number;
  attemptCount: number;
  correctCount: number;
};

const credentials: Record<Role, { email: string; password: string }> = {
  STUDENT: {
    email: requiredEnv('E2E_STUDENT_EMAIL'),
    password: requiredEnv('E2E_STUDENT_PASSWORD'),
  },
  STUDENT2: {
    email: requiredEnv('E2E_STUDENT2_EMAIL'),
    password: requiredEnv('E2E_STUDENT2_PASSWORD'),
  },
  TEACHER: {
    email: requiredEnv('E2E_TEACHER_EMAIL'),
    password: requiredEnv('E2E_TEACHER_PASSWORD'),
  },
  ADMIN: {
    email: requiredEnv('E2E_ADMIN_EMAIL'),
    password: requiredEnv('E2E_ADMIN_PASSWORD'),
  },
};

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Required secret ${name} is not configured`);
  return value;
}

async function login(page: Page, role: Role) {
  await page.goto('/login');
  await page.getByTestId('login-email-input').fill(credentials[role].email);
  await page
    .getByTestId('login-password-input')
    .fill(credentials[role].password);
  await page.getByTestId('login-submit-button').click();
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
  await expect(page.getByText(/인증이 필요|로그인이 필요/)).toHaveCount(0);
}

async function newRolePage(browser: Browser, role: Role) {
  const context = await browser.newContext({
    baseURL: process.env.E2E_BASE_URL ?? 'https://dev.d-edu.site',
    viewport: { width: 1024, height: 768 },
  });
  const page = await context.newPage();
  await login(page, role);
  return { context, page };
}

async function api<T = JsonRecord>(
  page: Page,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH',
  url: string,
  data?: unknown
): Promise<T> {
  const response = await page.request.fetch(url, { method, data });
  expect(response.status(), `${method} ${url}`).toBeGreaterThanOrEqual(200);
  expect(response.status(), `${method} ${url}`).toBeLessThan(300);
  const body = (await response.json()) as { data?: T } & T;
  return (body.data ?? body) as T;
}

async function attachScreenshot(page: Page, name: string) {
  const outputDir = path.resolve(process.cwd(), '../docs/mvp-g/qa-screens');
  await mkdir(outputDir, { recursive: true });
  const outputPath = path.join(outputDir, `${name}.png`);
  const body = await page.screenshot({ fullPage: true, path: outputPath });
  await test.info().attach(name, { body, contentType: 'image/png' });
}

async function getTreeStatus(page: Page) {
  const tree = await api<{ nodes: TreeNodeStatus[] }>(
    page,
    'GET',
    '/api/v1/common/tree'
  );
  return new Map(tree.nodes.map((node) => [node.nodeId, node]));
}

test.describe('MVP-G v2.0 원격 릴리즈 게이트', () => {
  test('health와 401 문구 비노출을 관찰한다', async ({ page }) => {
    const apiBase =
      process.env.E2E_API_BASE_URL ?? 'https://apidev.d-edu.site';
    const response = await page.request.get(
      `${apiBase}/api/admin/actuator/health`
    );
    expect(response.status()).toBe(200);
    expect(await response.text()).toContain('UP');

    await page.goto('/dashboard/student');
    await expect(page.getByText(/인증이 필요|로그인이 필요/)).toHaveCount(0);
  });

  test('학생은 관리자 화면을 볼 수 없고 관리자 5메뉴는 모두 실제 화면을 연다', async ({
    browser,
  }) => {
    const student = await newRolePage(browser, 'STUDENT');
    await student.page.goto('/admin/members');
    await expect(student.page.locator('[data-admin-shell]')).toHaveCount(0);
    await expect(student.page).toHaveURL(/\/(403|login)(?:\?|$)/);
    await student.context.close();

    const admin = await newRolePage(browser, 'ADMIN');
    const screens = [
      ['/admin/members', 'admin-members'],
      ['/admin/study-rooms', 'admin-study-rooms'],
      ['/admin/public-exams', 'admin-public-hall'],
      ['/admin/question-bank', 'admin-question-bank'],
      ['/admin/consultations', 'admin-consultations'],
    ] as const;
    for (const [url, testId] of screens) {
      const failedRequests: Array<{ method: string; path: string; status: number }> = [];
      const captureFailure = (response: import('@playwright/test').Response) => {
        if (response.status() < 400) return;
        const parsed = new URL(response.url());
        failedRequests.push({
          method: response.request().method(),
          path: parsed.pathname + parsed.search,
          status: response.status(),
        });
      };
      admin.page.on('response', captureFailure);
      await admin.page.goto(url);
      await expect(admin.page.getByTestId(testId)).toBeVisible();
      await expect(
        admin.page.getByText(/불러오는 중입니다|불러오는 중/)
      ).toHaveCount(0, { timeout: 15_000 });
      await expect(
        admin.page.getByText(/인증이 필요|로그인이 필요/)
      ).toHaveCount(0);
      await attachScreenshot(admin.page, `actual-${testId}-1024x768`);
      admin.page.off('response', captureFailure);
      expect(failedRequests, `${url} failed requests`).toEqual([]);
    }
    await admin.context.close();
  });

  test('R1 선생님 시험 생성부터 학생 제출, 오답, 코멘트 확인까지 상태를 잇는다', async ({
    browser,
  }) => {
    const runId = `QA-MVPG-${Date.now()}`;
    const teacher = await newRolePage(browser, 'TEACHER');
    const student = await newRolePage(browser, 'STUDENT');

    await teacher.page.goto('/dashboard/teacher/exams');
    await expect(teacher.page.getByTestId('teacher-exam-card')).toBeVisible();
    await expect(teacher.page.getByTestId('teacher-exam-room')).not.toHaveText(
      '수업 고르기'
    );
    await expect(teacher.page.getByTestId('question-bank-list')).toBeVisible();
    await attachScreenshot(teacher.page, 'actual-r1-teacher-question-bank');

    const rooms = await api<
      Array<{
        id: number;
        name: string;
        studentName: string | null;
        todoCount: number;
      }>
    >(teacher.page, 'GET', '/api/v1/teacher/dashboard/study-rooms');
    expect(rooms.length).toBeGreaterThan(0);
    const bank = await api<{
      content: Array<{ challengeId: number; treeNodeId: number | null }>;
    }>(
      teacher.page,
      'GET',
      '/api/v1/teacher/question-bank?subject=MATH&difficulty=MID&page=0&size=10'
    );
    expect(bank.content).toHaveLength(10);
    const testedNodeIds = [
      ...new Set(
        bank.content
          .map((question) => question.treeNodeId)
          .filter((nodeId): nodeId is number => nodeId !== null)
      ),
    ];
    expect(testedNodeIds.length).toBeGreaterThan(0);
    const treeBefore = await getTreeStatus(student.page);

    const created = await api<{ examId: number }>(
      teacher.page,
      'POST',
      '/api/v1/teacher/exams',
      {
        title: runId,
        subject: 'MATH',
        examType: 'NATIONAL',
        examTreeNodeIds: testedNodeIds,
        questions: bank.content.map((question, index) => ({
          questionNo: index + 1,
          challengeId: question.challengeId,
        })),
      }
    );
    await api(
      teacher.page,
      'POST',
      `/api/v1/teacher/exams/${created.examId}/assignments`,
      {
        studyRoomId: rooms[0]!.id,
        excludedStudentIds: [],
        studentIds: [],
        periodStart: new Date().toISOString(),
        periodEnd: null,
      }
    );

    await student.page.goto('/dashboard/student/exam-hall');
    const assignedRow = student.page.getByText(runId).locator('..');
    await expect(assignedRow).toContainText('우리 반');
    await assignedRow.getByRole('link', { name: '응시하기' }).click();
    await expect(student.page.getByTestId('exam-take-screen')).toBeVisible();
    const attemptId = Number(student.page.url().match(/\/exams\/(\d+)/)?.[1]);
    expect(attemptId).toBeGreaterThan(0);
    const attemptSheet = await api<{ title: string; totalQuestions: number }>(
      student.page,
      'GET',
      `/api/v1/student/exams/${attemptId}`
    );
    expect(attemptSheet.title).toBe(runId);
    const wrongBefore = await api<{
      content?: Array<{
        id: number;
        sourceType: string;
        questionSnapshot: Record<string, unknown> | null;
      }>;
      items?: Array<{
        id: number;
        sourceType: string;
        questionSnapshot: Record<string, unknown> | null;
      }>;
    }>(student.page, 'GET', '/api/v1/student/wrong-answers?page=0&size=100');
    const wrongBeforeIds = new Set(
      (wrongBefore.content ?? wrongBefore.items ?? []).map((item) => item.id)
    );

    await student.page.getByTestId('exam-palette-toggle').click();
    await expect(student.page.getByTestId('exam-palette-toggle')).toHaveText(
      '›'
    );
    await student.page.getByTestId('exam-palette-toggle').click();
    for (let index = 0; index < 10; index += 1) {
      await student.page
        .getByTestId('exam-answer-box')
        .getByRole('button', { name: '1' })
        .click();
      if (index < 9) {
        await student.page.getByRole('button', { name: '다음 문항 ›' }).click();
      }
    }
    const submitResponsePromise = student.page.waitForResponse(
      (response) =>
        response.url().includes(`/student/exams/${attemptId}/submit`) &&
        response.request().method() === 'POST'
    );
    await student.page.getByRole('button', { name: '답안 제출하기' }).click();
    const submitResponse = await submitResponsePromise;
    expect(submitResponse.status()).toBeGreaterThanOrEqual(200);
    expect(submitResponse.status()).toBeLessThan(300);
    const submitBody = (await submitResponse.json()) as {
      data?: {
        answerResults?: Array<{ correct: boolean }>;
        weakUnits?: Array<{
          treeNodeId: number;
          name: string;
          wrongCount: number;
        }>;
      };
      answerResults?: Array<{ correct: boolean }>;
      weakUnits?: Array<{
        treeNodeId: number;
        name: string;
        wrongCount: number;
      }>;
    };
    const submittedAnalysis = submitBody.data ?? submitBody;
    const ownRunAttemptCount = (submittedAnalysis.answerResults ?? []).length;
    const submittedWrongCount = (submittedAnalysis.answerResults ?? []).filter(
      (answer) => !answer.correct
    ).length;
    const treeAfter = await getTreeStatus(student.page);
    const selectedQuestionCount = bank.content.filter(
      (question) => question.treeNodeId !== null
    ).length;
    const attemptDelta = testedNodeIds.reduce(
      (sum, nodeId) =>
        sum +
        ((treeAfter.get(nodeId)?.attemptCount ?? 0) -
          (treeBefore.get(nodeId)?.attemptCount ?? 0)),
      0
    );
    expect(attemptSheet.totalQuestions).toBe(selectedQuestionCount);
    expect(ownRunAttemptCount).toBe(selectedQuestionCount);
    expect(attemptDelta).toBeGreaterThanOrEqual(ownRunAttemptCount);
    expect(
      testedNodeIds.some(
        (nodeId) =>
          (treeAfter.get(nodeId)?.masteryScore ?? 0) !==
          (treeBefore.get(nodeId)?.masteryScore ?? 0)
      )
    ).toBe(true);
    if (submittedWrongCount > 0) {
      expect(
        (submittedAnalysis.weakUnits ?? []).some(
          (unit) =>
            unit.wrongCount > 0 && testedNodeIds.includes(unit.treeNodeId)
        )
      ).toBe(true);
    }
    await expect(
      student.page
        .getByTestId('exam-submit-result')
        .or(student.page.getByTestId('exam-analysis-card'))
    ).toBeVisible();
    await attachScreenshot(student.page, 'actual-r1-submit-result');
    const analysisButton = student.page.getByRole('button', {
      name: '시험 분석 보기',
    });
    if (await analysisButton.isVisible()) await analysisButton.click();
    await expect(student.page.getByTestId('exam-analysis-card')).toBeVisible();
    await expect(student.page.getByTestId('exam-grade-result')).toBeVisible();
    await attachScreenshot(student.page, 'actual-r1-analysis');

    const wrongAnswers = await api<{
      content?: Array<{
        id: number;
        sourceType: string;
        questionSnapshot: Record<string, unknown> | null;
      }>;
      items?: Array<{
        id: number;
        sourceType: string;
        questionSnapshot: Record<string, unknown> | null;
      }>;
    }>(student.page, 'GET', '/api/v1/student/wrong-answers?page=0&size=100');
    const wrongItems = wrongAnswers.content ?? wrongAnswers.items ?? [];
    const newExamWrongItems = wrongItems.filter(
      (item) =>
        item.sourceType === 'EXAM' &&
        item.questionSnapshot?.sourceText === runId &&
        !wrongBeforeIds.has(item.id)
    );
    expect(newExamWrongItems).toHaveLength(submittedWrongCount);

    const roomsAfterSubmit = await api<
      Array<{
        id: number;
        name: string;
        studentName: string | null;
        todoCount: number;
      }>
    >(teacher.page, 'GET', '/api/v1/teacher/dashboard/study-rooms');
    const roomAfterSubmit = roomsAfterSubmit.find((room) => {
      const before = rooms.find(
        (candidate) =>
          candidate.id === room.id && candidate.studentName === room.studentName
      );
      return before !== undefined && room.todoCount > before.todoCount;
    });
    expect(roomAfterSubmit).toBeDefined();
    await teacher.page.goto('/dashboard/teacher');
    const roomList = teacher.page.getByTestId('teacher-rooms-list');
    await expect(roomList).toContainText(roomAfterSubmit!.name);
    await expect(roomList).toContainText(
      `손볼 것 ${roomAfterSubmit!.todoCount}건`
    );
    const examWrong = newExamWrongItems[0];
    expect(examWrong).toBeDefined();
    const comment = `${runId} 오답을 풀이 순서부터 다시 확인해요`;
    await api(
      teacher.page,
      'POST',
      `/api/v1/teacher/inbox/wrong-answers/${examWrong!.id}/comments`,
      { comment }
    );
    await student.page.goto('/dashboard/student/wrong-answers');
    await expect(
      student.page.getByTestId(`wrong-answer-card-${examWrong!.id}`)
    ).toBeVisible();
    await student.page
      .getByTestId(`wrong-answer-review-${examWrong!.id}`)
      .click();
    await attachScreenshot(student.page, 'actual-r1-student-teacher-comment');
    await expect(student.page.getByText(comment)).toBeVisible();

    const pin = await api<{ id: number }>(
      teacher.page,
      'POST',
      `/api/v1/teacher/exams/attempts/${attemptId}/pins`,
      { comment }
    );
    await student.page.goto(`/dashboard/student/exams/${attemptId}`);
    await expect(
      student.page.getByTestId(`exam-teacher-pin-${pin.id}`)
    ).toContainText(comment);
    await student.page.getByTestId(`exam-pin-acknowledge-${pin.id}`).click();
    await expect(
      student.page.getByTestId(`exam-teacher-pin-${pin.id}`)
    ).toHaveCount(0);
    const teacherPins = await api<
      Array<{ id: number; acknowledgedAt: string | null }>
    >(teacher.page, 'GET', '/api/v1/teacher/exams/pins');
    expect(
      teacherPins.find((item) => item.id === pin.id)?.acknowledgedAt
    ).not.toBeNull();

    await teacher.context.close();
    await student.context.close();
  });

  test('관리자 실측 등급컷으로 4등급, 6등급, 9등급 경계를 고정 검증한다', async ({
    browser,
  }) => {
    const runId = `QA-MVPG-GRADE-${Date.now()}`;
    const teacher = await newRolePage(browser, 'TEACHER');
    const admin = await newRolePage(browser, 'ADMIN');
    const student = await newRolePage(browser, 'STUDENT');
    const rooms = await api<Array<{ id: number }>>(
      teacher.page,
      'GET',
      '/api/v1/teacher/dashboard/study-rooms'
    );
    expect(rooms.length).toBeGreaterThan(0);
    const cases = [
      { grade: 4, correctCount: 6 },
      { grade: 6, correctCount: 4 },
      { grade: 9, correctCount: 1 },
    ] as const;
    const cutoffs = [90, 80, 70, 60, 50, 40, 30, 20].map(
      (minRawScore, index) => ({ grade: index + 1, minRawScore })
    );

    for (const boundary of cases) {
      const title = `${runId}-G${boundary.grade}`;
      const pdfMedia = await api<{
        mediaAssetList: Array<{
          mediaId: string;
          uploadUrl: string;
          headers: Record<string, string>;
        }>;
      }>(teacher.page, 'POST', '/api/v1/common/media/presign-batch', {
        mediaAssetList: [
          {
            fileName: `${runId}-grade-${boundary.grade}.pdf`,
            contentType: 'application/pdf',
            sizeBytes: 8,
            targetType: 'EXAM_PDF',
          },
        ],
      });
      const pdfAsset = pdfMedia.mediaAssetList[0]!;
      const pdfUpload = await teacher.page.request.put(pdfAsset.uploadUrl, {
        headers: {
          ...pdfAsset.headers,
          'Content-Type': 'application/pdf',
        },
        data: Buffer.from('%PDF-QA1'),
      });
      expect(pdfUpload.status()).toBe(200);
      const created = await api<{ examId: number }>(
        teacher.page,
        'POST',
        '/api/v1/teacher/exams',
        {
          title,
          sourcePdfMediaId: pdfAsset.mediaId,
          subject: 'MATH',
          examType: 'NATIONAL',
          examTreeNodeIds: [],
          questions: Array.from({ length: 10 }, (_, index) => ({
            questionNo: index + 1,
            correctAnswer: '1',
            prompt: `${title} ${index + 1}번`,
          })),
        }
      );
      await api(
        admin.page,
        'PUT',
        `/api/v1/admin/exams/${created.examId}/grade-cutoff`,
        {
          source: `${runId} deterministic cutoff`,
          fullScore: 100,
          mean: null,
          stdDev: null,
          cutoffs,
        }
      );
      await api(
        teacher.page,
        'POST',
        `/api/v1/teacher/exams/${created.examId}/assignments`,
        {
          studyRoomId: rooms[0]!.id,
          excludedStudentIds: [],
          studentIds: [],
          periodStart: new Date().toISOString(),
          periodEnd: null,
        }
      );
      const hall = await api<{
        assigned: Array<{ examId: number; attemptId: number; title: string }>;
      }>(student.page, 'GET', '/api/v1/student/exam-hall');
      const assigned = hall.assigned.find((exam) => exam.title === title);
      expect(assigned).toBeDefined();
      const analysis = await api<{
        rawScore: number;
        predictedGradeLow: number;
        predictedGradeHigh: number;
        gradeBasis: string;
      }>(
        student.page,
        'POST',
        `/api/v1/student/exams/${assigned!.attemptId}/submit`,
        {
          answers: Array.from({ length: 10 }, (_, index) => ({
            questionNo: index + 1,
            selectedAnswer: index < boundary.correctCount ? '1' : '2',
            timeSpentSec: 1,
          })),
        }
      );
      expect(analysis.rawScore).toBe(boundary.correctCount * 10);
      expect(analysis.gradeBasis).toBe('MEASURED');
      expect(analysis.predictedGradeLow).toBe(boundary.grade);
      expect(analysis.predictedGradeHigh).toBe(Math.min(9, boundary.grade + 1));

      await student.page.goto(
        `/dashboard/student/exams/${assigned!.attemptId}`
      );
      await expect(
        student.page.getByTestId('exam-analysis-card')
      ).toBeVisible();
      await expect(student.page.getByTestId('exam-grade-result')).toContainText(
        `${boundary.grade}~${Math.min(9, boundary.grade + 1)}등급`
      );
      await attachScreenshot(
        student.page,
        `actual-grade-${boundary.grade}-boundary`
      );
    }

    await teacher.context.close();
    await admin.context.close();
    await student.context.close();
  });

  test('R2 기본 격리와 공개 응시장 원본 화면을 관찰한다', async ({
    browser,
  }) => {
    const admin = await newRolePage(browser, 'ADMIN');
    await admin.page.goto('/admin/public-exams');
    await expect(admin.page.getByTestId('admin-public-hall')).toBeVisible();
    await attachScreenshot(admin.page, 'actual-r2-admin-public-hall');

    const student2 = await newRolePage(browser, 'STUDENT2');
    await student2.page.goto('/dashboard/student/exam-hall');
    await expect(student2.page.getByTestId('student-exam-hall')).toBeVisible();
    await attachScreenshot(student2.page, 'actual-r2-unassigned-student-hall');
    await admin.context.close();
    await student2.context.close();
  });

  test('승인 프로토타입과 실제 핵심 화면을 같은 뷰포트로 캡처한다', async ({
    browser,
  }) => {
    const prototype = await browser.newPage({
      viewport: { width: 1024, height: 768 },
    });
    const prototypePath = path.resolve(
      process.cwd(),
      '../prototypes/mvp-g-3역할-hub-opus.html'
    );
    await prototype.goto(pathToFileURL(prototypePath).href);
    const prototypeScreens = [
      ['student', 's-learn'],
      ['teacher', 't-exam'],
      ['admin', 'a-members'],
      ['admin', 'a-rooms'],
      ['admin', 'a-hall'],
      ['admin', 'a-consult'],
    ] as const;
    for (const [role, screen] of prototypeScreens) {
      await prototype.locator(`[data-role="${role}"]`).click();
      await prototype.locator(`[data-screen="${screen}"]`).click();
      await attachScreenshot(prototype, `prototype-${screen}-1024x768`);
    }
    await prototype.close();

    const student = await newRolePage(browser, 'STUDENT');
    await student.page.goto('/dashboard/student');
    await expect(student.page.getByTestId('expected-grade-card')).toBeVisible();
    await attachScreenshot(student.page, 'actual-s-learn-1024x768');
    await student.context.close();

    const teacher = await newRolePage(browser, 'TEACHER');
    await teacher.page.goto('/dashboard/teacher/exams');
    await expect(teacher.page.getByTestId('teacher-exam-card')).toBeVisible();
    await attachScreenshot(teacher.page, 'actual-t-exam-1024x768');
    await teacher.context.close();
  });
});
