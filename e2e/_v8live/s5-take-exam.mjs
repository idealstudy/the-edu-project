import { BASE, newBrowser, login, shot, observer, domSnapshot } from './lib.mjs';

const rec = (o) => console.log('### ' + JSON.stringify(o));
const { browser, context } = await newBrowser();
const page = await context.newPage();
try {
  await login(page, process.env.E2E_STUDENT_EMAIL, process.env.E2E_STUDENT_PASSWORD);
  await page.goto(`${BASE}/dashboard/student/exam-hall`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  await shot(page, 's5-00-exam-hall');
  rec({ label: '응시장 상단', text: (await domSnapshot(page)).slice(200, 1000) });
  const start = page.getByRole('link', { name: /시험 보기|응시하기|시작/ }).or(page.getByRole('button', { name: /시험 보기|응시하기|시작/ }));
  rec({ label: '응시 버튼', count: await start.count(), texts: (await start.allInnerTexts().catch(() => [])).slice(0, 5) });
  const links = await page.$$eval('a[href*="/exams/"]', (as) => as.slice(0, 5).map((a) => [a.getAttribute('href'), a.innerText.replace(/\s+/g, ' ').slice(0, 60)]));
  rec({ label: '시험 링크 상위', links });
  if (await start.count()) {
    const obs = observer(page);
    await start.first().click();
    await page.waitForTimeout(8000);
    obs.stop();
    rec({ label: '응시 시작', url: new URL(page.url()).pathname, apiCalls: obs.calls.slice(0, 8) });
    await shot(page, 's5-01-attempt');
    rec({ label: '응시 화면', text: (await domSnapshot(page)).slice(0, 1200) });
  }
} catch (e) {
  rec({ error: String(e).slice(0, 800) });
  await shot(page, 's5-error');
} finally {
  await context.close().catch(() => {});
  await browser.close();
}
