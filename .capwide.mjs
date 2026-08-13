import { chromium } from 'playwright';
const API='https://apidev.d-edu.site/api', APP='https://dev.d-edu.site', OUT=process.argv[2];
async function ck(em,pw){const r=await fetch(API+'/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email:em,password:pw})});
 return r.headers.getSetCookie().map(c=>{const nv=c.split(';')[0],i=nv.indexOf('=');return{name:nv.slice(0,i),value:nv.slice(i+1),domain:'.d-edu.site',path:'/'}}).filter(c=>c.value);}
const b=await chromium.launch(); const cs=await ck(process.env.E2E_STUDENT_EMAIL,process.env.E2E_STUDENT_PASSWORD);
for(const [w,n] of [[1920,'1920'],[1600,'1600']]){
 const ctx=await b.newContext({viewport:{width:w,height:1000}}); await ctx.addCookies(cs);
 const p=await ctx.newPage(); await p.goto(`${APP}/friends`,{waitUntil:'networkidle',timeout:90000}); await p.waitForTimeout(3500);
 await p.screenshot({path:`${OUT}/friends-${n}.png`,fullPage:true}); console.log(n,'ok'); await ctx.close();
}
await b.close();
