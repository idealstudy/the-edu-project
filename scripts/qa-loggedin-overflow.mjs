// phase1 web-mobile-v12: logged-in screen overflow check (390px), using the
// repo's existing e2e UI-login method (e2e/helpers/mvp-e-devremote.ts
// loginWithCredentials: fill testid inputs, submit, wait for auth cookies).
import { chromium } from 'playwright';

const BASE = process.env.QA_BASE_URL || 'http://localhost:4100';
const email = process.env.E2E_STUDENT_EMAIL;
const password = process.env.E2E_STUDENT_PASSWORD;
const teacherEmail = process.env.E2E_TEACHER_EMAIL;
const teacherPassword = process.env.E2E_TEACHER_PASSWORD;
if (!email || !password || !teacherEmail || !teacherPassword) {
  console.error('missing E2E credentials in env');
  process.exit(1);
}

async function loginUI(page, em, pw) {
  await page.goto(BASE + '/login', { waitUntil: 'domcontentloaded' });
  await page.getByTestId('login-email-input').fill(em);
  await page.getByTestId('login-password-input').fill(pw);
  const respPromise = page.waitForResponse(
    (r) => r.url().includes('/api/v1/auth/login') && r.request().method() === 'POST',
    { timeout: 30000 }
  );
  await page.getByTestId('login-submit-button').click();
  const resp = await respPromise;
  return resp.status();
}

async function measure(page, path) {
  try {
    await page.goto(BASE + path, { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(2000);
    const m = await page.evaluate(() => ({
      sw: document.documentElement.scrollWidth,
      cw: document.documentElement.clientWidth,
      title: document.title,
    }));
    return { path, overflow: m.sw - m.cw, ...m };
  } catch (e) {
    return { path, error: String(e).slice(0, 150) };
  }
}

const browser = await chromium.launch();
const results = [];

// student
{
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  const status = await loginUI(page, email, password);
  results.push({ role: 'student', loginStatus: status });
  for (const p of ['/dashboard/student', '/study-rooms/20/note']) {
    results.push({ role: 'student', ...(await measure(page, p)) });
  }
  await page.close();
}

// teacher
{
  const page = await browser.newPage({ viewport: { width: 390, height: 900 } });
  const status = await loginUI(page, teacherEmail, teacherPassword);
  results.push({ role: 'teacher', loginStatus: status });
  for (const p of ['/dashboard/teacher', '/study-rooms/20/note']) {
    results.push({ role: 'teacher', ...(await measure(page, p)) });
  }
  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
