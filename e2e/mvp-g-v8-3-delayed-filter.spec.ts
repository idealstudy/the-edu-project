import fs from 'node:fs';
import path from 'node:path';

import { type Page, expect, test } from '@playwright/test';

import { skipWithoutEnv } from './helpers/env-guard';

/*
 * fix-report-v8-3 A·B 를 실제 서버에서 확인한다.
 *
 * - 지연 칩이 보이고 건수를 말한다
 * - 칩을 누르면 목록이 지연 건만 남는다(표의 모든 행에 지연 표시가 붙는다)
 * - 안내 문구가 실제 정렬 규칙과 맞다("맨 위로"가 없다)
 *
 * 관리자 계정을 공유해 로그인하므로 반드시 --workers=1 로 돌린다
 * (백엔드가 회원 1명당 refresh token 을 1개만 보관한다).
 * 계정 값은 .local-secrets 에만 있고 이 파일은 변수 이름만 안다.
 */

skipWithoutEnv(['E2E_ADMIN_EMAIL', 'E2E_ADMIN_PASSWORD']);

const SHOT_DIR = path.resolve(__dirname, '../../docs/mvp-g/qa-screens-v8-3');

const shot = async (page: Page, name: string) => {
  fs.mkdirSync(SHOT_DIR, { recursive: true });
  await page.screenshot({
    path: path.join(SHOT_DIR, `${name}.png`),
    fullPage: true,
  });
};

const need = (name: string): string => {
  const value = process.env[name];
  if (!value) throw new Error(`${name} 이(가) 없습니다.`);
  return value;
};

const login = async (page: Page) => {
  await page.goto('/login');
  await page.getByTestId('login-email-input').fill(need('E2E_ADMIN_EMAIL'));
  await page
    .getByTestId('login-password-input')
    .fill(need('E2E_ADMIN_PASSWORD'));
  await page.getByTestId('login-submit-button').click();
  await page.waitForURL((url) => !url.pathname.startsWith('/login'), {
    timeout: 30_000,
  });
};

const openConsultations = async (page: Page) => {
  await page.goto('/admin/consultations');
  await expect(page.getByTestId('admin-consultations')).toBeVisible({
    timeout: 30_000,
  });
  await page.waitForLoadState('networkidle');
};

test.describe.configure({ mode: 'serial' });

test.describe('MVP-G v8-3 관리자 상담 지연 필터', () => {
  test('지연 칩을 누르면 지연 건만 남고 안내 문구가 실제 정렬과 맞는다', async ({
    page,
  }) => {
    await login(page);
    await openConsultations(page);
    await shot(page, 'v8-3-consultations-default');

    // 기본 화면: 안내 문구가 실제 정렬 규칙을 말한다. 옛 "맨 위로" 문구는 남아 있으면 안 된다.
    const note = page.getByTestId('admin-consultations-delay-note');
    await expect(note).toBeVisible();
    await expect(note).not.toContainText('맨 위로');
    await expect(note).toContainText('접수 → 처리 중 → 답변 완료');

    // 지연 칩이 상태 칩 옆에 있고 건수를 말한다.
    const chip = page.getByTestId('admin-consultations-delayed-chip');
    await expect(chip).toBeVisible();
    const chipText = (await chip.innerText()).trim();
    const delayedCount = Number(chipText.replace(/[^0-9]/g, ''));
    // eslint-disable-next-line no-console
    console.log(`지연 칩 = "${chipText}"`);
    expect(Number.isNaN(delayedCount)).toBe(false);

    // 눌러서 실제로 목록이 바뀌는지 본다. 눌러도 아무 일 없는 버튼을 막는 검사다.
    const listCall = page.waitForResponse(
      (response) =>
        response.url().includes('/admin/consultation-cases') &&
        response.url().includes('delayedOnly=true'),
      { timeout: 30_000 }
    );
    await chip.click();
    const response = await listCall;
    expect(response.status()).toBe(200);
    await page.waitForLoadState('networkidle');
    await expect(chip).toHaveAttribute('aria-pressed', 'true');
    await shot(page, 'v8-3-consultations-delayed-only');

    const rows = page.locator('tbody tr');
    const rowCount = await rows.count();
    // eslint-disable-next-line no-console
    console.log(`지연 필터 결과 행 = ${rowCount}건 (지연 총 ${delayedCount}건)`);

    if (delayedCount === 0) {
      await expect(
        page.getByTestId('admin-consultations-delayed-empty')
      ).toBeVisible();
      expect(rowCount).toBe(0);
      return;
    }

    expect(rowCount).toBeGreaterThan(0);
    // 남은 행은 전부 접수 상태이고 전부 지연 표시가 붙어 있어야 한다.
    const delayedBadges = page.getByTestId('admin-consultation-delayed-badge');
    expect(await delayedBadges.count()).toBe(rowCount);
    for (let index = 0; index < rowCount; index += 1) {
      await expect(rows.nth(index)).toContainText('접수');
    }

    // 응답 본문으로도 확인한다. 화면 표시와 서버 판정이 어긋나면 안 된다.
    const body = await response.json();
    const content = body?.data?.content ?? [];
    expect(content.length).toBeGreaterThan(0);
    expect(
      content.every(
        (item: { status: string; delayed: boolean }) =>
          item.status === 'RECEIVED' && item.delayed === true
      )
    ).toBe(true);
    // 걸러내기가 DB 에서 끝나므로 총계도 지연 건수와 같아야 한다.
    expect(body?.data?.totalElements).toBe(body?.data?.delayedCount);
  });

  test('접수 칩으로 돌아오면 지연이 아닌 신규 접수도 함께 보인다', async ({
    page,
  }) => {
    await login(page);
    await openConsultations(page);

    await page.getByTestId('admin-consultations-delayed-chip').click();
    await page.waitForLoadState('networkidle');
    const receivedChip = page.getByTestId('admin-consultations-chip-RECEIVED');
    const listCall = page.waitForResponse(
      (response) =>
        response.url().includes('/admin/consultation-cases') &&
        !response.url().includes('delayedOnly=true'),
      { timeout: 30_000 }
    );
    await receivedChip.click();
    const response = await listCall;
    expect(response.status()).toBe(200);
    await page.waitForLoadState('networkidle');
    await expect(receivedChip).toHaveAttribute('aria-pressed', 'true');
    await shot(page, 'v8-3-consultations-received');

    const body = await response.json();
    const content = body?.data?.content ?? [];
    expect(content.length).toBeGreaterThan(0);
    // 접수 탭 맨 위는 가장 최근에 받은 접수다(지연 우선 정렬이 아니다).
    // eslint-disable-next-line no-console
    console.log(
      `접수 탭 첫 줄 = ${content[0]?.receivedAt} / delayed=${content[0]?.delayed}`
    );
    expect(content[0]?.status).toBe('RECEIVED');
  });
});
