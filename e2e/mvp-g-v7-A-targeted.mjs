import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const base = process.env.E2E_BASE_URL ?? 'https://dev.d-edu.site';
const resultPath = process.env.E2E_RESULT_PATH ?? '/tmp/mvpg-v70-A-targeted.json';
const screenDir = path.resolve(
  process.env.E2E_SCREEN_DIR ?? '../docs/mvp-g/qa-screens-v7-A'
);

const email = process.env.E2E_STUDENT_NONOTE_EMAIL;
const password = process.env.E2E_STUDENT_NONOTE_PASSWORD;
if (!email || !password) throw new Error('Missing E2E_STUDENT_NONOTE credentials');

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1024, height: 768 } });
const page = await context.newPage();

try {
  await page.goto(`${base}/login`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('login-email-input').fill(email);
  await page.getByTestId('login-password-input').fill(password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 20_000,
  });

  await page.goto(`${base}/dashboard/student/unit-notes`, {
    waitUntil: 'domcontentloaded',
  });
  const firstSubject = page.getByRole('link', { name: '이어서 정리하기' });
  await firstSubject.waitFor({ state: 'visible', timeout: 20_000 });
  const overviewHref = await firstSubject.getAttribute('href');
  await firstSubject.click();
  await page.waitForURL(/\/dashboard\/student\/unit-notes\/\d+/, {
    timeout: 20_000,
  });
  await page.waitForLoadState('networkidle', { timeout: 5_000 }).catch(() => {});

  const penStart = page.getByTestId('unit-note-open-pen');
  const penStartCount = await penStart.count();
  const penStartText = penStartCount ? (await penStart.innerText()).trim() : '';
  const pageRows = await page.locator('[data-testid^="unit-note-concept-row-"]').count();
  if (penStartCount) {
    await penStart.click();
    await page.getByTestId('unit-note-editor-first-view').waitFor({
      state: 'visible',
      timeout: 15_000,
    });
  }
  const editorVisible =
    (await page.getByTestId('unit-note-editor-first-view').count()) === 1;
  await mkdir(screenDir, { recursive: true });
  const screen = path.join(screenDir, 'actual-s-note-blank-editor-1024x768.png');
  await page.screenshot({ path: screen, fullPage: false });

  const result = {
    generatedAt: new Date().toISOString(),
    check: 'E5',
    overviewHref,
    detailUrlPath: new URL(page.url()).pathname,
    pageRows,
    penStartCount,
    penStartText,
    editorVisible,
    status:
      pageRows > 0 &&
      penStartCount === 1 &&
      penStartText === '펜으로 시작' &&
      editorVisible
        ? 'PASS'
        : 'FAIL',
    screenshot: path.relative(path.resolve(process.cwd(), '..'), screen),
  };
  await writeFile(resultPath, JSON.stringify(result, null, 2));
  process.stdout.write(`${JSON.stringify({ status: result.status })}\n`);
  if (result.status !== 'PASS') process.exitCode = 1;
} finally {
  await context.close().catch(() => {});
  await browser.close();
}
