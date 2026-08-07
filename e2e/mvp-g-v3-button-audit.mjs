// MVP-G v3 dev button audit. Real browser, real accounts, no API mocks.
import { chromium } from '@playwright/test';
import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const WEB_BASE = process.env.E2E_BASE_URL ?? 'https://dev.d-edu.site';
const OUTPUT =
  process.env.MVPG_BUTTON_EVIDENCE_PATH ?? '/tmp/mvpg-v30-button-audit.json';
const SCREEN_DIR = path.resolve(process.cwd(), '../docs/mvp-g/qa-screens');
const destructivePattern = /삭제|탈퇴|권한\s*회수|계정\s*정지|영구|내리기/;

const credentials = {
  STUDENT: required('E2E_STUDENT_EMAIL', 'E2E_STUDENT_PASSWORD'),
  TEACHER: required('E2E_TEACHER_EMAIL', 'E2E_TEACHER_PASSWORD'),
  ADMIN: required('E2E_ADMIN_EMAIL', 'E2E_ADMIN_PASSWORD'),
};

function required(emailName, passwordName) {
  const email = process.env[emailName];
  const password = process.env[passwordName];
  if (!email || !password) throw new Error(`Missing ${emailName}`);
  return { email, password };
}

function slug(value) {
  return value
    .replace(/^\/+/, '')
    .replace(/[^a-zA-Z0-9가-힣]+/g, '-')
    .replace(/^-|-$/g, '') || 'home';
}

async function settle(page, timeout = 800) {
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForLoadState('networkidle', { timeout }).catch(() => {});
  await page.locator('body').evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve))
      )
  );
}

async function bodyHash(page) {
  const text = await page.locator('body').innerText().catch(() => '');
  return createHash('sha256').update(text).digest('hex').slice(0, 16);
}

async function login(page, role) {
  await page.goto(`${WEB_BASE}/login`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('login-email-input').fill(credentials[role].email);
  await page.getByTestId('login-password-input').fill(credentials[role].password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 20_000,
  });
  await settle(page);
}

async function teacherRoomRoute(page) {
  const response = await page.request.get(
    `${WEB_BASE}/api/v1/teacher/dashboard/study-rooms`
  );
  if (!response.ok()) return null;
  const body = await response.json();
  const rooms = body.data ?? body;
  return Array.isArray(rooms) && rooms[0]?.id
    ? `/study-rooms/${rooms[0].id}/manage`
    : null;
}

async function routeList(page, role) {
  if (role === 'STUDENT') {
    return [
      '/dashboard/student',
      '/dashboard/student/exam-hall',
      '/dashboard/student/look-back',
      '/dashboard/student/unit-notes',
      '/dashboard/student/wrong-answers',
      '/tree',
      '/courses',
    ];
  }
  if (role === 'TEACHER') {
    const room = await teacherRoomRoute(page);
    return [
      '/dashboard/teacher',
      '/dashboard/teacher/exams',
      '/dashboard/teacher/my',
      ...(room ? [room] : []),
    ];
  }
  return [
    '/admin/members',
    '/admin/study-rooms',
    '/admin/public-exams',
    '/admin/question-bank',
    '/admin/consultations',
  ];
}

async function auditRoute(page, context, role, route) {
  await page.goto(`${WEB_BASE}${route}`, { waitUntil: 'domcontentloaded' });
  await settle(page);
  const screenPath = path.join(
    SCREEN_DIR,
    `button-audit-${role.toLowerCase()}-${slug(route)}.png`
  );
  await page.screenshot({ path: screenPath, fullPage: true });

  const descriptors = await page.locator('button:visible').evaluateAll((buttons) =>
    buttons.map((button, index) => ({
      index,
      label:
        button.innerText.trim() ||
        button.getAttribute('aria-label') ||
        button.getAttribute('title') ||
        button.getAttribute('data-testid') ||
        `button-${index + 1}`,
      disabled: button.disabled || button.getAttribute('aria-disabled') === 'true',
    }))
  );

  const rows = [];
  for (const descriptor of descriptors) {
    await page.goto(`${WEB_BASE}${route}`, { waitUntil: 'domcontentloaded' });
    await settle(page);
    const button = page.locator('button:visible').nth(descriptor.index);
    const label = (await button.innerText().catch(() => descriptor.label)).trim() || descriptor.label;
    const row = {
      role,
      route,
      button: label.slice(0, 120),
      index: descriptor.index,
      outcome: '',
      detail: '',
    };
    if (descriptor.disabled || (await button.isDisabled().catch(() => false))) {
      row.outcome = 'DISABLED';
      row.detail = '현재 사전 조건에서 비활성';
      rows.push(row);
      continue;
    }
    if (destructivePattern.test(label)) {
      row.outcome = 'SKIP_DESTRUCTIVE';
      row.detail = '전용 복구 계정 없는 파괴 동작';
      rows.push(row);
      continue;
    }

    const beforeUrl = page.url();
    const beforeHash = await bodyHash(page);
    const network = [];
    let dialogSeen = false;
    let fileChooserSeen = false;
    let popupSeen = false;
    const onResponse = (response) => {
      if (response.request().resourceType() === 'fetch' || response.request().resourceType() === 'xhr') {
        network.push({
          method: response.request().method(),
          path: new URL(response.url()).pathname,
          status: response.status(),
        });
      }
    };
    const onDialog = async (dialog) => {
      dialogSeen = true;
      await dialog.dismiss();
    };
    const onFileChooser = () => {
      fileChooserSeen = true;
    };
    const onPage = () => {
      popupSeen = true;
    };
    page.on('response', onResponse);
    page.on('dialog', onDialog);
    page.on('filechooser', onFileChooser);
    context.on('page', onPage);
    try {
      await button.click({ timeout: 8000, noWaitAfter: true });
      await settle(page, 500);
      const afterUrl = page.url();
      const afterHash = await bodyHash(page);
      const effects = [];
      if (afterUrl !== beforeUrl) effects.push(`NAVIGATED:${new URL(afterUrl).pathname}`);
      if (afterHash !== beforeHash) effects.push('DOM_CHANGED');
      if (network.length) effects.push(`NETWORK:${network.length}`);
      if (dialogSeen) effects.push('DIALOG');
      if (fileChooserSeen) effects.push('FILE_CHOOSER');
      if (popupSeen) effects.push('POPUP');
      row.outcome = effects.length ? 'PASS' : 'NO_EFFECT';
      row.detail = effects.join(', ') || 'URL, DOM, network, dialog 변화 없음';
      row.network = network.slice(0, 10);
    } catch (error) {
      row.outcome = 'CLICK_ERROR';
      row.detail = String(error.message ?? error).split('\n')[0].slice(0, 240);
    } finally {
      page.off('response', onResponse);
      page.off('dialog', onDialog);
      page.off('filechooser', onFileChooser);
      context.off('page', onPage);
    }
    rows.push(row);
  }
  return { route, screenshot: path.relative(process.cwd(), screenPath), rows };
}

async function auditLogout(page) {
  await page.goto(`${WEB_BASE}/dashboard/student`, { waitUntil: 'domcontentloaded' });
  await settle(page);
  const menu = page.getByRole('button', { name: '햄버거 메뉴' });
  if (await menu.isVisible().catch(() => false)) await menu.click();
  const logout = page.getByRole('button', { name: /로그아웃/ });
  if (!(await logout.isVisible().catch(() => false))) {
    return { role: 'STUDENT', route: '/dashboard/student', button: '로그아웃', outcome: 'NOT_FOUND', detail: '메뉴 안에서 버튼 미발견' };
  }
  await logout.click();
  await page.waitForURL(
    (url) => url.pathname === '/' || url.pathname.startsWith('/login'),
    { timeout: 15_000 }
  );
  await page.goto(`${WEB_BASE}/dashboard/student`, { waitUntil: 'domcontentloaded' });
  const protectedPath = new URL(page.url()).pathname;
  return {
    role: 'STUDENT',
    route: '/dashboard/student',
    button: '로그아웃',
    outcome: protectedPath.startsWith('/login') ? 'PASS' : 'FAIL',
    detail: `보호 경로 재진입 결과:${protectedPath}`,
  };
}

async function main() {
  await mkdir(SCREEN_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];
  let logout = null;
  try {
    for (const role of ['STUDENT', 'TEACHER', 'ADMIN']) {
      const context = await browser.newContext({ viewport: { width: 1024, height: 768 } });
      const page = await context.newPage();
      await login(page, role);
      const routes = await routeList(page, role);
      for (const route of routes) results.push(await auditRoute(page, context, role, route));
      if (role === 'STUDENT') logout = await auditLogout(page);
      await context.close();
    }
  } finally {
    await browser.close();
  }
  const rows = results.flatMap((result) => result.rows);
  const summary = Object.fromEntries(
    [...new Set(rows.map((row) => row.outcome))].map((outcome) => [
      outcome,
      rows.filter((row) => row.outcome === outcome).length,
    ])
  );
  const output = {
    generatedAt: new Date().toISOString(),
    webBase: WEB_BASE,
    summary,
    routeCount: results.length,
    buttonCount: rows.length,
    logout,
    results,
  };
  await writeFile(OUTPUT, `${JSON.stringify(output, null, 2)}\n`, { mode: 0o600 });
  console.log(JSON.stringify({ output: OUTPUT, routeCount: results.length, buttonCount: rows.length, summary, logout }));
  if ((summary.NO_EFFECT ?? 0) > 0 || (summary.CLICK_ERROR ?? 0) > 0) process.exitCode = 1;
}

main().catch((error) => {
  console.error(JSON.stringify({ fatal: String(error.message ?? error).slice(0, 240) }));
  process.exitCode = 1;
});
