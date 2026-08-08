import { BASE, newBrowser, login, shot, observer, domSnapshot } from './lib.mjs';

const rec = (o) => console.log('### ' + JSON.stringify(o));
const { browser, context } = await newBrowser();
const page = await context.newPage();
try {
  await login(page, process.env.E2E_TEACHER_EMAIL, process.env.E2E_TEACHER_PASSWORD);
  await page.goto(`${BASE}/dashboard/teacher/exams?studyRoomId=494`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  const add = page.getByRole('button', { name: '담기', exact: true });
  await add.nth(0).click();
  await page.waitForTimeout(1000);
  await add.nth(0).click();
  await page.waitForTimeout(1500);
  const obs = observer(page);
  await page.getByRole('button', { name: '시험 내기' }).first().click();
  await page.waitForTimeout(7000);
  obs.stop();
  rec({ label: '시험 내기', apiCalls: obs.calls, url: new URL(page.url()).pathname, text: (await domSnapshot(page)).slice(0, 700) });
  await shot(page, 't5-exam-issued');
} catch (e) {
  rec({ error: String(e).slice(0, 800) });
  await shot(page, 't5-error');
} finally {
  await context.close().catch(() => {});
  await browser.close();
}
