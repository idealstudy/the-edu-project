import { BASE, newBrowser, login, shot, observer } from './lib.mjs';

const ROOM = process.env.QA_ROOM_ID ?? '494';
const results = [];
const rec = (o) => {
  results.push(o);
  console.log('### ' + JSON.stringify(o));
};

const { browser, context } = await newBrowser();
const page = await context.newPage();

const countRows = async (sel) => page.locator(sel).count();
const pending = async () =>
  (await page.getByTestId('learning-management-pending-count').innerText()).trim();

async function clickAndObserve(label, locator, opts = {}) {
  const obs = observer(page);
  const beforeUrl = page.url();
  const beforeRows = {
    todo: await countRows('[data-testid^="learning-management-todo-row-"]'),
    fb: await countRows('[data-testid^="learning-management-feedback-row-"]'),
    pending: await pending().catch(() => 'n/a'),
  };
  const disabled = await locator.isDisabled().catch(() => null);
  if (disabled) {
    obs.stop();
    rec({ label, result: 'DISABLED', beforeRows });
    return;
  }
  await locator.click();
  await page.waitForTimeout(opts.wait ?? 3500);
  obs.stop();
  const afterRows = {
    todo: await countRows('[data-testid^="learning-management-todo-row-"]'),
    fb: await countRows('[data-testid^="learning-management-feedback-row-"]'),
    pending: await pending().catch(() => 'n/a'),
  };
  rec({
    label,
    urlBefore: new URL(beforeUrl).pathname,
    urlAfter: new URL(page.url()).pathname,
    apiCalls: obs.calls.filter((c) => !c.startsWith('GET /api/v1/member')),
    beforeRows,
    afterRows,
  });
}

try {
  await login(page, process.env.E2E_TEACHER_EMAIL, process.env.E2E_TEACHER_PASSWORD);
  await page.goto(`${BASE}/study-rooms/${ROOM}/manage`, { waitUntil: 'domcontentloaded' });
  await page.getByTestId('learning-management-tab').waitFor({ timeout: 20000 });
  await page.waitForTimeout(4000);
  await shot(page, 't1-00-learning-management-initial');

  rec({
    label: '초기 상태',
    pending: await pending(),
    noteRows: await countRows('[data-testid^="learning-management-note-row-"]'),
    todoRows: await countRows('[data-testid^="learning-management-todo-row-"]'),
    feedbackRows: await countRows('[data-testid^="learning-management-feedback-row-"]'),
    text: (await page.getByTestId('learning-management-tab').innerText()).replace(/\s+/g, ' ').slice(0, 1800),
  });

  // 승인 대기 행: 승인 / 빼기
  const approve = page.getByRole('button', { name: '승인', exact: true }).first();
  if (await approve.count()) {
    await clickAndObserve('할 일 · 승인', approve);
    await shot(page, 't1-01-approve');
  } else rec({ label: '할 일 · 승인', result: 'NO_ROW' });

  const reject = page.getByRole('button', { name: '빼기', exact: true }).first();
  if (await reject.count()) {
    await clickAndObserve('할 일 · 빼기', reject);
    await shot(page, 't1-02-reject');
  } else rec({ label: '할 일 · 빼기', result: 'NO_ROW' });

  // 못했어요 행: 내일로 옮기기 / 확인함
  const defer = page.getByRole('button', { name: '내일로 옮기기', exact: true }).first();
  if (await defer.count()) {
    await clickAndObserve('할 일 · 내일로 옮기기', defer);
    await shot(page, 't1-03-defer');
  } else rec({ label: '할 일 · 내일로 옮기기', result: 'NO_ROW (못했어요 행 없음)' });

  const ackTodo = page.locator('[data-testid^="learning-management-todo-row-"]').getByRole('button', { name: '확인함', exact: true }).first();
  if (await ackTodo.count()) {
    await clickAndObserve('할 일 · 확인함', ackTodo);
    await shot(page, 't1-04-ack-todo');
  } else rec({ label: '할 일 · 확인함', result: 'NO_ROW (못했어요 행 없음)' });

  // 피드백 행
  const writeComment = page.getByRole('button', { name: /^코멘트 (쓰기|고치기)$/ }).first();
  if (await writeComment.count()) {
    const isEdit = (await writeComment.innerText()).includes('고치기');
    await writeComment.click();
    await page.waitForTimeout(800);
    const input = page.getByLabel('오답 코멘트').first();
    const inputVisible = await input.isVisible().catch(() => false);
    rec({ label: `피드백 · ${isEdit ? '코멘트 고치기' : '코멘트 쓰기'} (입력창 열기)`, inputVisible });
    await shot(page, 't1-05-comment-open');
    if (inputVisible) {
      await input.fill(`QA v8 라이브 확인 ${Date.now()}`);
      const obs = observer(page);
      await page.getByRole('button', { name: '저장', exact: true }).first().click();
      await page.waitForTimeout(3500);
      obs.stop();
      rec({
        label: '피드백 · 코멘트 저장',
        apiCalls: obs.calls,
        bodyHasQa: (await page.getByTestId('learning-management-tab').innerText()).includes('QA v8 라이브 확인'),
      });
      await shot(page, 't1-06-comment-saved');
    }
  } else rec({ label: '피드백 · 코멘트 쓰기', result: 'NO_ROW' });

  const ackFb = page.locator('[data-testid^="learning-management-feedback-row-"]').getByRole('button', { name: '확인함', exact: true }).first();
  if (await ackFb.count()) {
    await clickAndObserve('피드백 · 확인함', ackFb);
    await shot(page, 't1-07-ack-feedback');
  } else rec({ label: '피드백 · 확인함', result: 'NO_ROW' });

  const ackAll = page.getByTestId('learning-management-acknowledge-all');
  if (await ackAll.count()) {
    await clickAndObserve('피드백 · 전부 확인함', ackAll, { wait: 5000 });
    await shot(page, 't1-08-ack-all');
  } else rec({ label: '피드백 · 전부 확인함', result: 'NOT_RENDERED (피드백 행 0건)' });

  // 개념 노트 행: 상태 알약만 있는지
  const noteRowText = await page.locator('[data-testid^="learning-management-note-row-"]').first().innerText().catch(() => '');
  rec({ label: '개념 노트 행(버튼 없음, 상태 알약 확인)', text: noteRowText.replace(/\s+/g, ' ') });

  // 상단 바로가기 링크 4종
  for (const name of ['＋ 개념 노트', '＋ 할 일', '＋ 피드백']) {
    const l = page.getByRole('link', { name: new RegExp(name.replace('＋ ', '')) }).first();
    rec({ label: `바로가기 ${name}`, href: await l.getAttribute('href').catch(() => null) });
  }
  for (const name of ['새 노트 쓰기', '할 일 쓰기', '코멘트 쓰기', '시험 열기']) {
    const l = page.getByRole('link', { name, exact: true }).first();
    rec({ label: `카드 버튼 ${name}`, href: await l.getAttribute('href').catch(() => null) });
  }
} catch (e) {
  rec({ error: String(e).slice(0, 800) });
  await shot(page, 't1-error');
} finally {
  await context.close().catch(() => {});
  await browser.close();
}
