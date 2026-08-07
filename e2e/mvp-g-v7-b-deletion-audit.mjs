import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const baseURL = process.env.E2E_BASE_URL ?? 'https://dev.d-edu.site';
const outputPath = '/tmp/mvpg-v7-b-deletion-audit.json';
const screenDir = path.resolve(process.cwd(), '../docs/mvp-g/qa-screens');

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
  await page.goto(`${baseURL}/login`);
  await page.getByTestId('login-email-input').fill(credentials[role].email);
  await page
    .getByTestId('login-password-input')
    .fill(credentials[role].password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 20_000,
  });
  await settle(page);
}

async function inspectRoute(page, route, screenshotName, checks) {
  await page.goto(`${baseURL}${route}`);
  await settle(page);
  const results = {};
  for (const [name, locator] of Object.entries(checks)) {
    results[name] = await locator(page).count();
  }
  await page.screenshot({
    path: path.join(screenDir, screenshotName),
    fullPage: true,
  });
  return {
    requested: route,
    actual: new URL(page.url()).pathname,
    checks: results,
    screenshot: `docs/mvp-g/qa-screens/${screenshotName}`,
  };
}

async function main() {
  await mkdir(screenDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const studentContext = await browser.newContext({
      viewport: { width: 1024, height: 768 },
    });
    const teacherContext = await browser.newContext({
      viewport: { width: 1024, height: 768 },
    });
    const student = await studentContext.newPage();
    const teacher = await teacherContext.newPage();
    await login(student, 'STUDENT');
    await login(teacher, 'TEACHER');

    const growth = await inspectRoute(
      student,
      '/dashboard/student/results',
      'v7-b-growth-route.png',
      {
        learningMap: (page) => page.getByText('내 학습 지도', { exact: true }),
        level: (page) => page.getByText(/^Lv\./),
      }
    );

    const timerRoutes = [];
    for (const route of [
      '/dashboard/student',
      '/dashboard/student/results',
      '/dashboard/student/unit-notes',
    ]) {
      timerRoutes.push(
        await inspectRoute(
          student,
          route,
          `v7-b-timer-${route.split('/').filter(Boolean).at(-1)}.png`,
          {
            timerControl: (page) =>
              page
                .getByRole('button', {
                  name: /타이머|학습 시작|공부 시작|학습 시간 측정/,
                })
                .or(
                  page.getByRole('link', {
                    name: /타이머|학습 시작|공부 시작|학습 시간 측정/,
                  })
                ),
          }
        )
      );
    }

    const onboarding = await inspectRoute(
      student,
      '/onboarding',
      'v7-b-onboarding-route.png',
      {
        onboardingHeading: (page) => page.getByText(/온보딩|학습 설정|학년/),
        legacyInviteChecklist: (page) =>
          page.getByText('선생님 초대 받기', {
            exact: true,
          }),
      }
    );

    const roomsResponse = await teacher.request.get(
      `${baseURL}/api/v1/teacher/dashboard/study-rooms`
    );
    const roomsBody = await roomsResponse.json();
    const rooms = roomsBody.data ?? roomsBody;
    const roomId = Array.isArray(rooms) ? rooms[0]?.id : null;
    const exam = await inspectRoute(
      teacher,
      roomId
        ? `/dashboard/teacher/exams?studyRoomId=${roomId}`
        : '/dashboard/teacher/exams',
      'v7-b-teacher-exam-route.png',
      {
        examHeading: (page) => page.getByText(/시험 만들기|시험 열기/),
        selectedRoom: (page) =>
          roomId
            ? page.locator(`[data-study-room-id="${roomId}"]`)
            : page.locator('body').filter({ hasText: '수업' }),
      }
    );

    const teacherDashboard = await inspectRoute(
      teacher,
      '/dashboard/teacher',
      'v7-b-teacher-removed-surfaces.png',
      {
        aiComment: (page) =>
          page.getByText('이번 주 AI 코멘트', { exact: true }),
        teacherOnboarding: (page) => page.getByTestId('teacher-onboarding'),
        learningInbox: (page) => page.getByTestId('teacher-learning-inbox'),
      }
    );

    const studentCoach = await inspectRoute(
      student,
      '/dashboard/student/look-back',
      'v7-b-student-coach-message.png',
      {
        coachMessage: (page) =>
          page.getByText('코치가 보낸 말', { exact: true }),
      }
    );

    const result = {
      generatedAt: new Date().toISOString(),
      growth,
      timerRoutes,
      onboarding,
      exam,
      teacherDashboard,
      studentCoach,
    };
    await writeFile(outputPath, `${JSON.stringify(result, null, 2)}\n`, {
      mode: 0o600,
    });
    console.log(
      JSON.stringify({
        outputPath,
        growth: growth.checks,
        timerControls: timerRoutes.reduce(
          (sum, route) => sum + route.checks.timerControl,
          0
        ),
        onboarding: onboarding.checks,
        exam: exam.checks,
        teacherDashboard: teacherDashboard.checks,
        studentCoach: studentCoach.checks,
      })
    );
    await studentContext.close();
    await teacherContext.close();
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
