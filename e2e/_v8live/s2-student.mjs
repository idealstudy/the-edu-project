import { BASE, newBrowser, login, shot, observer, domSnapshot } from './lib.mjs';

const rec = (o) => console.log('### ' + JSON.stringify(o));
const { browser, context } = await newBrowser();
const page = await context.newPage();

async function click(label, locator, opts = {}) {
  if ((await locator.count()) === 0) return rec({ label, result: 'NOT_FOUND' });
  const before = (await domSnapshot(page)).slice(0, 8000);
  const beforeUrl = page.url();
  const obs = observer(page);
  await locator.first().click({ timeout: 12000 }).catch((e) => rec({ label, clickError: String(e).slice(0, 200) }));
  await page.waitForTimeout(opts.wait ?? 3000);
  obs.stop();
  const after = (await domSnapshot(page)).slice(0, 8000);
  rec({
    label,
    urlChanged: beforeUrl !== page.url() ? `${new URL(beforeUrl).pathname} -> ${new URL(page.url()).pathname}` : false,
    apiCalls: obs.calls,
    domChanged: before !== after,
  });
  return true;
}

try {
  await login(page, process.env.E2E_STUDENT_EMAIL, process.env.E2E_STUDENT_PASSWORD);

  /* 8. 월간 → 노트 열기 (그 주 보기 전에 먼저 본다) */
  await page.goto(`${BASE}/dashboard/student/look-back`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  await click('월간 탭', page.getByRole('button', { name: '월간', exact: true }));
  await shot(page, 's2-08-month');
  const noteOpen = page.getByRole('link', { name: /노트 열기/ });
  rec({ label: '8 노트 열기 개수', count: await noteOpen.count(), href: await noteOpen.first().getAttribute('href').catch(() => null) });
  await click('8 노트 열기', noteOpen, { wait: 6000 });
  rec({ label: '8 노트 열기 도착', url: new URL(page.url()).pathname });
  await shot(page, 's2-08-note-open');

  /* 10. 가장 약한 단원 먼저 정리하기 (정렬을 최근 순으로 되돌린 뒤) */
  await page.goto(`${BASE}/dashboard/student/unit-notes/27`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(5000);
  await click('정렬 · 최근 정리 순으로 되돌리기', page.getByRole('button', { name: '최근 정리 순', exact: true }));
  const b = await domSnapshot(page);
  await click('10 가장 약한 단원 먼저 정리하기', page.getByRole('button', { name: /가장 약한 단원 먼저 정리하기/ }));
  const a = await domSnapshot(page);
  rec({ label: '10 약한 단원 먼저 · 결과', changed: b !== a, after: a.slice(400, 1100) });
  await shot(page, 's2-10-weakest-first');

  /* 10. 숨긴 것 보기: 선생님 노트가 있는 단원을 찾는다 */
  const notes = await page.request.get(`${BASE}/api/v1/student/unit-notes`);
  const nb = await notes.json();
  rec({ label: '단권화 노트 목록', body: JSON.stringify(nb).slice(0, 1200) });

  /* B. 진행 중 attempt 만들기: 오픈챌린지 하나를 열어 풀기 시작만 한다 */
  await page.goto(`${BASE}/open-challenge`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(6000);
  await shot(page, 's2-B-challenge-list');
  rec({ label: 'B 오픈챌린지 목록', text: (await domSnapshot(page)).slice(0, 1000) });
  const firstCard = page.locator('a[href^="/open-challenge/"]').first();
  const href = await firstCard.getAttribute('href').catch(() => null);
  rec({ label: 'B 첫 문제 링크', href });
  if (href) {
    await page.goto(`${BASE}${href}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(7000);
    await shot(page, 's2-B-challenge-detail');
    rec({ label: 'B 문제 화면', url: new URL(page.url()).pathname, text: (await domSnapshot(page)).slice(0, 1200) });
  }

  /* B. 학습 허브 시도 중 탭 (role=tab) */
  await page.goto(`${BASE}/learning`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  await click('B 시도 중 탭', page.getByRole('tab', { name: '시도 중', exact: true }), { wait: 4000 });
  await shot(page, 's2-B-inprogress-tab');
  const resume = page.locator('[data-testid^="my-problem-resume-"]');
  rec({
    label: 'B 이어 풀기 버튼',
    count: await resume.count(),
    href: await resume.first().getAttribute('href').catch(() => null),
    tabText: (await domSnapshot(page)).slice(600, 2000),
  });
  if (await resume.count()) {
    await click('B 이어 풀기 클릭', resume, { wait: 8000 });
    rec({ label: 'B 이어 풀기 도착', url: new URL(page.url()).pathname, text: (await domSnapshot(page)).slice(0, 700) });
    await shot(page, 's2-B-resume-arrived');
  }
} catch (e) {
  rec({ error: String(e).slice(0, 800) });
  await shot(page, 's2-error');
} finally {
  await context.close().catch(() => {});
  await browser.close();
}
