import { chromium } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const base = process.env.E2E_BASE_URL ?? 'https://dev.d-edu.site';
const resultPath = process.env.E2E_RESULT_PATH ?? '/tmp/mvpg-v70-A-revoke.json';

const credential = (prefix) => {
  const email = process.env[`${prefix}_EMAIL`];
  const password = process.env[`${prefix}_PASSWORD`];
  if (!email || !password) throw new Error(`Missing ${prefix} credentials`);
  return { email, password };
};

const adminCredential = credential('E2E_ADMIN');
const disposableCredential = credential('E2E_REVOKE_DISPOSABLE');

const unwrap = (body) =>
  body && typeof body === 'object' && 'data' in body ? body.data : body;

const login = async (page, account, expectSuccess) => {
  await page.goto(`${base}/login`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('login-email-input').fill(account.email);
  await page.getByTestId('login-password-input').fill(account.password);
  await page.getByTestId('login-submit-button').click();
  if (expectSuccess) {
    await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
      timeout: 20_000,
    });
    return true;
  }
  await page.waitForTimeout(1500);
  return new URL(page.url()).pathname.startsWith('/login');
};

const request = async (page, method, endpoint, data) => {
  const response = await page.request.fetch(`${base}${endpoint}`, { method, data });
  const body = await response.json().catch(() => null);
  return { status: response.status(), data: unwrap(body) };
};

const browser = await chromium.launch({ headless: true });
const adminContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
const admin = await adminContext.newPage();

try {
  await login(admin, adminCredential, true);
  const query = new URLSearchParams({
    role: 'STUDENT',
    keyword: disposableCredential.email,
    includeQaAccount: 'true',
    page: '0',
    size: '20',
  });
  const memberList = await request(admin, 'GET', `/api/v1/admin/members?${query}`);
  const target = memberList.data?.content?.find(
    (item) => item.email === disposableCredential.email
  );
  if (!target) throw new Error('Disposable member not found');

  const restored = await request(
    admin,
    'POST',
    `/api/v1/admin/members/${target.memberId}/restore`
  );
  const restoredContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const restoredPage = await restoredContext.newPage();
  const restoredLogin = await login(restoredPage, disposableCredential, true)
    .then(() => true)
    .catch(() => false);
  await restoredContext.close();

  const reason = `QA 7차 A조 권한 회수 ${new Date().toISOString()}`;
  const revoked = await request(
    admin,
    'POST',
    `/api/v1/admin/members/${target.memberId}/revoke`,
    { reason }
  );
  const detail = await request(
    admin,
    'GET',
    `/api/v1/admin/members/${target.memberId}`
  );
  const latestRevoke = detail.data?.actionHistory?.find(
    (item) => item.action === 'REVOKED' && item.reason === reason
  );

  const blockedContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const blockedPage = await blockedContext.newPage();
  const blockedLogin = await login(blockedPage, disposableCredential, false);
  await blockedContext.close();

  const result = {
    generatedAt: new Date().toISOString(),
    targetRole: target.role,
    restoreStatus: restored.status,
    restoredLogin,
    revokeStatus: revoked.status,
    revoked: detail.data?.revoked === true,
    revokedAtPresent: Boolean(detail.data?.revokedAt),
    actorPresent: Boolean(latestRevoke?.actorId),
    actionTimePresent: Boolean(latestRevoke?.actedAt),
    reasonMatched: Boolean(latestRevoke),
    blockedLogin,
  };
  result.status =
    result.restoreStatus === 200 &&
    result.restoredLogin &&
    result.revokeStatus === 200 &&
    result.revoked &&
    result.revokedAtPresent &&
    result.actorPresent &&
    result.actionTimePresent &&
    result.reasonMatched &&
    result.blockedLogin
      ? 'PASS'
      : 'FAIL';
  await writeFile(resultPath, JSON.stringify(result, null, 2));
  process.stdout.write(`${JSON.stringify({ status: result.status })}\n`);
  if (result.status !== 'PASS') process.exitCode = 1;
} finally {
  await adminContext.close().catch(() => {});
  await browser.close();
}
