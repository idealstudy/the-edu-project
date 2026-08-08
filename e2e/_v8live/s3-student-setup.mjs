import { BASE, newBrowser, login, shot, observer, domSnapshot } from './lib.mjs';

const rec = (o) => console.log('### ' + JSON.stringify(o));
const { browser, context } = await newBrowser();
const page = await context.newPage();

async function click(label, locator, opts = {}) {
  if ((await locator.count()) === 0) return rec({ label, result: 'NOT_FOUND' });
  const before = (await domSnapshot(page)).slice(0, 8000);
  const beforeUrl = page.url();
  const obs = observer(page);
  await locator.first().click({ timeout: 12000 }).catch((e) => rec({ label, clickError: String(e).slice(0, 200) }));
  await page.waitForTimeout(opts.wait ?? 3000);
  obs.stop();
  rec({
    label,
    urlChanged: beforeUrl !== page.url() ? `${new URL(beforeUrl).pathname} -> ${new URL(page.url()).pathname}` : false,
    apiCalls: obs.calls,
    domChanged: before !== (await domSnapshot(page)).slice(0, 8000),
  });
  return true;
}

try {
  await login(page, process.env.E2E_STUDENT_EMAIL, process.env.E2E_STUDENT_PASSWORD);

  /* (가) 오늘 할 일에 "못했어요" 를 눌러 선생님 처리행(NOT_DONE)을 만든다 */
  await page.goto(`${BASE}/dashboard/student`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  const notDone = page.getByRole('button', { name: '못했어요', exact: true });
  rec({ label: '못했어요 버튼 수', count: await notDone.count() });
  await click('학생 · 못했어요', notDone, { wait: 4000 });
  await shot(page, 's3-notdone');
  rec({ label: '못했어요 클릭 후 본문', text: (await domSnapshot(page)).slice(1200, 2600) });

  /* (나) 오늘 시험을 하나 치러 EXAM 오답을 오늘 날짜로 만든다 */
  await page.goto(`${BASE}/dashboard/student/exam-hall`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  const examLink = page.locator('a[href^="/dashboard/student/exams/"]').first();
  const href = await examLink.getAttribute('href').catch(() => null);
  rec({ label: '시험 링크', href, count: await page.locator('a[href^="/dashboard/student/exams/"]').count() });
  if (href) {
    await page.goto(`${BASE}${href}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(7000);
    await shot(page, 's3-exam-open');
    rec({ label: '시험 화면', url: new URL(page.url()).pathname, text: (await domSnapshot(page)).slice(0, 1500) });
  }
} catch (e) {
  rec({ error: String(e).slice(0, 800) });
  await shot(page, 's3-error');
} finally {
  await context.close().catch(() => {});
  await browser.close();
}
