import { type Locator, type Page, expect, test } from '@playwright/test';

// Regression: ISSUE-MOBILE-TAP-44 — D-037 적용 뒤에도 390px 화면의 링크 11곳이 44px 미만이었다.
// Found by /qa on 2026-10-05
// Report: docs/build-log.md

type ScreenContract = {
  path: string;
  ready: (page: Page) => Locator;
  minimumCards?: number;
  targets: (page: Page) => Locator[];
};

const ERROR_COPY = /데이터를 불러올 수 없습니다|불러오지 못했어요|에러 발생/;
const INTERACTIVE_SELECTOR =
  'a[href],button,[role="button"],input:not([type="hidden"]),select,textarea,summary,label[for]';

const screens: ScreenContract[] = [
  {
    path: '/register',
    ready: (page) => page.locator('a[href="/login"].underline'),
    targets: (page) => [page.locator('a[href="/login"].underline')],
  },
  {
    path: '/community/column',
    ready: (page) => page.getByTestId('column-card'),
    minimumCards: 3,
    targets: (page) => [
      page.getByRole('link', { name: '칼럼 게시판', exact: true }),
    ],
  },
  {
    path: '/list/study-rooms',
    ready: (page) => page.locator('a[href^="/study-room-preview/"]'),
    minimumCards: 3,
    targets: (page) => [
      page.getByRole('link', { name: '선생님 프로필', exact: true }),
      page.getByRole('link', { name: '스터디룸', exact: true }),
    ],
  },
  {
    path: '/list/teachers',
    ready: (page) => page.locator('a[href^="/profile/teacher/"]'),
    minimumCards: 3,
    targets: (page) => [
      page.getByRole('link', { name: '선생님 프로필', exact: true }),
      page.getByRole('link', { name: '스터디룸', exact: true }),
    ],
  },
  {
    path: '/welcome',
    ready: (page) => page.getByLabel('THE EDU 홈으로 이동'),
    targets: (page) => [
      page.getByLabel('THE EDU 홈으로 이동'),
      page.locator('a[href="mailto:the.edu.devs@gmail.com"]'),
      page.getByLabel('이용약관 전문 보기'),
    ],
  },
  {
    path: '/challenges',
    ready: (page) => page.getByTestId('open-challenge-card'),
    minimumCards: 3,
    targets: (page) => [
      page.getByRole('link', { name: '오픈챌린지', exact: true }),
    ],
  },
  {
    path: '/community/column/38',
    ready: (page) =>
      page
        .locator('.notion-editor-content a.notion-link')
        .filter({ hasText: '디에듀 스터디룸' }),
    targets: (page) => [
      page
        .locator('.notion-editor-content a.notion-link')
        .filter({ hasText: '디에듀 스터디룸' }),
    ],
  },
];

const measureTarget = async (target: Locator) => {
  await target.scrollIntoViewIfNeeded();

  return target.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const offsets: ReadonlyArray<readonly [number, number]> = [
      [0, 0],
      [-21, 0],
      [21, 0],
      [0, -21],
      [0, 21],
    ];
    const hitAtEveryPoint = offsets.every(([x, y]) => {
      const hit = document.elementFromPoint(centerX + x, centerY + y);
      return hit === element || (hit !== null && element.contains(hit));
    });

    return {
      width: Math.round(rect.width * 10) / 10,
      height: Math.round(rect.height * 10) / 10,
      hitAtEveryPoint,
    };
  });
};

const findUndersizedTargets = (page: Page) =>
  page.locator(INTERACTIVE_SELECTOR).evaluateAll((elements) =>
    elements
      .filter((element) => {
        const node = element as HTMLElement;
        const rect = node.getBoundingClientRect();
        return node.offsetParent !== null && rect.width > 0 && rect.height > 0;
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          tag: element.tagName.toLowerCase(),
          text: (
            element.textContent ??
            element.getAttribute('aria-label') ??
            ''
          )
            .trim()
            .slice(0, 30),
          width: Math.round(rect.width * 10) / 10,
          height: Math.round(rect.height * 10) / 10,
        };
      })
      .filter(({ width, height }) => width < 43.5 || height < 43.5)
  );

test('TC-MOBILE-TAP-44-001 390폭 대상 화면은 44px 미만 탭이 없고 중심 ±21px에서 눌린다', async ({
  page,
}) => {
  test.setTimeout(240_000);
  await page.setViewportSize({ width: 390, height: 844 });

  const browserErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });
  page.on('pageerror', (error) => browserErrors.push(error.message));

  for (const screen of screens) {
    const errorCountBeforeNavigation = browserErrors.length;
    const response = await page.goto(screen.path, {
      waitUntil: 'domcontentloaded',
    });
    expect(response?.ok(), `${screen.path} HTTP 응답`).toBe(true);

    await expect(screen.ready(page).first()).toBeVisible({ timeout: 60_000 });
    if (screen.minimumCards !== undefined) {
      await expect
        .poll(() => screen.ready(page).count())
        .toBeGreaterThanOrEqual(screen.minimumCards);
    }
    await expect(page.getByText(ERROR_COPY)).toHaveCount(0);

    const targetMeasurements = [];
    for (const target of screen.targets(page)) {
      await expect(
        target,
        `${screen.path} 대상 링크는 하나여야 한다`
      ).toHaveCount(1);
      const measurement = await measureTarget(target);
      expect(
        measurement.width,
        `${screen.path} 대상 너비`
      ).toBeGreaterThanOrEqual(43.5);
      expect(
        measurement.height,
        `${screen.path} 대상 높이`
      ).toBeGreaterThanOrEqual(43.5);
      expect(
        measurement.hitAtEveryPoint,
        `${screen.path} 대상은 중심에서 상하좌우 21px 지점까지 같은 링크여야 한다`
      ).toBe(true);
      targetMeasurements.push(measurement);
    }

    const undersized = await findUndersizedTargets(page);
    // Runtime measurement is retained as the regression test's audit evidence.
    // eslint-disable-next-line no-console
    console.log(
      `TAP44\t${screen.path}\tcards=${screen.minimumCards === undefined ? 'static' : await screen.ready(page).count()}\tunder44=${undersized.length}\ttargets=${JSON.stringify(targetMeasurements)}`
    );
    expect(undersized, `${screen.path}의 44px 미만 탭 대상`).toEqual([]);
    expect(
      browserErrors.slice(errorCountBeforeNavigation),
      `${screen.path} 브라우저 콘솔 오류`
    ).toEqual([]);
  }
});
