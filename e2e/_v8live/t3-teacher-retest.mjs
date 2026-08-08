import { BASE, newBrowser, login, shot, observer, domSnapshot } from './lib.mjs';

const rec = (o) => console.log('### ' + JSON.stringify(o));
const { browser, context } = await newBrowser();
const page = await context.newPage();
try {
  await login(page, process.env.E2E_TEACHER_EMAIL, process.env.E2E_TEACHER_PASSWORD);

  /* 3. 카드 ··· > 학생 초대 (깨끗한 상태에서 다시) */
  await page.goto(`${BASE}/dashboard/teacher`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  await page.locator('button:has-text("···")').first().click();
  await page.waitForTimeout(1500);
  await shot(page, 't3-00-menu');
  const invite = page.getByText('학생 초대', { exact: true });
  rec({ label: '학생 초대 항목 수', count: await invite.count() });
  const obs = observer(page);
  await invite.first().click();
  await page.waitForTimeout(5000);
  obs.stop();
  rec({ label: '3 학생 초대 클릭', url: new URL(page.url()).pathname, apiCalls: obs.calls.slice(0, 6) });
  await shot(page, 't3-01-invite-arrived');

  /* 시험 열기 화면 확인 (오늘 EXAM 오답을 만들 수 있는지) */
  await page.goto(`${BASE}/dashboard/teacher/exams?studyRoomId=494`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  await shot(page, 't3-02-exams');
  rec({ label: '선생님 시험 화면', url: new URL(page.url()).pathname, text: (await domSnapshot(page)).slice(0, 1200) });
} catch (e) {
  rec({ error: String(e).slice(0, 800) });
  await shot(page, 't3-error');
} finally {
  await context.close().catch(() => {});
  await browser.close();
}
