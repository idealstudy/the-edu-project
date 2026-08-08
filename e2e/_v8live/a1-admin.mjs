import { BASE, newBrowser, login, shot, observer, domSnapshot } from './lib.mjs';

const rec = (o) => console.log('### ' + JSON.stringify(o));
const { browser, context } = await newBrowser();
const page = await context.newPage();
try {
  await login(page, process.env.E2E_ADMIN_EMAIL, process.env.E2E_ADMIN_PASSWORD);
  rec({ label: '관리자 로그인 후', url: new URL(page.url()).pathname });

  /* 영구 비활성 (1) 상담 · 회원 상세 열기 */
  await page.goto(`${BASE}/admin/consultations`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  await shot(page, 'a1-00-consultations');
  rec({ label: '상담 화면', url: new URL(page.url()).pathname, text: (await domSnapshot(page)).slice(0, 1400) });
  const open = page.getByRole('link', { name: /회원 상세 열기/ }).or(page.getByRole('button', { name: /회원 상세 열기/ }));
  const cnt = await open.count();
  const states = [];
  for (let i = 0; i < Math.min(cnt, 5); i += 1) {
    states.push({ tag: await open.nth(i).evaluate((el) => el.tagName), href: await open.nth(i).getAttribute('href').catch(() => null), disabled: await open.nth(i).isDisabled().catch(() => null) });
  }
  rec({ label: '회원 상세 열기 버튼', count: cnt, states });
  if (cnt) {
    const beforeUrl = page.url();
    await open.first().click().catch((e) => rec({ err: String(e).slice(0, 150) }));
    await page.waitForTimeout(6000);
    rec({ label: '(1) 회원 상세 열기 클릭', urlChanged: beforeUrl !== page.url() ? new URL(page.url()).pathname : false, text: (await domSnapshot(page)).slice(0, 600) });
    await shot(page, 'a1-01-member-detail');
  }
  const reason = (await domSnapshot(page)).includes('접수 연락처로 회원 계정을 찾지 못했습니다');
  rec({ label: '(1) 비활성 사유 문장 노출', reason });

  /* 12. 문제은행 검수 시작 */
  await page.goto(`${BASE}/admin/question-bank`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(8000);
  await shot(page, 'a1-02-question-bank');
  const before = await domSnapshot(page);
  rec({ label: '문제은행 화면', text: before.slice(0, 1200) });
  const start = page.getByRole('button', { name: /검수 시작/ });
  rec({ label: '검수 시작 버튼', count: await start.count(), disabled: await start.first().isDisabled().catch(() => null) });
  if (await start.count()) {
    const obs = observer(page);
    await start.first().click();
    await page.waitForTimeout(5000);
    obs.stop();
    const after = await domSnapshot(page);
    rec({ label: '12 검수 시작 클릭', apiCalls: obs.calls, domChanged: before !== after, after: after.slice(0, 1200) });
    await shot(page, 'a1-03-review-started');
  }
} catch (e) {
  rec({ error: String(e).slice(0, 800) });
  await shot(page, 'a1-error');
} finally {
  await context.close().catch(() => {});
  await browser.close();
}
