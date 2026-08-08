import { BASE, newBrowser, login, shot, observer, domSnapshot } from './lib.mjs';

const rec = (o) => console.log('### ' + JSON.stringify(o));
const ROOM = '494';
const { browser, context } = await newBrowser();
const page = await context.newPage();

async function click(label, locator, opts = {}) {
  if ((await locator.count()) === 0) return rec({ label, result: 'NOT_FOUND' });
  const disabled = await locator.first().isDisabled().catch(() => null);
  const before = (await domSnapshot(page)).slice(0, 9000);
  const beforeUrl = page.url();
  const obs = observer(page);
  await locator.first().click({ timeout: 12000 }).catch((e) => rec({ label, clickError: String(e).slice(0, 200) }));
  await page.waitForTimeout(opts.wait ?? 3000);
  obs.stop();
  rec({
    label,
    disabled,
    urlChanged: beforeUrl !== page.url() ? `${new URL(beforeUrl).pathname} -> ${new URL(page.url()).pathname}` : false,
    apiCalls: obs.calls,
    domChanged: before !== (await domSnapshot(page)).slice(0, 9000),
  });
  return true;
}

try {
  await login(page, process.env.E2E_TEACHER_EMAIL, process.env.E2E_TEACHER_PASSWORD);

  /* 13. 못했어요 행: 내일로 옮기기 / 확인함 */
  await page.goto(`${BASE}/study-rooms/${ROOM}/manage`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('learning-management-tab').waitFor({ timeout: 20000 });
  await page.waitForTimeout(4000);
  const notDoneRows = page.locator('[data-testid^="learning-management-todo-row-"]').filter({ hasText: '못했어요' });
  rec({ label: '못했어요 행 수', count: await notDoneRows.count(), first: await notDoneRows.first().innerText().catch(() => null) });
  await shot(page, 't2-00-notdone-row');
  const pendingText = async () => (await page.getByTestId('learning-management-pending-count').innerText()).trim();
  rec({ label: '손볼 것', value: await pendingText() });

  const defer = notDoneRows.first().getByRole('button', { name: '내일로 옮기기', exact: true });
  await click('13 내일로 옮기기', defer, { wait: 4000 });
  rec({ label: '내일로 옮기기 후', 못했어요행: await page.locator('[data-testid^="learning-management-todo-row-"]').filter({ hasText: '못했어요' }).count(), 손볼것: await pendingText() });
  await shot(page, 't2-01-defer');

  const rows2 = page.locator('[data-testid^="learning-management-todo-row-"]').filter({ hasText: '못했어요' });
  await click('13 확인함(할 일)', rows2.first().getByRole('button', { name: '확인함', exact: true }), { wait: 4000 });
  rec({ label: '확인함 후', 못했어요행: await page.locator('[data-testid^="learning-management-todo-row-"]').filter({ hasText: '못했어요' }).count(), 손볼것: await pendingText() });
  await shot(page, 't2-02-ack');

  /* 2·3·4. 내 수업 카드 ··· 메뉴 */
  await page.goto(`${BASE}/dashboard/teacher`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  const more = page.getByRole('button', { name: '···' }).or(page.locator('button:has-text("···")'));
  rec({ label: '··· 버튼 수', count: await more.count() });
  await click('카드 ··· 열기', more, { wait: 2000 });
  await shot(page, 't2-03-card-menu');
  rec({ label: '··· 메뉴 항목', text: (await domSnapshot(page)).slice(0, 600) });
  const menuItems = await page.locator('[role="menuitem"], [role="menu"] *').allInnerTexts().catch(() => []);
  rec({ label: '메뉴 텍스트', items: [...new Set(menuItems)].slice(0, 12) });

  await click('2 스터디룸 이름 수정', page.getByText('스터디룸 이름 수정', { exact: true }), { wait: 4000 });
  await shot(page, 't2-04-rename-dialog');
  rec({ label: '이름 수정 다이얼로그', text: (await domSnapshot(page)).slice(0, 500), inputs: await page.locator('input:visible').count() });
  await page.keyboard.press('Escape');
  await page.waitForTimeout(1500);

  await click('카드 ··· 다시 열기', more, { wait: 2000 });
  await click('3 학생 초대', page.getByText('학생 초대', { exact: true }), { wait: 5000 });
  rec({ label: '학생 초대 도착', url: new URL(page.url()).pathname });
  await shot(page, 't2-05-invite-nav');

  await page.goto(`${BASE}/dashboard/teacher`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  await click('카드 ··· 열기(3회차)', more, { wait: 2000 });
  await click('4 기록 일지 쓰기', page.getByText('기록 일지 쓰기', { exact: true }), { wait: 5000 });
  rec({ label: '기록 일지 도착', url: new URL(page.url()).pathname });
  await shot(page, 't2-06-note-create');

  /* 영구 비활성 (2)(3): 학습관리 사이드바 */
  await page.goto(`${BASE}/study-rooms/${ROOM}/member`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  await shot(page, 't2-07-room-sidebar');
  const invite = page.getByRole('button', { name: /학생 초대하기/ });
  rec({ label: '학생 초대하기 상태', count: await invite.count(), disabled: await invite.first().isDisabled().catch(() => null) });
  await click('영구비활성(2) 학생 초대하기', invite, { wait: 3000 });
  const clip = await page.evaluate(() => navigator.clipboard.readText()).catch((e) => 'READ_FAIL ' + String(e).slice(0, 80));
  rec({ label: '학생 초대하기 · 클립보드', clip: String(clip).slice(0, 120) });
  await shot(page, 't2-08-invite-copy');
  const toggle = page.getByRole('switch').or(page.locator('input[type="checkbox"]'));
  rec({ label: '초대 링크 활성화 토글', count: await toggle.count(), disabled: await toggle.first().isDisabled().catch(() => null), checked: await toggle.first().isChecked().catch(() => null) });
  await click('영구비활성(3) 초대 링크 활성화 토글', toggle, { wait: 4000 });
  rec({ label: '토글 후 상태', checked: await toggle.first().isChecked().catch(() => null) });
  await shot(page, 't2-09-invite-toggle');
  await click('토글 원복', toggle, { wait: 4000 });

  /* 5·6. 마이페이지 코드 복사 / 링크로 보내기 */
  await page.goto(`${BASE}/dashboard/teacher/my`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  await shot(page, 't2-10-mypage');
  await click('5 코드 복사', page.getByRole('button', { name: '코드 복사', exact: true }), { wait: 3000 });
  const clip2 = await page.evaluate(() => navigator.clipboard.readText()).catch((e) => 'READ_FAIL');
  rec({ label: '코드 복사 · 클립보드', clip: String(clip2).slice(0, 120), toast: (await domSnapshot(page)).slice(0, 200) });
  await shot(page, 't2-11-code-copy');
  await click('6 링크로 보내기', page.getByRole('button', { name: '링크로 보내기', exact: true }), { wait: 3000 });
  const clip3 = await page.evaluate(() => navigator.clipboard.readText()).catch(() => 'READ_FAIL');
  rec({ label: '링크로 보내기 · 클립보드', clip: String(clip3).slice(0, 160) });
  await shot(page, 't2-12-share-link');
} catch (e) {
  rec({ error: String(e).slice(0, 800) });
  await shot(page, 't2-error');
} finally {
  await context.close().catch(() => {});
  await browser.close();
}
