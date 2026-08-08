import { BASE, newBrowser, login, shot, observer, domSnapshot } from './lib.mjs';

const rec = (o) => console.log('### ' + JSON.stringify(o));
const { browser, context } = await newBrowser();
const page = await context.newPage();
try {
  await login(page, process.env.E2E_STUDENT_EMAIL, process.env.E2E_STUDENT_PASSWORD);

  /* (가) 못했어요 사유를 실제로 저장해 선생님 처리행을 만든다 */
  await page.goto(`${BASE}/dashboard/student`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  await page.getByRole('button', { name: '못했어요', exact: true }).first().click();
  await page.waitForTimeout(1500);
  const box = page.locator('input:visible, textarea:visible');
  rec({ label: '사유 입력창 수', count: await box.count() });
  await box.first().fill('QA v8 라이브: 시간이 모자랐습니다').catch(() => {});
  const obs = observer(page);
  await page.getByRole('button', { name: /^이유 저장$|^저장$/ }).first().click().catch((e) => rec({ saveErr: String(e).slice(0, 150) }));
  await page.waitForTimeout(4000);
  obs.stop();
  rec({ label: '못했어요 사유 저장', apiCalls: obs.calls });
  await shot(page, 's4-notdone-saved');

  /* (나) 아직 응시하지 않은 시험 찾기 */
  const r = await page.request.get(`${BASE}/api/v1/student/exams?page=0&size=50`);
  const t = await r.text();
  rec({ label: '학생 시험 목록 API', status: r.status(), body: t.slice(0, 900) });
} catch (e) {
  rec({ error: String(e).slice(0, 800) });
  await shot(page, 's4-error');
} finally {
  await context.close().catch(() => {});
  await browser.close();
}
