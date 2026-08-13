import { chromium } from 'playwright';
const API='https://apidev.d-edu.site/api', APP='https://dev.d-edu.site', TOK=process.env.TOK, OUT=process.argv[2];
async function ck(em,pw){const r=await fetch(API+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:em,password:pw})});
 return r.headers.getSetCookie().map(c=>{const nv=c.split(';')[0],i=nv.indexOf('=');return{name:nv.slice(0,i),value:nv.slice(i+1),domain:'.d-edu.site',path:'/'}}).filter(c=>c.value);}
const b=await chromium.launch();
for(const [em,pw,tag] of [[process.env.E2E_STUDENT_EMAIL,process.env.E2E_STUDENT_PASSWORD,'lose'],[process.env.E2E_STUDENT2_EMAIL,process.env.E2E_STUDENT2_PASSWORD,'win']]){
 const cs=await ck(em,pw);
 for(const [n,w,h] of [['web',1440,900],['tab',768,1024],['mob',390,844]]){
  const ctx=await b.newContext({viewport:{width:w,height:h}}); await ctx.addCookies(cs);
  const p=await ctx.newPage();
  const r=await p.goto(`${APP}/friends/challenge/${TOK}/result`,{waitUntil:'networkidle',timeout:90000});
  await p.waitForTimeout(4000);
  await p.screenshot({path:`${OUT}/dev-${tag}-${n}.png`,fullPage:true});
  console.log(tag,n,r?.status()); await ctx.close();
 }
 const c2=await b.newContext({viewport:{width:1440,height:900}}); await c2.addCookies(cs);
 const p2=await c2.newPage(); await p2.goto(`${APP}/friends`,{waitUntil:'networkidle',timeout:90000}); await p2.waitForTimeout(3500);
 await p2.screenshot({path:`${OUT}/dev-friends-${tag}.png`,fullPage:true}); await c2.close();
}
await b.close();
