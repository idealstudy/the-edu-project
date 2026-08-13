import { chromium } from 'playwright';
const API='https://apidev.d-edu.site/api', APP='https://dev.d-edu.site', OUT=process.argv[2];
async function ck(em,pw){const r=await fetch(API+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:em,password:pw})});
 return r.headers.getSetCookie().map(c=>{const nv=c.split(';')[0],i=nv.indexOf('=');return{name:nv.slice(0,i),value:nv.slice(i+1),domain:'.d-edu.site',path:'/'}}).filter(c=>c.value);}
const b=await chromium.launch();
const cs=await ck(process.env.E2E_STUDENT_EMAIL,process.env.E2E_STUDENT_PASSWORD);
for(const [w,h,n] of [[1440,900,'web'],[390,844,'mob']]){
  // A: 지금 그대로 (튜토리얼 창이 뜬 상태)
  let ctx=await b.newContext({viewport:{width:w,height:h}}); await ctx.addCookies(cs);
  let p=await ctx.newPage(); await p.goto(`${APP}/friends`,{waitUntil:'networkidle',timeout:90000}); await p.waitForTimeout(3500);
  await p.screenshot({path:`${OUT}/tut-A-${n}.png`,fullPage:true}); await ctx.close();
  // B: 튜토리얼을 끝까지 넘긴 상태 (안 뜨는 경우와 같은 화면)
  ctx=await b.newContext({viewport:{width:w,height:h}}); await ctx.addCookies(cs);
  p=await ctx.newPage(); await p.goto(`${APP}/friends`,{waitUntil:'networkidle',timeout:90000}); await p.waitForTimeout(3000);
  for(let i=0;i<6;i++){
    const btn=p.locator('button', {hasText:/다음|시작|닫기|확인/}).first();
    if(await btn.count()===0) break;
    try{ await btn.click({timeout:3000}); await p.waitForTimeout(700);}catch(e){break;}
  }
  await p.waitForTimeout(1500);
  await p.screenshot({path:`${OUT}/tut-B-${n}.png`,fullPage:true});
  console.log(n,'done'); await ctx.close();
}
await b.close();
