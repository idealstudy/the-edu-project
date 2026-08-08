import { BASE, newBrowser, login } from './lib.mjs';

const out = {};
const { browser, context } = await newBrowser();
const page = await context.newPage();
try {
  await login(page, process.env.E2E_TEACHER_EMAIL, process.env.E2E_TEACHER_PASSWORD);
  const inbox = await page.request.get(`${BASE}/api/v1/teacher/inbox`);
  out.inbox = { status: inbox.status(), body: (await inbox.text()).slice(0, 1500) };

  // 모든 방을 훑어 feedbackRows / NOT_DONE 이 있는 방 찾기
  const rooms = await page.request.get(`${BASE}/api/v1/teacher/study-rooms`);
  out.roomsStatus = rooms.status();
  let list = [];
  try {
    const b = await rooms.json();
    list = (b.data?.content ?? b.data ?? []).map((r) => r.id ?? r.studyRoomId).filter(Boolean);
  } catch (e) { out.roomsErr = String(e).slice(0,200); }
  out.roomCount = list.length;
  const hits = [];
  for (const id of list.slice(0, 60)) {
    const r = await page.request.get(`${BASE}/api/v1/teacher/study-rooms/${id}/learning-management`);
    if (!r.ok()) continue;
    const d = (await r.json()).data;
    const notDone = (d.todoRows ?? []).filter((t) => t.kind === 'NOT_DONE').length;
    if (notDone > 0 || (d.feedbackRows ?? []).length > 0)
      hits.push({ id, notDone, feedback: (d.feedbackRows ?? []).length, sample: (d.feedbackRows ?? [])[0] });
  }
  out.hits = hits;
} catch (e) {
  out.error = String(e).slice(0, 600);
} finally {
  console.log(JSON.stringify(out, null, 2));
  await context.close().catch(() => {});
  await browser.close();
}
