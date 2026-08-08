import { BASE, newBrowser, login, shot, domSnapshot, observer } from './lib.mjs';

const rec = (o) => console.log('### ' + JSON.stringify(o));
const EMAIL = process.env.E2E_STUDENT_EMAIL;
const { browser, context } = await newBrowser();
const page = await context.newPage();
try {
  await page.goto(`${BASE}/consult`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  await page.getByText('학생 본인', { exact: true }).first().click().catch(() => {});
  await page.waitForTimeout(800);
  await page.locator('input[name="birthYear"]').fill('2009');
  await page.locator('input[name="name"]').fill('QA라이브검증');
  await page.locator('input[name="contact"]').fill(EMAIL);
  await page.locator('textarea[name="message"]').fill('QA v8 라이브: 회원 상세 열기 경로 검증용 접수입니다.');
  await page.getByText(/개인정보 수집·이용에 동의합니다/).first().click().catch(() => {});
  await page.waitForTimeout(800);
  const submitBtn = page.getByRole('button', { name: '비공개로 고민 남기기' });
  rec({ label: '제출 버튼 상태', disabled: await submitBtn.isDisabled(), radios: await page.locator('input[type=\"radio\"]:checked').count(), checks: await page.locator('input[type=\"checkbox\"]:checked').count() });
  const obs = observer(page);
  await page.getByRole('button', { name: '비공개로 고민 남기기' }).click();
  await page.waitForTimeout(7000);
  obs.stop();
  rec({ label: '상담 접수', apiCalls: obs.calls, text: (await domSnapshot(page)).slice(0, 400) });
  await shot(page, 'a4-00-consult-submitted');

  await login(page, process.env.E2E_ADMIN_EMAIL, process.env.E2E_ADMIN_PASSWORD);
  await page.goto(`${BASE}/admin/consultations`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  const row = page.getByText('QA라이브검증', { exact: false }).first();
  rec({ label: '접수 건 표시', count: await page.getByText('QA라이브검증').count() });
  await row.click().catch((e) => rec({ err: String(e).slice(0, 150) }));
  await page.waitForTimeout(3000);
  await shot(page, 'a4-01-case-open');
  const btn = page.getByRole('link', { name: /회원 상세 열기/ }).or(page.getByRole('button', { name: /회원 상세 열기/ }));
  rec({
    label: '(1) 회원 상세 열기',
    count: await btn.count(),
    tag: await btn.first().evaluate((el) => el.tagName).catch(() => null),
    href: await btn.first().getAttribute('href').catch(() => null),
    disabled: await btn.first().isDisabled().catch(() => null),
  });
  const before = page.url();
  await btn.first().click({ timeout: 8000 }).catch((e) => rec({ clickErr: String(e).slice(0, 120) }));
  await page.waitForTimeout(6000);
  rec({ label: '(1) 클릭 결과', url: new URL(page.url()).pathname, moved: before !== page.url(), text: (await domSnapshot(page)).slice(0, 500) });
  await shot(page, 'a4-02-member-detail');
} catch (e) {
  rec({ error: String(e).slice(0, 700) });
  await shot(page, 'a4-error');
} finally {
  await context.close().catch(() => {});
  await browser.close();
}
