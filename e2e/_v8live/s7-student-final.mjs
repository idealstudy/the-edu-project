import { BASE, newBrowser, login, shot, observer, domSnapshot } from './lib.mjs';

const rec = (o) => console.log('### ' + JSON.stringify(o));
const { browser, context } = await newBrowser();
const page = await context.newPage();
try {
  await login(page, process.env.E2E_STUDENT_EMAIL, process.env.E2E_STUDENT_PASSWORD);

  /* 14. 질문 남기기 (선생님 코멘트가 달린 오답 4078) */
  await page.goto(`${BASE}/dashboard/student/wrong-answers/4078`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  await shot(page, 's7-00-wrong-answer');
  rec({ label: '14 오답 회독 화면', url: new URL(page.url()).pathname, hasComment: (await domSnapshot(page)).includes('선생님 코멘트'), text: (await domSnapshot(page)).slice(200, 1100) });
  const ask = page.getByTestId('wrong-answer-ask-teacher');
  rec({ label: '14 질문 남기기 버튼', count: await ask.count() });
  if (await ask.count()) {
    await ask.click();
    await page.waitForTimeout(1200);
    const box = page.locator('textarea:visible, input:visible').first();
    await box.fill('QA v8 라이브: 3번 줄이 왜 그렇게 되나요?');
    const obs = observer(page);
    await page.getByRole('button', { name: /^보내기$|^저장$/ }).first().click();
    await page.waitForTimeout(5000);
    obs.stop();
    const after = await domSnapshot(page);
    rec({ label: '14 질문 보내기', apiCalls: obs.calls, 화면반영: after.includes('3번 줄이 왜'), 질문고치기: after.includes('질문 고치기') });
    await shot(page, 's7-01-question-sent');
  }

  /* B2. 마이페이지 오픈챌린지 상세 모달 이어 풀기 */
  await page.goto(`${BASE}/learning`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(7000);
  await page.getByRole('tab', { name: '시도 중', exact: true }).click();
  await page.waitForTimeout(4000);
  const card = page.locator('[data-testid^="my-problem-resume-"]').first();
  const cardHref = await card.getAttribute('href').catch(() => null);
  // 행 본문(제목)을 눌러 상세 모달을 연다
  const title = page.getByText('풀이를 이어서 진행해요').first();
  const obs2 = observer(page);
  await title.click().catch((e) => rec({ err: String(e).slice(0, 150) }));
  await page.waitForTimeout(5000);
  obs2.stop();
  await shot(page, 's7-02-detail-dialog');
  const dlg = await domSnapshot(page);
  rec({ label: 'B2 상세 모달', cardHref, apiCalls: obs2.calls.slice(0, 6), 안내문: dlg.includes('아직 제출하지 않은 풀이가 있어요'), 이어풀기: dlg.includes('이어 풀기') });

  /* 10. 숨긴 것 보기: 선생님 노트가 있는 단원에서 숨기고 다시 본다 */
  for (const node of [16, 17]) {
    await page.goto(`${BASE}/dashboard/student/unit-notes/${node}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(6000);
    const t = await domSnapshot(page);
    rec({ label: `단원 ${node}`, 선생님판서: (t.match(/선생님 판서 (\d+)장/) ?? [])[0], 숨김블록: t.includes('숨긴 선생님 노트'), 숨기기버튼: await page.getByRole('button', { name: /숨기기/ }).count() });
    await shot(page, `s7-03-unit-${node}`);
  }
} catch (e) {
  rec({ error: String(e).slice(0, 800) });
  await shot(page, 's7-error');
} finally {
  await context.close().catch(() => {});
  await browser.close();
}
