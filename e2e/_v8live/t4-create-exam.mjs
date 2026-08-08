import { BASE, newBrowser, login, shot, observer, domSnapshot } from './lib.mjs';

const rec = (o) => console.log('### ' + JSON.stringify(o));
const { browser, context } = await newBrowser();
const page = await context.newPage();
try {
  await login(page, process.env.E2E_TEACHER_EMAIL, process.env.E2E_TEACHER_PASSWORD);
  await page.goto(`${BASE}/dashboard/teacher/exams?studyRoomId=494`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  const add = page.getByRole('button', { name: '담기', exact: true });
  rec({ label: '담기 버튼 수', count: await add.count() });
  await add.nth(0).click();
  await page.waitForTimeout(1200);
  await add.nth(1).click();
  await page.waitForTimeout(1500);
  await shot(page, 't4-00-picked');
  rec({ label: '담은 뒤 본문', text: (await domSnapshot(page)).slice(0, 900) });
  const buttons = await page.locator('button:visible').allInnerTexts();
  rec({ label: '보이는 버튼', items: [...new Set(buttons)].slice(0, 40) });
} catch (e) {
  rec({ error: String(e).slice(0, 800) });
  await shot(page, 't4-error');
} finally {
  await context.close().catch(() => {});
  await browser.close();
}
