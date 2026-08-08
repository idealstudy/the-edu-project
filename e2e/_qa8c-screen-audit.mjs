import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const WEB='https://dev.d-edu.site';
const OUT='/Users/sj/sj_code_master/d-edu-mvp-g-dashboard/docs/mvp-g/qa-screens-v8-C';
const cred=r=>({email:process.env[`E2E_${r}_EMAIL`],password:process.env[`E2E_${r}_PASSWORD`]});
async function login(page,role){
  await page.goto(`${WEB}/login`,{waitUntil:'domcontentloaded'});
  const c=cred(role);
  await page.getByTestId('login-email-input').fill(c.email);
  await page.getByTestId('login-password-input').fill(c.password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL(u=>!u.pathname.startsWith('/login'),{timeout:30000});
}
const ROUTES={
 STUDENT:['/dashboard/student','/dashboard/student/results','/dashboard/student/look-back','/dashboard/student/unit-notes','/dashboard/student/wrong-answers','/dashboard/student/exam-hall'],
 TEACHER:['/dashboard/teacher','/dashboard/teacher/exams','/dashboard/teacher/my'],
 ADMIN:['/admin/members','/admin/study-rooms','/admin/public-exams','/admin/question-bank','/admin/consultations'],
};
const report=[];
const b=await chromium.launch();
for(const role of Object.keys(ROUTES)){
  const ctx=await b.newContext({viewport:{width:1280,height:900}});
  const page=await ctx.newPage();
  await login(page,role);
  for(const r of ROUTES[role]){
    await page.goto(`${WEB}${r}`,{waitUntil:'domcontentloaded'});
    await page.waitForTimeout(6000);
    const slug=r.replace(/\//g,'-').replace(/^-/,'');
    try{await page.screenshot({path:`${OUT}/${role.toLowerCase()}-${slug}.png`,fullPage:true,timeout:20000});}catch{await page.screenshot({path:`${OUT}/${role.toLowerCase()}-${slug}.png`,timeout:20000}).catch(()=>{});}
    const info=await page.evaluate(()=>{
      const q=[...document.querySelectorAll('button, a[href]')];
      const skel=document.querySelectorAll('[class*="animate-pulse"], [data-testid*="skeleton"]').length;
      return {
        skeletons: skel,
        controls: q.filter(e=>e.offsetParent!==null).map(e=>({
          tag:e.tagName, text:(e.innerText||e.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ').slice(0,40),
          href:e.getAttribute('href')||null, disabled: e.disabled===true||e.getAttribute('aria-disabled')==='true'
        })).filter(e=>e.text)
      };
    });
    report.push({role,route:r,...info});
    console.log(`${role} ${r}  controls=${info.controls.length} skeleton=${info.skeletons} disabled=${info.controls.filter(c=>c.disabled).length}`);
  }
  await ctx.close();
}
await b.close();
await writeFile('/tmp/qa8c-screen-audit.json',JSON.stringify(report,null,1));
