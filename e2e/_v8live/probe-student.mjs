import { BASE, newBrowser, login, shot, domSnapshot } from './lib.mjs';

const out = {};
const { browser, context } = await newBrowser();
const page = await context.newPage();
const visit = async (key, path) => {
  await page.goto(`${BASE}${path}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  out[key] = { url: new URL(page.url()).pathname, text: (await domSnapshot(page)).slice(0, 1800) };
  await shot(page, `probe-${key}`);
};
try {
  await login(page, process.env.E2E_STUDENT_EMAIL, process.env.E2E_STUDENT_PASSWORD);
  await visit('student-home', '/dashboard/student');
  await visit('look-back', '/dashboard/student/look-back');
  await visit('unit-notes', '/dashboard/student/unit-notes');
  await visit('exam-hall', '/dashboard/student/exam-hall');
  await visit('wrong-answers', '/dashboard/student/wrong-answers');
  await visit('mypage-oc', '/mypage/open-challenge');
} catch (e) {
  out.error = String(e).slice(0, 600);
} finally {
  console.log(JSON.stringify(out, null, 2));
  await context.close().catch(() => {});
  await browser.close();
}
