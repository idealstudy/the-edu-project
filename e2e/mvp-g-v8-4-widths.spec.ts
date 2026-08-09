import { type Page, expect, test } from '@playwright/test';
import path from 'node:path';

import { findOwnedStudyRoomId } from './helpers/auth';

/**
 * MVP-G 폭별 전수 점검 (v8-4).
 *
 * 여태 검사는 "요소가 있는가, 눌리는가"만 봤기 때문에 화면 밖으로 넘쳐서
 * 잘려 보이는 결함을 전부 통과시켰다. 이 스펙은 폭 3종(데스크톱 1440 ·
 * 태블릿 1024 · 모바일 390)에서 각 화면을 열고
 *   ① 페이지 몸통 가로 넘침(scrollWidth > clientWidth)
 *   ② 넘침을 만든 요소가 무엇인지
 * 를 측정하고 캡처를 남긴다.
 *
 * 승인 디자인 v22(prototypes/mvp-g-3역할-hub-opus.html 108~110)의 기준 프레임은
 * 태블릿 가로 1024 × 768 이다. 즉 1024 는 "좁은 예외"가 아니라 기본 화면이다.
 * 넓은 내용(표)은 v22 322 줄처럼 자기 컨테이너 안에서만 스크롤해야 하고
 * 페이지 몸통은 절대 좌우로 밀리면 안 된다.
 *
 * 실행:
 *   E2E_BASE_URL=https://dev.d-edu.site npx playwright test \
 *     e2e/mvp-g-v8-4-widths.spec.ts --project=widths-v8-4 --workers=1
 */

const WIDTHS = [
  { key: 'desktop', width: 1440, height: 900 },
  { key: 'tablet', width: 1024, height: 768 },
  { key: 'mobile', width: 390, height: 844 },
] as const;

const SHOT_DIR = path.resolve(
  process.cwd(),
  '../docs/mvp-g/qa-screens-v8-4-widths'
);

type Overflow = {
  bodyOverflow: boolean;
  scrollWidth: number;
  clientWidth: number;
  offenders: string[];
  /** 자기 상자 안에서 가로로 넘쳐 버튼·글자가 잘려 보이는 자리. */
  clipped: string[];
};

/** 페이지 몸통 가로 넘침과 그 원인 요소를 재는 계측기. */
const measure = async (page: Page): Promise<Overflow> =>
  page.evaluate(() => {
    const root = document.documentElement;
    const limit = root.clientWidth;
    const offenders: string[] = [];
    for (const el of Array.from(
      document.body.querySelectorAll<HTMLElement>('*')
    )) {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      if (rect.right <= limit + 1) continue;
      const style = getComputedStyle(el);
      // 자기 안에서 스크롤되는 컨테이너의 자식은 원인이 아니다.
      let scrolls = false;
      for (let p = el.parentElement; p; p = p.parentElement) {
        const ov = getComputedStyle(p).overflowX;
        if (ov === 'auto' || ov === 'scroll' || ov === 'hidden') {
          scrolls = true;
          break;
        }
      }
      if (scrolls) continue;
      const cls =
        typeof el.className === 'string' ? el.className.slice(0, 90) : '';
      offenders.push(
        `${el.tagName.toLowerCase()}${el.id ? `#${el.id}` : ''}.${cls} right=${Math.round(rect.right)}`
      );
      if (offenders.length >= 6) break;
    }
    // 페이지 몸통이 안 밀려도 상자 안에서 잘리면 사람 눈에는 "안 보이는 것"이다.
    // 특히 그 안에 버튼이 걸려 있으면 누를 수가 없어 조작 불가가 된다.
    const clipped: string[] = [];
    for (const box of Array.from(
      document.body.querySelectorAll<HTMLElement>('*')
    )) {
      const ov = getComputedStyle(box).overflowX;
      if (ov !== 'auto' && ov !== 'scroll' && ov !== 'hidden') continue;
      if (box.scrollWidth <= box.clientWidth + 1) continue;
      const edge = box.getBoundingClientRect().right;
      const buttons = Array.from(
        box.querySelectorAll<HTMLElement>('button,a,input,select,textarea')
      ).filter((el) => el.getBoundingClientRect().right > edge + 1);
      const cls =
        typeof box.className === 'string' ? box.className.slice(0, 60) : '';
      clipped.push(
        `${box.tagName.toLowerCase()}.${cls} 넘침=${box.scrollWidth - box.clientWidth}px 잘린조작요소=${buttons.length}`
      );
      if (clipped.length >= 6) break;
    }
    return {
      bodyOverflow: root.scrollWidth > root.clientWidth,
      scrollWidth: root.scrollWidth,
      clientWidth: root.clientWidth,
      offenders,
      clipped,
    };
  });

const auditScreen = async (page: Page, name: string, url: string) => {
  for (const v of WIDTHS) {
    // 한 화면이 무너져도 나머지 전수 점검은 끝까지 돌아야 한다.
    try {
      await page.setViewportSize({ width: v.width, height: v.height });
      await page.goto(url);
      await page.waitForLoadState('networkidle').catch(() => undefined);
      await page.waitForTimeout(600);
      const result = await measure(page);
      await page.screenshot({
        path: path.join(SHOT_DIR, `${name}-${v.width}.png`),
      });
      console.log(
        `WIDTHCHECK\t${name}\t${v.width}\t넘침=${result.bodyOverflow}\tscrollWidth=${result.scrollWidth}\tclientWidth=${result.clientWidth}\t원인=${result.offenders.join(' | ') || '없음'}\t상자안잘림=${result.clipped.join(' | ') || '없음'}`
      );
    } catch (error) {
      console.log(
        `WIDTHCHECK\t${name}\t${v.width}\t측정실패\t${(error as Error).message.split('\n')[0]}`
      );
    }
  }
};

const login = async (page: Page, email: string, password: string) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/login');
  await page.getByTestId('login-email-input').fill(email);
  await page.getByTestId('login-password-input').fill(password);
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL((u) => !u.pathname.startsWith('/login'), {
    timeout: 30_000,
  });
};

// 계정 충돌을 피하려 항상 --workers=1 로 돌린다. serial 은 쓰지 않는다.
// 한 역할이 실패했다고 나머지 역할 점검을 건너뛰면 전수 점검이 아니게 된다.
test.setTimeout(300_000);

test('로그인 화면 폭별 점검', async ({ page }) => {
  await auditScreen(page, 'login', '/login');
});

test('학생 화면 폭별 점검', async ({ page }) => {
  await login(
    page,
    process.env.E2E_STUDENT_EMAIL!,
    process.env.E2E_STUDENT_PASSWORD!
  );
  await auditScreen(page, 'student-learning', '/learning');
  await auditScreen(page, 'student-dashboard', '/dashboard/student');
  await auditScreen(page, 'student-tree', '/tree');
  await auditScreen(
    page,
    'student-unit-notes',
    '/dashboard/student/unit-notes'
  );
  await auditScreen(page, 'student-look-back', '/dashboard/student/look-back');
});

test('선생님 화면 폭별 점검', async ({ page }) => {
  await login(
    page,
    process.env.E2E_TEACHER_EMAIL!,
    process.env.E2E_TEACHER_PASSWORD!
  );
  await auditScreen(page, 'teacher-dashboard', '/dashboard/teacher');
  await auditScreen(page, 'teacher-exams', '/dashboard/teacher/exams');
  await auditScreen(page, 'teacher-my', '/dashboard/teacher/my');
  const roomId = await findOwnedStudyRoomId(page);
  await auditScreen(page, 'teacher-manage', `/study-rooms/${roomId}/manage`);
});

test('관리자 화면 폭별 점검', async ({ page }) => {
  await login(
    page,
    process.env.E2E_ADMIN_EMAIL!,
    process.env.E2E_ADMIN_PASSWORD!
  );
  await auditScreen(page, 'admin-members', '/admin/members');
  await auditScreen(page, 'admin-study-rooms', '/admin/study-rooms');
  await auditScreen(page, 'admin-public-exams', '/admin/public-exams');
  await auditScreen(page, 'admin-question-bank', '/admin/question-bank');
  await auditScreen(page, 'admin-consultations', '/admin/consultations');
});

test('페이지 몸통은 어느 폭에서도 가로로 밀리지 않는다', async ({ page }) => {
  await login(
    page,
    process.env.E2E_ADMIN_EMAIL!,
    process.env.E2E_ADMIN_PASSWORD!
  );
  for (const v of WIDTHS) {
    await page.setViewportSize({ width: v.width, height: v.height });
    await page.goto('/admin/consultations');
    await page.waitForLoadState('networkidle').catch(() => undefined);
    await page.waitForTimeout(600);
    const result = await measure(page);
    expect(
      result.bodyOverflow,
      `${v.width}px 에서 페이지 몸통이 가로로 넘쳤다: ${result.offenders.join(' | ')}`
    ).toBe(false);
  }
});
