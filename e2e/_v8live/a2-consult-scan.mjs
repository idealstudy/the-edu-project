import { BASE, newBrowser, login, shot, domSnapshot, observer } from './lib.mjs';

const rec = (o) => console.log('### ' + JSON.stringify(o));
const { browser, context } = await newBrowser();
const page = await context.newPage();
try {
  await login(page, process.env.E2E_ADMIN_EMAIL, process.env.E2E_ADMIN_PASSWORD);
  for (const p of [0, 1, 2]) {
    const r = await page.request.get(`${BASE}/api/v1/admin/consultation-cases?page=${p}&size=50`);
    if (!r.ok()) { rec({ page: p, status: r.status(), body: (await r.text()).slice(0, 200) }); continue; }
    const b = await r.json();
    const list = b.data?.content ?? b.data ?? [];
    const withMember = list.filter((c) => c.senderMemberId != null);
    rec({ page: p, total: list.length, senderMemberIdPresentKey: list[0] ? Object.keys(list[0]).includes('senderMemberId') : null, withMemberCount: withMember.length, sample: withMember[0] ?? list[0] });
    if (withMember.length) break;
  }
} catch (e) {
  rec({ error: String(e).slice(0, 600) });
} finally {
  await context.close().catch(() => {});
  await browser.close();
}
