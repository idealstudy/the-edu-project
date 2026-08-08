import { BASE, newBrowser, login, shot, domSnapshot } from './lib.mjs';

const out = {};
const { browser, context } = await newBrowser();
const page = await context.newPage();
const visit = async (key, path) => {
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  out[key] = { url: new URL(page.url()).pathname, text: (await domSnapshot(page)).slice(0, 2200) };
  await shot(page, `probe-${key}`);
};
try {
  await login(page, process.env.E2E_TEACHER_EMAIL, process.env.E2E_TEACHER_PASSWORD);
  await visit('teacher-member', '/study-rooms/494/member');
  await visit('teacher-mypage', '/dashboard/teacher/my');
  const inv = await page.request.get(`${BASE}/api/v1/teacher/study-rooms/494/invitation`);
  out.invitation = { status: inv.status(), body: (await inv.text()).slice(0, 400) };
} catch (e) {
  out.error = String(e).slice(0, 600);
} finally {
  console.log(JSON.stringify(out, null, 2));
  await context.close().catch(() => {});
  await browser.close();
}
