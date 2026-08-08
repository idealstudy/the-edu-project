import { BASE, newBrowser, login, shot, observer, domSnapshot } from './lib.mjs';

const rec = (o) => console.log('### ' + JSON.stringify(o));
const ATTEMPT = process.env.QA_ATTEMPT ?? '1248';
const { browser, context } = await newBrowser();
const page = await context.newPage();
try {
  await login(page, process.env.E2E_STUDENT_EMAIL, process.env.E2E_STUDENT_PASSWORD);
  await page.goto(`${BASE}/dashboard/student/exams/${ATTEMPT}`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  for (let q = 1; q <= 2; q += 1) {
    const choice = page.getByRole('button', { name: '5', exact: true }).or(page.getByRole('radio', { name: '5' }));
    if (await choice.count()) {
      await choice.first().click().catch(() => {});
      await page.waitForTimeout(1200);
    }
    const next = page.getByRole('button', { name: /다음 문항/ });
    if (await next.count()) { await next.first().click().catch(() => {}); await page.waitForTimeout(1500); }
  }
  await shot(page, 's6-00-answered');
  rec({ label: '답안 입력 후', text: (await domSnapshot(page)).slice(300, 900) });
  const obs = observer(page);
  await page.getByRole('button', { name: /답안 제출하기/ }).first().click().catch((e) => rec({ err: String(e).slice(0, 150) }));
  await page.waitForTimeout(3000);
  const confirm = page.getByRole('button', { name: /^제출$|제출하기|확인/ });
  if (await confirm.count()) { await confirm.last().click().catch(() => {}); }
  await page.waitForTimeout(9000);
  obs.stop();
  rec({ label: '제출', apiCalls: obs.calls, url: new URL(page.url()).pathname, text: (await domSnapshot(page)).slice(200, 1100) });
  await shot(page, 's6-01-submitted');
} catch (e) {
  rec({ error: String(e).slice(0, 800) });
  await shot(page, 's6-error');
} finally {
  await context.close().catch(() => {});
  await browser.close();
}
