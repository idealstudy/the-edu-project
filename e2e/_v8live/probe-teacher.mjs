import { BASE, newBrowser, login, shot, domSnapshot } from './lib.mjs';

const { browser, context } = await newBrowser();
const page = await context.newPage();
const out = {};
try {
  await login(page, process.env.E2E_TEACHER_EMAIL, process.env.E2E_TEACHER_PASSWORD);
  out.afterLoginUrl = page.url();
  await page.goto(`${BASE}/dashboard/teacher`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  out.finalUrl = page.url();
  out.dashText = (await domSnapshot(page)).slice(0, 2500);
  await shot(page, 'probe-teacher-dashboard');

  const rooms = await page.$$eval('a[href^="/study-rooms/"]', (as) =>
    as.map((a) => a.getAttribute('href'))
  );
  out.roomLinks = [...new Set(rooms)].slice(0, 20);

  const ids = [...new Set(rooms.map((h) => h.match(/\/study-rooms\/(\d+)/)?.[1]).filter(Boolean))];
  out.roomIds = ids;
  for (const id of ids.slice(0, 4)) {
    const r = await page.request.get(`${BASE}/api/v1/teacher/study-rooms/${id}/learning-management`);
    out[`lm_${id}`] = { status: r.status(), body: (await r.text()).slice(0, 1200) };
  }
} catch (e) {
  out.error = String(e).slice(0, 500);
} finally {
  console.log(JSON.stringify(out, null, 2));
  await context.close().catch(() => {});
  await browser.close();
}
