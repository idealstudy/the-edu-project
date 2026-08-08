import { BASE, newBrowser, login, shot, domSnapshot, observer } from './lib.mjs';

const rec = (o) => console.log('### ' + JSON.stringify(o));
const { browser, context } = await newBrowser();
const page = await context.newPage();
try {
  /* 학생 계정의 실제 이메일로 상담을 접수해 회원 되짚기 경로를 만든다 */
  await page.goto(`${BASE}/open-challenge`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  const cta = page.getByRole('link', { name: /내 고민 비공개로 올리기/ }).or(page.getByRole('button', { name: /내 고민 비공개로 올리기/ }));
  rec({ label: '상담 접수 진입', count: await cta.count(), href: await cta.first().getAttribute('href').catch(() => null) });
  await cta.first().click();
  await page.waitForTimeout(6000);
  rec({ label: '상담 접수 화면', url: new URL(page.url()).pathname, text: (await domSnapshot(page)).slice(0, 900) });
  await shot(page, 'a3-00-consult-form');
  const fields = await page.$$eval('input:visible, textarea:visible, select:visible', (els) =>
    els.map((e) => ({ tag: e.tagName, name: e.getAttribute('name'), ph: e.getAttribute('placeholder'), label: e.getAttribute('aria-label'), type: e.getAttribute('type') }))
  );
  rec({ label: '입력 필드', fields });
  const buttons = [...new Set(await page.locator('button:visible').allInnerTexts())];
  rec({ label: '보이는 버튼', buttons: buttons.slice(0, 20) });
} catch (e) {
  rec({ error: String(e).slice(0, 700) });
  await shot(page, 'a3-error');
} finally {
  await context.close().catch(() => {});
  await browser.close();
}
