import { BASE, newBrowser, login, shot, observer, domSnapshot } from './lib.mjs';

const rec = (o) => console.log('### ' + JSON.stringify(o));
const ROOM = '494';
const { browser, context } = await newBrowser();
const page = await context.newPage();
const rows = () => page.locator('[data-testid^="learning-management-feedback-row-"]');
const pending = async () => (await page.getByTestId('learning-management-pending-count').innerText()).trim();

try {
  await login(page, process.env.E2E_TEACHER_EMAIL, process.env.E2E_TEACHER_PASSWORD);
  await page.goto(`${BASE}/study-rooms/${ROOM}/manage`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('learning-management-tab').waitFor({ timeout: 20000 });
  await page.waitForTimeout(5000);
  rec({ label: '피드백 행 수', count: await rows().count(), pending: await pending(), first: await rows().first().innerText().catch(() => null) });
  await shot(page, 't6-00-feedback-rows');
  if ((await rows().count()) === 0) throw new Error('피드백 행 0건');

  /* 코멘트 쓰기 → 저장 */
  const mark = `QA v8 라이브 코멘트 ${Date.now()}`;
  let obs = observer(page);
  await rows().first().getByRole('button', { name: '코멘트 쓰기', exact: true }).click();
  await page.waitForTimeout(1000);
  await page.getByLabel('오답 코멘트').first().fill(mark);
  await page.getByRole('button', { name: '저장', exact: true }).first().click();
  await page.waitForTimeout(4500);
  obs.stop();
  rec({ label: '13 코멘트 쓰기 + 저장', apiCalls: obs.calls, 화면에반영: (await domSnapshot(page)).includes(mark), pending: await pending() });
  await shot(page, 't6-01-comment-saved');

  /* 코멘트 고치기 */
  const edit = page.getByRole('button', { name: '코멘트 고치기', exact: true });
  rec({ label: '코멘트 고치기 버튼', count: await edit.count() });
  if (await edit.count()) {
    obs = observer(page);
    await edit.first().click();
    await page.waitForTimeout(900);
    await page.getByLabel('오답 코멘트').first().fill(mark + ' (고침)');
    await page.getByRole('button', { name: '저장', exact: true }).first().click();
    await page.waitForTimeout(4500);
    obs.stop();
    rec({ label: '13 코멘트 고치기', apiCalls: obs.calls, 화면에반영: (await domSnapshot(page)).includes('(고침)') });
    await shot(page, 't6-02-comment-edited');
  }

  /* 확인함 (코멘트 없는 행) */
  const ack = rows().getByRole('button', { name: '확인함', exact: true });
  rec({ label: '확인함 버튼 수', count: await ack.count() });
  if (await ack.count()) {
    const before = await rows().count();
    obs = observer(page);
    await ack.first().click();
    await page.waitForTimeout(4500);
    obs.stop();
    rec({ label: '13 확인함(피드백)', apiCalls: obs.calls, 행: `${before} -> ${await rows().count()}`, pending: await pending() });
    await shot(page, 't6-03-ack');
  }

  /* 전부 확인함 */
  const all = page.getByTestId('learning-management-acknowledge-all');
  rec({ label: '전부 확인함 렌더', count: await all.count() });
  if (await all.count()) {
    const before = await rows().count();
    obs = observer(page);
    await all.click();
    await page.waitForTimeout(6000);
    obs.stop();
    rec({ label: '13 전부 확인함', apiCalls: obs.calls, 행: `${before} -> ${await rows().count()}`, pending: await pending() });
    await shot(page, 't6-04-ack-all');
  }
} catch (e) {
  rec({ error: String(e).slice(0, 800) });
  await shot(page, 't6-error');
} finally {
  await context.close().catch(() => {});
  await browser.close();
}
