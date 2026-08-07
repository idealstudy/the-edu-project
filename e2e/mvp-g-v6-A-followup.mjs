import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const base = process.env.E2E_BASE_URL ?? 'https://dev.d-edu.site';
const out = '/tmp/mvpg-v60-A-followup.json';
const screens = path.resolve(process.cwd(), '../docs/mvp-g/qa-screens-v6');

const credential = (name) => {
  const email = process.env[`${name}_EMAIL`];
  const password = process.env[`${name}_PASSWORD`];
  if (!email || !password) throw new Error(`Missing ${name} credentials`);
  return { email, password };
};

const unwrap = (body) =>
  body && typeof body === 'object' && 'data' in body ? body.data : body;

const login = async (page, account) => {
  await page.goto(`${base}/login`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('login-email-input').fill(account.email);
  await page.getByTestId('login-password-input').fill(account.password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 20_000,
  });
};

const get = async (page, endpoint) => {
  const response = await page.request.get(`${base}${endpoint}`);
  const body = await response.json().catch(() => null);
  return { status: response.status(), data: unwrap(body) };
};

const settle = async (page) => {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});
};

const shot = async (page, name) => {
  await mkdir(screens, { recursive: true });
  const file = path.join(screens, `${name}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return path.relative(path.resolve(process.cwd(), '..'), file);
};

const browser = await chromium.launch({ headless: true });
const adminContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
const boundaryContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });

try {
  const admin = await adminContext.newPage();
  const boundary = await boundaryContext.newPage();
  await login(admin, credential('E2E_ADMIN'));
  await login(boundary, credential('E2E_STUDENT_BOUNDARY'));

  const members = {};
  const membersWithoutQa = {};
  for (const role of ['STUDENT', 'TEACHER', 'PARENT']) {
    const response = await get(
      admin,
      `/api/v1/admin/members?role=${role}&includeQaAccount=true&page=0&size=1`
    );
    members[role] = { status: response.status, total: response.data?.totalElements ?? null };
    const defaultResponse = await get(
      admin,
      `/api/v1/admin/members?role=${role}&includeQaAccount=false&page=0&size=1`
    );
    membersWithoutQa[role] = {
      status: defaultResponse.status,
      total: defaultResponse.data?.totalElements ?? null,
    };
  }
  const summary = await get(admin, '/api/v1/admin/summary');
  const leads = await get(admin, '/api/v1/admin/consultation-leads?page=0&size=100');
  const cases = await get(admin, '/api/v1/admin/consultation-cases?page=0&size=20');

  await admin.goto(`${base}/admin/members`, { waitUntil: 'domcontentloaded' });
  await settle(admin);
  const page1Rows = await admin.locator('tbody tr').count();
  const page1First = await admin.locator('tbody tr').first().innerText().catch(() => '');
  const memberPage1 = await shot(admin, 'actual-admin-members-scale-page1-1024x768');
  const next = admin.getByRole('button', { name: '다음 페이지로 이동' });
  const nextEnabled = (await next.count()) === 1 && !(await next.isDisabled());
  if (nextEnabled) {
    await next.click();
    await settle(admin);
    await admin.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 15_000 });
  }
  const page2Rows = await admin.locator('tbody tr').count();
  const page2First = await admin.locator('tbody tr').first().innerText().catch(() => '');
  const memberPage2 = await shot(admin, 'actual-admin-members-scale-page2-1024x768');
  const searchbox = admin.getByRole('searchbox', { name: '' });
  await searchbox.fill('example.test');
  await searchbox.press('Enter');
  await settle(admin);
  await admin.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 15_000 });
  const searchRows = await admin.locator('tbody tr').count();
  const memberSearch = await shot(admin, 'actual-admin-members-scale-search-1024x768');

  let unknownSignup = null;
  const defaultStudentTotal = membersWithoutQa.STUDENT?.total ?? 0;
  const defaultStudentPages = Math.ceil(defaultStudentTotal / 100);
  for (let pageIndex = Math.max(0, defaultStudentPages - 6); pageIndex < defaultStudentPages; pageIndex += 1) {
    const response = await get(
      admin,
      `/api/v1/admin/members?role=STUDENT&includeQaAccount=false&page=${pageIndex}&size=100`
    );
    unknownSignup = response.data?.content?.find(
      (item) => item.signupPath === null && item.signupAt < '2026-08-01'
    );
    if (unknownSignup) break;
  }
  let unknownSignupLabel = false;
  let unknownSignupScreen = null;
  if (unknownSignup?.email) {
    await searchbox.fill(unknownSignup.email);
    await searchbox.press('Enter');
    await settle(admin);
    await admin.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 15_000 });
    unknownSignupLabel = (await admin.getByText('2026년 8월 이전 경로 미상').count()) > 0;
    unknownSignupScreen = await shot(admin, 'actual-admin-members-unknown-signup-1024x768');
  }

  await admin.goto(`${base}/admin/members`, { waitUntil: 'domcontentloaded' });
  await settle(admin);
  await admin.getByRole('switch', { name: '점검용 계정 포함' }).click();
  await admin.getByRole('searchbox').fill(credential('E2E_REVOKE_DISPOSABLE').email);
  await admin.getByRole('searchbox').press('Enter');
  await settle(admin);
  await admin.locator('tbody tr').first().waitFor({ state: 'visible', timeout: 15_000 });
  const qaToggleRows = await admin.locator('tbody tr').count();
  const qaToggleScreen = await shot(admin, 'actual-admin-members-qa-toggle-1024x768');

  await admin.goto(`${base}/admin/consultations`, { waitUntil: 'domcontentloaded' });
  await settle(admin);
  const consultationRows = await admin.locator('tbody tr').count();
  const consultationBody = await admin.locator('body').innerText();
  const consultationScreen = await shot(admin, 'actual-admin-consultations-scale-1024x768');

  const exams = await get(boundary, '/api/v1/student/exams');
  const examSummary = Array.isArray(exams.data)
    ? exams.data.map((item) => ({
        title: item.title,
        totalQuestions: item.totalQuestions,
        status: item.status,
        hasAttemptId: Boolean(item.attemptId),
      }))
    : [];

  const result = {
    generatedAt: new Date().toISOString(),
    members: {
      roles: members,
      roleTotal: Object.values(members).reduce((sum, item) => sum + (item.total ?? 0), 0),
      rolesWithoutQa: membersWithoutQa,
      roleTotalWithoutQa: Object.values(membersWithoutQa).reduce(
        (sum, item) => sum + (item.total ?? 0),
        0
      ),
      summaryStatus: summary.status,
      summaryTotalMemberCount: summary.data?.totalMemberCount ?? null,
      ui: {
        page1Rows,
        page2Rows,
        pageChanged: Boolean(page1First) && Boolean(page2First) && page1First !== page2First,
        searchRows,
        unknownSignupLabel,
        qaToggleRows,
        screenshots: [
          memberPage1,
          memberPage2,
          memberSearch,
          unknownSignupScreen,
          qaToggleScreen,
        ].filter(Boolean),
      },
    },
    consultations: {
      leadStatus: leads.status,
      leadTotal: leads.data?.totalElements ?? null,
      leadErrorCode: leads.data?.code ?? null,
      leadErrorMessage: leads.data?.message ?? null,
      caseStatus: cases.status,
      caseTotal: cases.data?.totalElements ?? null,
      uiRows: consultationRows,
      uiHasLoadError: consultationBody.includes('문의와 상담 목록을 불러오지 못했어요'),
      screenshot: consultationScreen,
    },
    boundaryExams: { status: exams.status, items: examSummary },
  };
  await writeFile(out, JSON.stringify(result, null, 2));
  process.stdout.write(`${out}\n`);
} finally {
  await adminContext.close().catch(() => {});
  await boundaryContext.close().catch(() => {});
  await browser.close();
}
