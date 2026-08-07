import type { Page } from '@playwright/test';

import { okBody } from './api-mock';

export async function setAuthCookie(page: Page) {
  const baseURL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';
  await page.context().addCookies([
    {
      name: 'Authorization',
      value: 'test-token',
      url: baseURL,
    },
  ]);
}

export async function mockMemberInfo(page: Page, member: object) {
  await page.route('**/api/v1/member/info', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: okBody(member),
    });
  });
}
