import { devices, expect, test } from '@playwright/test';

const openLogin = async (page: import('@playwright/test').Page) => {
  const response = await page.goto('/login');
  expect(response?.ok()).toBe(true);
};

const observeBrowserErrors = (page: import('@playwright/test').Page) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
};

test.describe('휴대폰 데스크톱 사이트 안내', () => {
  test('DST-E2E-001 Pixel 7 정상 모바일 화면에는 안내가 없다', async ({
    browser,
  }) => {
    const context = await browser.newContext({ ...devices['Pixel 7'] });
    const page = await context.newPage();
    const browserErrors = observeBrowserErrors(page);

    try {
      await openLogin(page);
      await expect(page.getByTestId('desktop-site-notice')).toHaveCount(0);
      expect(browserErrors).toEqual([]);
    } finally {
      await context.close();
    }
  });

  test('DST-E2E-002 화면 412와 뷰포트 980인 터치 환경에는 안내가 보인다', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      ...devices['Pixel 7'],
      viewport: { width: 980, height: 1800 },
      screen: { width: 412, height: 915 },
      hasTouch: true,
    });
    const page = await context.newPage();
    const browserErrors = observeBrowserErrors(page);

    try {
      await openLogin(page);
      await expect(page.getByTestId('desktop-site-notice')).toBeVisible();
      await expect(page.getByTestId('desktop-site-notice')).toContainText(
        "크롬 메뉴(⋮)에서 '데스크톱 사이트' 체크를 꺼 주세요."
      );
      expect(browserErrors).toEqual([]);
    } finally {
      await context.close();
    }
  });

  test('DST-E2E-003 데스크톱 1440에는 안내가 없다', async ({ browser }) => {
    const context = await browser.newContext({
      ...devices['Desktop Chrome'],
      viewport: { width: 1440, height: 900 },
      screen: { width: 1440, height: 900 },
      hasTouch: false,
    });
    const page = await context.newPage();
    const browserErrors = observeBrowserErrors(page);

    try {
      await openLogin(page);
      await expect(page.getByTestId('desktop-site-notice')).toHaveCount(0);
      expect(browserErrors).toEqual([]);
    } finally {
      await context.close();
    }
  });

  test('DST-E2E-004 짧은 변 1024인 터치 태블릿에는 안내가 없다', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      ...devices['Desktop Chrome'],
      viewport: { width: 1024, height: 768 },
      screen: { width: 1024, height: 1366 },
      hasTouch: true,
    });
    const page = await context.newPage();
    const browserErrors = observeBrowserErrors(page);

    try {
      await openLogin(page);
      await expect(page.getByTestId('desktop-site-notice')).toHaveCount(0);
      expect(browserErrors).toEqual([]);
    } finally {
      await context.close();
    }
  });
});
