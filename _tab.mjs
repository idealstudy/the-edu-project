import { chromium } from '@playwright/test';
const OUT='../docs/qa/assets/mvp-e-v1.1.0-dev-qa-2026-08-17/';
const E=process.env;
const b=await chromium.launch();
for (const [tag,w,h] of [['tab',834,1112],['web',1440,900],['mob',390,844]]) {
  const p=await (await b.newContext({viewport:{width:w,height:h}})).newPage();
  await p.goto('http://localhost:3118/login',{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(3500);
  await p.fill('input[type="email"]',E.E2E_STUDENT_EMAIL);
  await p.fill('input[type="password"]',E.E2E_STUDENT_PASSWORD);
  await p.click('button[type="submit"]'); await p.waitForTimeout(7000);
  await p.goto('http://localhost:3118/open-challenge/4001',{waitUntil:'domcontentloaded'});
  await p.waitForTimeout(9000);
  const choices=p.locator('[data-testid^="choice"], button:has-text("①"), label:has-text("①"), [role="radio"]');
  const n=await choices.count();
  let r='선택지 없음';
  if(n){ try{ await choices.first().click({timeout:5000}); await p.waitForTimeout(1200);
    const sub=p.getByTestId('challenge-submit-button');
    r='클릭 성공 · '+(await sub.count()? (await sub.isEnabled()?'제출 활성화':'제출 비활성'):'제출버튼없음');
  }catch(e){ r='클릭 실패: '+String(e).slice(0,70);} }
  console.log(`${tag} | 선택지=${n} | ${r}`);
  await p.screenshot({path:`${OUT}v2impl-${tag}.png`});
}
await b.close();
