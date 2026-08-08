import { BASE, newBrowser, login, shot, observer, domSnapshot } from './lib.mjs';

const rec = (o) => console.log('### ' + JSON.stringify(o));
const { browser, context } = await newBrowser();
const page = await context.newPage();

async function click(label, locator, opts = {}) {
  const before = (await domSnapshot(page)).slice(0, 6000);
  const beforeUrl = page.url();
  if ((await locator.count()) === 0) return rec({ label, result: 'NOT_FOUND' });
  const disabled = await locator.first().isDisabled().catch(() => false);
  const obs = observer(page);
  await locator.first().click({ timeout: 10000 }).catch((e) => rec({ label, clickError: String(e).slice(0, 200) }));
  await page.waitForTimeout(opts.wait ?? 3000);
  obs.stop();
  const after = (await domSnapshot(page)).slice(0, 6000);
  rec({
    label,
    disabledBefore: disabled,
    urlChanged: beforeUrl !== page.url() ? `${new URL(beforeUrl).pathname} -> ${new URL(page.url()).pathname}` : false,
    apiCalls: obs.calls,
    domChanged: before !== after,
    hint: opts.hint ? after.includes(opts.hint) : undefined,
  });
}

try {
  await login(page, process.env.E2E_STUDENT_EMAIL, process.env.E2E_STUDENT_PASSWORD);

  /* 11. 등급 근거 설명 */
  await page.goto(`${BASE}/dashboard/student`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  await click('11 등급이 어떻게 나왔나요', page.getByRole('button', { name: /등급이 어떻게 나왔나요/ }));
  await shot(page, 's1-11-grade-basis');
  rec({ label: '11 근거 상자 본문', text: (await domSnapshot(page)).slice(0, 900) });

  /* 7·8·9 돌아보기 */
  await page.goto(`${BASE}/dashboard/student/look-back`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  await shot(page, 's1-07-lookback-week');
  await click('9 코치 다시 받기', page.getByRole('button', { name: /다시 받기/ }));
  await shot(page, 's1-09-coach-refetch');
  await click('7 회고 있는 날만 필터', page.getByText('회고 있는 날만', { exact: false }));
  await shot(page, 's1-07-filter');
  await click('월간 탭', page.getByRole('button', { name: '월간', exact: true }));
  await page.waitForTimeout(2500);
  await shot(page, 's1-08-month');
  rec({ label: '월간 화면 본문', text: (await domSnapshot(page)).slice(0, 1200) });
  await click('8 그 주 보기', page.getByRole('button', { name: /그 주 보기/ }));
  await shot(page, 's1-08-week-jump');
  rec({ label: '주 보기 후 본문', text: (await domSnapshot(page)).slice(0, 800) });
  await click('노트 열기(이 달 정리한 단원)', page.getByRole('link', { name: /노트 열기/ }));
  await shot(page, 's1-08-note-open');

  /* 10. 단권화 */
  await page.goto(`${BASE}/dashboard/student/unit-notes`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  const orderBefore = await page.$$eval('main', (els) => els[0]?.innerText.replace(/\s+/g, ' ').slice(0, 400) ?? '');
  await click('10 과목 정렬 · 약한 순', page.getByRole('button', { name: '약한 순', exact: true }));
  const orderAfter = await page.$$eval('main', (els) => els[0]?.innerText.replace(/\s+/g, ' ').slice(0, 400) ?? '');
  rec({ label: '10 과목 정렬 결과', orderBefore, orderAfter, changed: orderBefore !== orderAfter });
  await shot(page, 's1-10-subject-sort');
  await click('10 과목 정렬 · 최근 정리 순', page.getByRole('button', { name: '최근 정리 순', exact: true }));

  await click('단원 목록 열기(이어서 정리하기)', page.getByRole('link', { name: /이어서 정리하기|열기/ }), { wait: 5000 });
  rec({ label: '단원 화면', url: new URL(page.url()).pathname, text: (await domSnapshot(page)).slice(0, 1200) });
  await shot(page, 's1-10-unit-room');
  const uBefore = await domSnapshot(page);
  await click('10 단원 정렬 · 약한 순', page.getByRole('button', { name: '약한 순', exact: true }));
  const uAfter = await domSnapshot(page);
  rec({ label: '10 단원 정렬 결과', changed: uBefore !== uAfter });
  await click('10 가장 약한 단원 먼저 정리하기', page.getByRole('button', { name: /가장 약한 단원 먼저 정리하기/ }));
  await shot(page, 's1-10-weakest-first');
  rec({ label: '10 약한 단원 클릭 후 본문', text: (await domSnapshot(page)).slice(0, 1000) });
  await click('10 숨긴 것 보기', page.getByRole('button', { name: /숨긴 것 보기|숨긴 장 보기/ }));
  await shot(page, 's1-10-hidden');
  rec({ label: '10 숨긴 것 보기 후 본문', text: (await domSnapshot(page)).slice(0, 800) });

  /* B. 오픈챌린지 이어 풀기 */
  await page.goto(`${BASE}/learning`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  await shot(page, 's1-B-learning');
  await click('B 시도 중 탭', page.getByRole('button', { name: '시도 중', exact: true }), { wait: 4000 });
  await shot(page, 's1-B-inprogress-tab');
  rec({ label: 'B 시도 중 탭 본문', text: (await domSnapshot(page)).slice(0, 1500) });
  const resume = page.getByRole('link', { name: '이어 풀기', exact: true });
  rec({ label: 'B 이어 풀기 버튼 수', count: await resume.count(), href: await resume.first().getAttribute('href').catch(() => null) });
  await click('B 이어 풀기', resume, { wait: 8000 });
  await shot(page, 's1-B-resume');
  rec({ label: 'B 이어 풀기 후', url: new URL(page.url()).pathname, text: (await domSnapshot(page)).slice(0, 800) });
} catch (e) {
  rec({ error: String(e).slice(0, 800) });
  await shot(page, 's1-error');
} finally {
  await context.close().catch(() => {});
  await browser.close();
}
