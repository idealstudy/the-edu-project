import { type Page, expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

import {
  loginWithCredentials,
  requiredEnv,
  unwrap,
} from './helpers/mvp-e-devremote';

const WIDTHS = [390, 512, 834, 1024, 1280] as const;
const ROLES = ['student', 'teacher'] as const;
const SCREENS = ['DASH', 'ROOM'] as const;
const CAPTURE_LABEL = process.env.WEB_MOBILE_PHASE2_LABEL?.trim() || 'after';
const IS_BASELINE = CAPTURE_LABEL === 'before';
const WIDTH_OVERRIDE_VALUES = (process.env.WEB_MOBILE_PHASE2_WIDTHS ?? '')
  .split(',')
  .map((width) => width.trim())
  .filter(Boolean);
const WIDTH_OVERRIDE = WIDTH_OVERRIDE_VALUES.map(Number);
const INVALID_WIDTHS = WIDTH_OVERRIDE_VALUES.filter(
  (_, index) =>
    !WIDTHS.includes(WIDTH_OVERRIDE[index] as (typeof WIDTHS)[number])
);
if (INVALID_WIDTHS.length > 0) {
  throw new Error(
    `WEB_MOBILE_PHASE2_WIDTHS 지원하지 않는 값: ${INVALID_WIDTHS.join(', ')} (허용: ${WIDTHS.join(', ')})`
  );
}
const RUN_WIDTHS =
  WIDTH_OVERRIDE.length > 0
    ? WIDTH_OVERRIDE
    : IS_BASELINE
      ? WIDTHS.slice(-2)
      : WIDTHS;
const parseOverride = <T extends string>(
  raw: string | undefined,
  allowed: readonly T[],
  label: string,
  normalize: (value: string) => string
) => {
  const values = (raw ?? '')
    .split(',')
    .map((value) => normalize(value.trim()))
    .filter(Boolean);
  const invalid = values.filter((value) => !allowed.includes(value as T));
  if (invalid.length > 0) {
    throw new Error(
      `${label} 지원하지 않는 값: ${invalid.join(', ')} (허용: ${allowed.join(', ')})`
    );
  }
  return new Set(values as T[]);
};
const ROLE_OVERRIDE = parseOverride(
  process.env.WEB_MOBILE_PHASE2_ROLES,
  ROLES,
  'WEB_MOBILE_PHASE2_ROLES',
  (value) => value.toLowerCase()
);
const SCREEN_OVERRIDE = parseOverride(
  process.env.WEB_MOBILE_PHASE2_SCREENS,
  SCREENS,
  'WEB_MOBILE_PHASE2_SCREENS',
  (value) => value.toUpperCase()
);
const STUDENT_ACCOUNT =
  process.env.WEB_MOBILE_PHASE2_STUDENT_ACCOUNT?.trim() ?? '';
if (STUDENT_ACCOUNT !== '' && STUDENT_ACCOUNT !== '2') {
  throw new Error(
    `WEB_MOBILE_PHASE2_STUDENT_ACCOUNT 지원하지 않는 값: ${STUDENT_ACCOUNT} (허용: 빈 값, 2)`
  );
}
const OUT_DIR = path.resolve(process.cwd(), '../docs/qa/web-mobile-v12/phase2');

type Room = { id: number; name: string };

const waitForStableFrame = async (page: Page) => {
  await page.waitForLoadState('domcontentloaded');
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(
    () =>
      document.readyState === 'complete' &&
      document.querySelector('[data-private-app-shell]') !== null
  );
  await page.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
      })
  );
};

test.describe('web-mobile-v12 phase2 실제 계정 반응형 셸', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(15 * 60 * 1000);

  test('학생·선생님 5폭 셸을 캡처하고 수치를 기록한다', async ({
    browser,
    baseURL,
  }) => {
    expect(baseURL, '테스트 기준 URL').toBeTruthy();
    const origin = baseURL!;
    fs.mkdirSync(OUT_DIR, { recursive: true });
    const results: Array<Record<string, unknown>> = [];

    const roles = (
      [
        {
          id: 'student',
          emailEnv: `E2E_STUDENT${STUDENT_ACCOUNT}_EMAIL`,
          passwordEnv: `E2E_STUDENT${STUDENT_ACCOUNT}_PASSWORD`,
          destination: /\/(?:learning|dashboard\/student)(?:[/?#]|$)/,
          dashboard: '/dashboard/student',
          roomEndpoint: '/api/v1/student/dashboard/study-rooms',
        },
        {
          id: 'teacher',
          emailEnv: 'E2E_TEACHER_EMAIL',
          passwordEnv: 'E2E_TEACHER_PASSWORD',
          destination: /\/dashboard\/teacher(?:[/?#]|$)/,
          dashboard: '/dashboard/teacher',
          roomEndpoint: '/api/v1/teacher/dashboard/study-rooms',
        },
      ] as const
    ).filter((role) => ROLE_OVERRIDE.size === 0 || ROLE_OVERRIDE.has(role.id));

    for (const role of roles) {
      const context = await browser.newContext({
        baseURL,
        viewport: { width: 390, height: 900 },
      });
      const page = await context.newPage();
      const consoleErrors: string[] = [];
      const pageErrors: string[] = [];
      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });
      page.on('pageerror', (error) => pageErrors.push(error.message));

      await loginWithCredentials(
        page,
        requiredEnv(role.emailEnv),
        requiredEnv(role.passwordEnv),
        role.destination
      );

      const screens: Array<{
        id: (typeof SCREENS)[number];
        route: string;
      }> = [{ id: 'DASH', route: role.dashboard }];
      const needsRoomScreen =
        SCREEN_OVERRIDE.size === 0 || SCREEN_OVERRIDE.has('ROOM');
      let primaryRoom: Room | undefined;
      if (role.id === 'student' || needsRoomScreen) {
        const roomResponse = await page.request.get(role.roomEndpoint);
        expect(roomResponse.status(), `${role.id} 스터디룸 목록`).toBe(200);
        const rooms = unwrap<Room[]>(await roomResponse.json());
        primaryRoom = rooms[0];
      }
      if (needsRoomScreen) {
        expect(primaryRoom, `${role.id} 첫 스터디룸`).toBeTruthy();
        if (!primaryRoom) throw new Error(`${role.id} 첫 스터디룸 없음`);
        screens.push({
          id: 'ROOM',
          route: `/study-rooms/${primaryRoom.id}/note`,
        });
      }

      for (const width of RUN_WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        for (const screen of screens.filter(
          (screen) =>
            SCREEN_OVERRIDE.size === 0 || SCREEN_OVERRIDE.has(screen.id)
        )) {
          const consoleStart = consoleErrors.length;
          const pageErrorStart = pageErrors.length;
          const response = await page.goto(screen.route);
          await waitForStableFrame(page);
          if (role.id === 'student' && width < 1024) {
            await expect(
              page.getByTestId('student-bottom-navigation').getByRole('link'),
              '스터디룸 유무에 따른 학생 하단 탭 수'
            ).toHaveCount(primaryRoom ? 6 : 5);
          }

          const metrics = await page.evaluate(() => {
            const doc = document.documentElement;
            const bottomNav = document.querySelector<HTMLElement>(
              '[data-testid="student-bottom-navigation"]'
            );
            const sidebar = document.querySelector<HTMLElement>(
              '[data-dashboard-sidebar]'
            );
            const sidebarPanel = sidebar?.querySelector<HTMLElement>('aside');
            const appHeader = document.querySelector<HTMLElement>(
              '[data-dashboard-app-header]'
            );
            const globalHeader = document.querySelector<HTMLElement>(
              '[data-global-header]'
            );
            const queryDevtoolsButton = document.querySelector<HTMLElement>(
              'button[aria-label="Open Tanstack query devtools"]'
            );
            const visible = (element: HTMLElement | null) =>
              Boolean(
                element &&
                  element.getBoundingClientRect().width > 0 &&
                  element.getBoundingClientRect().height > 0
              );
            const bottomTargets = bottomNav
              ? Array.from(bottomNav.querySelectorAll<HTMLElement>('a')).map(
                  (element) => {
                    const rect = element.getBoundingClientRect();
                    return {
                      label: element.getAttribute('aria-label'),
                      width: Math.round(rect.width * 100) / 100,
                      height: Math.round(rect.height * 100) / 100,
                    };
                  }
                )
              : [];
            const bottomNavRect = bottomNav?.getBoundingClientRect() ?? null;
            const queryDevtoolsRect =
              queryDevtoolsButton?.getBoundingClientRect() ?? null;
            const queryDevtoolsOverlapsBottomNav = Boolean(
              bottomNavRect &&
                queryDevtoolsRect &&
                queryDevtoolsRect.left < bottomNavRect.right &&
                queryDevtoolsRect.right > bottomNavRect.left &&
                queryDevtoolsRect.top < bottomNavRect.bottom &&
                queryDevtoolsRect.bottom > bottomNavRect.top
            );

            return {
              scrollWidth: doc.scrollWidth,
              clientWidth: doc.clientWidth,
              overflow: doc.scrollWidth - doc.clientWidth,
              bottomNavVisible: visible(bottomNav),
              bottomNavLabels: bottomTargets.map((target) => target.label),
              bottomTargets,
              bottomNavRect: bottomNavRect
                ? {
                    top: bottomNavRect.top,
                    right: bottomNavRect.right,
                    bottom: bottomNavRect.bottom,
                    left: bottomNavRect.left,
                  }
                : null,
              queryDevtoolsRect: queryDevtoolsRect
                ? {
                    top: queryDevtoolsRect.top,
                    right: queryDevtoolsRect.right,
                    bottom: queryDevtoolsRect.bottom,
                    left: queryDevtoolsRect.left,
                  }
                : null,
              queryDevtoolsOverlapsBottomNav,
              sidebarVisible: visible(sidebarPanel ?? sidebar),
              sidebarRect: sidebarPanel
                ? {
                    width: sidebarPanel.getBoundingClientRect().width,
                    height: sidebarPanel.getBoundingClientRect().height,
                    display: getComputedStyle(sidebarPanel).display,
                  }
                : null,
              globalHeaderHeight: globalHeader
                ? Math.round(
                    globalHeader.getBoundingClientRect().height * 100
                  ) / 100
                : null,
              appHeaderHeight: appHeader
                ? Math.round(appHeader.getBoundingClientRect().height * 100) /
                  100
                : null,
              topBarHeight: appHeader
                ? Math.round(appHeader.getBoundingClientRect().height * 100) /
                  100
                : globalHeader
                  ? Math.round(
                      globalHeader.getBoundingClientRect().height * 100
                    ) / 100
                  : null,
              standalone: matchMedia('(display-mode: standalone)').matches,
            };
          });

          expect(response?.status(), `${role.id} ${screen.id} HTTP`).toBe(200);
          expect(metrics.overflow, `${role.id} ${screen.id} ${width}px`).toBe(
            0
          );
          if (width < 1024) {
            expect(metrics.topBarHeight, 'v12 모바일 상단바 높이').toBe(60);
          } else {
            expect(
              metrics.topBarHeight,
              '기존 데스크톱 상단바 렌더'
            ).toBeGreaterThan(0);
          }
          if (role.id === 'student') {
            if (width < 1024) {
              expect(metrics.bottomNavVisible).toBe(true);
              expect(metrics.bottomNavLabels).toEqual(
                primaryRoom
                  ? ['학습', '교무실', '성과', '회고', '오답', '나']
                  : ['학습', '성과', '회고', '오답', '나']
              );
              expect(
                metrics.queryDevtoolsRect,
                'TanStack Query 개발 버튼 실측 사각형'
              ).not.toBeNull();
              expect(
                metrics.queryDevtoolsOverlapsBottomNav,
                `TanStack Query 버튼 ${JSON.stringify(metrics.queryDevtoolsRect)} / 하단 탭 ${JSON.stringify(metrics.bottomNavRect)}`
              ).toBe(false);
              await expect(page.getByText(/^포인트\s+[\d,]+P$/)).toBeHidden();
              for (const target of metrics.bottomTargets) {
                expect(
                  target.height,
                  `${target.label} 터치 높이`
                ).toBeGreaterThanOrEqual(44);
                expect(
                  target.width,
                  `${target.label} 터치 너비`
                ).toBeGreaterThanOrEqual(44);
              }
              expect(metrics.sidebarVisible).toBe(false);
            } else {
              expect(metrics.bottomNavVisible).toBe(false);
              expect(
                metrics.sidebarVisible,
                `${role.id} ${screen.id} ${width}px sidebar ${JSON.stringify(metrics.sidebarRect)}`
              ).toBe(true);
            }
          } else {
            expect(metrics.bottomNavVisible).toBe(false);
            expect(metrics.sidebarVisible).toBe(width >= 1024);
          }

          let d034MobileMenuHidden: boolean | null = null;
          if (role.id === 'teacher' && width < 768) {
            await page.getByRole('button', { name: '햄버거 메뉴' }).click();
            const forbiddenLabels = ['오픈챌린지', '코스', '게시판'];
            const forbiddenCounts = await Promise.all(
              forbiddenLabels.map((label) =>
                page.getByRole('link', { name: label }).count()
              )
            );
            d034MobileMenuHidden = forbiddenCounts.every(
              (count) => count === 0
            );
            expect(d034MobileMenuHidden).toBe(true);
            await page.keyboard.press('Escape');
          }

          await page.screenshot({
            path: path.join(
              OUT_DIR,
              `${role.id.toUpperCase()}-${screen.id}__${width}__${CAPTURE_LABEL}.png`
            ),
            fullPage: false,
          });

          results.push({
            captureLabel: CAPTURE_LABEL,
            role: role.id,
            screen: screen.id,
            route: screen.route,
            width,
            httpStatus: response?.status() ?? null,
            ...metrics,
            d034MobileMenuHidden,
            consoleErrors: consoleErrors.slice(consoleStart),
            pageErrors: pageErrors.slice(pageErrorStart),
          });
          if (!IS_BASELINE) {
            expect(
              consoleErrors.slice(consoleStart),
              `${role.id} ${screen.id} ${width}px 콘솔 오류`
            ).toEqual([]);
            expect(
              pageErrors.slice(pageErrorStart),
              `${role.id} ${screen.id} ${width}px 페이지 오류`
            ).toEqual([]);
          }
        }
      }

      await context.close();
    }

    const manifestResponse = await fetch(
      new URL('/manifest.webmanifest', origin).toString()
    );
    expect(manifestResponse.status).toBe(200);
    const manifest = (await manifestResponse.json()) as {
      display?: string;
      theme_color?: string;
      background_color?: string;
    };
    expect(manifest.display).toBe('standalone');
    expect(manifest.theme_color).toBe('#FF4805');
    expect(manifest.background_color).toBe('#F9F9F9');
    results.push({
      captureLabel: CAPTURE_LABEL,
      pwaManifest: {
        status: manifestResponse.status,
        display: manifest.display,
        themeColor: manifest.theme_color,
        backgroundColor: manifest.background_color,
      },
    });

    fs.writeFileSync(
      path.join(OUT_DIR, `metrics-${CAPTURE_LABEL}.json`),
      `${JSON.stringify(results, null, 2)}\n`
    );
  });
});
