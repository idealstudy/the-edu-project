const { chromium } = require('playwright');
const path = require('path');

const OUT = '/Users/sj/sj_code_master/d-edu-mvp-g-dashboard/docs/mvp-g/qa-shots-v23.3';
const PROTO_STUDENT = '/Users/sj/sj_code_master/d-edu-mvp-g-dashboard/prototypes/mvp-g-학생hub-교정-v23-opus.html';
const PROTO_TEACHER = '/Users/sj/sj_code_master/d-edu-mvp-g-dashboard/prototypes/mvp-g-교사hub-교정-v23-opus.html';
const DEV_BASE = 'https://dev.d-edu.site';

const VIEWPORTS = [
  { name: 'desktop', width: 1280, height: 1200 },
  { name: 'mobile', width: 390, height: 1400 },
];

const STUDENT_EMAIL = process.env.E2E_STUDENT_EMAIL;
const STUDENT_PW = process.env.E2E_STUDENT_PASSWORD;
const TEACHER_EMAIL = process.env.E2E_TEACHER_EMAIL;
const TEACHER_PW = process.env.E2E_TEACHER_PASSWORD;

async function shotProto(browser, file, prefix) {
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    await page.goto('file://' + file);
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(OUT, `${prefix}-proto-${vp.name}.png`), fullPage: true });
    await ctx.close();
  }
}

async function shotDev(browser, role, prefix) {
  const results = { success: false, error: null };
  for (const vp of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    try {
      await page.goto(DEV_BASE + '/login', { waitUntil: 'domcontentloaded', timeout: 30000 });
      const email = role === 'student' ? STUDENT_EMAIL : TEACHER_EMAIL;
      const pw = role === 'student' ? STUDENT_PW : TEACHER_PW;
      await page.getByTestId('login-email-input').fill(email);
      await page.getByTestId('login-password-input').fill(pw);
      await page.getByTestId('login-submit-button').click();
      // 로그인 기본 랜딩은 학생=/learning(구 1.0 뱃지/포인트 허브), 선생님=/dashboard/teacher/my(마이페이지).
      // v23 재설계 대상은 각각 /dashboard/student(단권화노트·오늘할것 문구 확인됨, src/features/dashboard/components/student/index.tsx)와
      // /dashboard/teacher(내 수업, DASHBOARD.TEACHER) — 로그인 후 명시적으로 이동한다.
      await page.waitForTimeout(1500);
      const target = role === 'student' ? '/dashboard/student' : '/dashboard/teacher';
      await page.goto(DEV_BASE + target, { waitUntil: 'networkidle' }).catch(() => {});
      await page.waitForTimeout(3500);
      await page.screenshot({ path: path.join(OUT, `${prefix}-dev-${vp.name}.png`), fullPage: true });
      results.success = true;
    } catch (e) {
      results.error = String(e);
      try {
        await page.screenshot({ path: path.join(OUT, `${prefix}-dev-${vp.name}-FAILED.png`), fullPage: true });
      } catch (_) {}
    }
    await ctx.close();
  }
  return results;
}

(async () => {
  const browser = await chromium.launch();
  await shotProto(browser, PROTO_STUDENT, 'student');
  await shotProto(browser, PROTO_TEACHER, 'teacher');
  const studentRes = await shotDev(browser, 'student', 'student');
  const teacherRes = await shotDev(browser, 'teacher', 'teacher');
  await browser.close();
  console.log(JSON.stringify({ studentRes, teacherRes }, null, 2));
})();
