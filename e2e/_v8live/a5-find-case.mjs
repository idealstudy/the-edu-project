import { BASE, newBrowser, login, shot, domSnapshot } from './lib.mjs';

const rec = (o) => console.log('### ' + JSON.stringify(o));
const { browser, context } = await newBrowser();
const page = await context.newPage();
try {
  await login(page, process.env.E2E_ADMIN_EMAIL, process.env.E2E_ADMIN_PASSWORD);
  let found = null;
  let foundPage = null;
  for (let p = 0; p < 25; p += 1) {
    const r = await page.request.get(`${BASE}/api/v1/admin/consultation-cases?page=${p}&size=20`);
    if (!r.ok()) break;
    const b = await r.json();
    const list = b.data?.content ?? [];
    if (!list.length) break;
    const hit = list.find((c) => c.senderName === 'QA라이브검증');
    if (hit) { found = hit; foundPage = p; break; }
  }
  rec({ label: '접수 건 찾기', foundPage, found });
  if (found) {
    await page.goto(`${BASE}/admin/consultations`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(7000);
    for (let i = 0; i < foundPage; i += 1) {
      const next = page.getByRole('button', { name: /다음|›|>/ }).last();
      await next.click().catch(() => {});
      await page.waitForTimeout(3000);
    }
    const row = page.getByText('QA라이브검증').first();
    rec({ label: '화면에서 찾음', count: await page.getByText('QA라이브검증').count() });
    await row.click().catch((e) => rec({ err: String(e).slice(0, 120) }));
    await page.waitForTimeout(3000);
    await shot(page, 'a5-00-case-open');
    const btn = page.getByRole('link', { name: /회원 상세 열기/ }).or(page.getByRole('button', { name: /회원 상세 열기/ }));
    rec({ label: '(1) 버튼', count: await btn.count(), tag: await btn.first().evaluate((el) => el.tagName).catch(() => null), href: await btn.first().getAttribute('href').catch(() => null), disabled: await btn.first().isDisabled().catch(() => null) });
    const before = page.url();
    await btn.first().click({ timeout: 8000 }).catch((e) => rec({ clickErr: String(e).slice(0, 120) }));
    await page.waitForTimeout(6000);
    rec({ label: '(1) 클릭 결과', url: new URL(page.url()).pathname, moved: before !== page.url(), text: (await domSnapshot(page)).slice(0, 500) });
    await shot(page, 'a5-01-member-detail');
  }
} catch (e) {
  rec({ error: String(e).slice(0, 700) });
  await shot(page, 'a5-error');
} finally {
  await context.close().catch(() => {});
  await browser.close();
}
