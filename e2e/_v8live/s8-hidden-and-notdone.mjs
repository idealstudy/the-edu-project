import { BASE, newBrowser, login, shot, observer, domSnapshot } from './lib.mjs';

const rec = (o) => console.log('### ' + JSON.stringify(o));
const { browser, context } = await newBrowser();
const page = await context.newPage();
try {
  await login(page, process.env.E2E_STUDENT_EMAIL, process.env.E2E_STUDENT_PASSWORD);

  /* 10. 숨긴 것 보기 */
  await page.goto(`${BASE}/dashboard/student/unit-notes/17`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  let obs = observer(page);
  await page.getByRole('button', { name: /숨기기/ }).first().click();
  await page.waitForTimeout(4500);
  obs.stop();
  let t = await domSnapshot(page);
  rec({ label: '선생님 노트 숨기기', apiCalls: obs.calls, 숨김블록생김: t.includes('숨긴 선생님 노트') });
  await shot(page, 's8-00-hidden-block');
  const summary = page.getByText(/숨긴 선생님 노트 .*숨긴\s*것 보기/);
  rec({ label: '10 숨긴 것 보기 요약줄', count: await summary.count(), text: await summary.first().innerText().catch(() => null) });
  if (await summary.count()) {
    await summary.first().click();
    await page.waitForTimeout(2500);
    t = await domSnapshot(page);
    rec({ label: '10 숨긴 것 보기 클릭', 다시꺼내기노출: t.includes('다시 꺼내기'), 학생이숨김: t.includes('학생이 숨김') });
    await shot(page, 's8-01-hidden-open');
    obs = observer(page);
    await page.getByRole('button', { name: /다시 꺼내기/ }).first().click();
    await page.waitForTimeout(4500);
    obs.stop();
    rec({ label: '10 다시 꺼내기', apiCalls: obs.calls, 숨김블록남음: (await domSnapshot(page)).includes('숨긴 선생님 노트') });
    await shot(page, 's8-02-unhidden');
  }

  /* A4 재검증용: 못했어요 를 하나 더 만든다 */
  await page.goto(`${BASE}/dashboard/student`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  await page.getByRole('button', { name: '못했어요', exact: true }).first().click();
  await page.waitForTimeout(1500);
  await page.locator('input:visible, textarea:visible').first().fill('QA v8 라이브 2회차: 확인함 검증용');
  obs = observer(page);
  await page.getByRole('button', { name: /^이유 저장$|^저장$/ }).first().click();
  await page.waitForTimeout(4500);
  obs.stop();
  rec({ label: '못했어요 2회차 저장', apiCalls: obs.calls });
} catch (e) {
  rec({ error: String(e).slice(0, 800) });
  await shot(page, 's8-error');
} finally {
  await context.close().catch(() => {});
  await browser.close();
}
