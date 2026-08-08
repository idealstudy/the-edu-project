import { BASE, newBrowser, login, shot, observer, domSnapshot } from './lib.mjs';

const rec = (o) => console.log('### ' + JSON.stringify(o));
const { browser, context } = await newBrowser();
const page = await context.newPage();
try {
  /* 초대 코드 입력 화면: 로그인 전에 토큰 없이 연다 */
  await page.goto(`${BASE}/invite`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  rec({ label: '/invite 토큰 없이', url: new URL(page.url()).pathname, text: (await domSnapshot(page)).slice(0, 700), inputs: await page.locator('input:visible').count() });
  await shot(page, 't7-00-invite-no-token');
  const submit = page.getByRole('button', { name: /들어가기|확인|이동|참여/ });
  rec({ label: '/invite 버튼', texts: (await submit.allInnerTexts().catch(() => [])).slice(0, 5) });
  if (await page.locator('input:visible').count()) {
    await page.locator('input:visible').first().fill('afbdb7d5-6c8e-42f7-870c-a1faca5de6b4');
    await page.waitForTimeout(500);
    const obs = observer(page);
    await submit.first().click().catch((e) => rec({ err: String(e).slice(0, 150) }));
    await page.waitForTimeout(6000);
    obs.stop();
    rec({ label: '/invite 코드 넣고 이동', url: page.url().replace(/token=[^&]*/, 'token=***'), apiCalls: obs.calls.slice(0, 5), text: (await domSnapshot(page)).slice(0, 500) });
    await shot(page, 't7-01-invite-submitted');
  }

  /* A4 재검증: 확인함(할 일) */
  await login(page, process.env.E2E_TEACHER_EMAIL, process.env.E2E_TEACHER_PASSWORD);
  await page.goto(`${BASE}/study-rooms/494/manage`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('learning-management-tab').waitFor({ timeout: 20000 });
  await page.waitForTimeout(5000);
  const rows = () => page.locator('[data-testid^="learning-management-todo-row-"]').filter({ hasText: '못했어요' });
  const pending = async () => (await page.getByTestId('learning-management-pending-count').innerText()).trim();
  rec({ label: '못했어요 행', count: await rows().count(), text: await rows().first().innerText().catch(() => null), pending: await pending() });
  await shot(page, 't7-02-notdone-row');
  if (await rows().count()) {
    const obs = observer(page);
    await rows().first().getByRole('button', { name: '확인함', exact: true }).click();
    await page.waitForTimeout(4500);
    obs.stop();
    rec({ label: 'A4 확인함(할 일)', apiCalls: obs.calls, 남은행: await rows().count(), pending: await pending() });
    await shot(page, 't7-03-ack-todo');
  }
} catch (e) {
  rec({ error: String(e).slice(0, 800) });
  await shot(page, 't7-error');
} finally {
  await context.close().catch(() => {});
  await browser.close();
}
