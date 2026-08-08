import {
  type Browser,
  type BrowserContext,
  type Page,
  expect,
} from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

type TestResponse = {
  status(): number;
  text(): Promise<string>;
};

const DEV_ORIGIN = 'https://dev.d-edu.site';

// 화면의 공개 API(api.public)는 BFF 를 거치지 않고 백엔드로 직접 간다
// (shared/api/http/http.transport.ts 의 publicHttp baseURL = env.backendApiUrl).
// 가입처럼 비로그인 상태에서 호출하는 API 는 이 경로를 써야 실제 사용자 경로가 된다.
export const BACKEND_ORIGIN = (
  process.env.BACKEND_API_URL?.trim() || 'https://apidev.d-edu.site/api'
).replace(/\/$/, '');
const SESSION_COOKIE_NAMES = new Set([
  'Authorization',
  'refresh-token',
  'refresh',
  'sid',
]);

export type MvpEFixture = {
  share: { challengeId: number };
  guest: { inviteToken: string; challengeId: number };
  outcomes: Record<
    'WIN' | 'LOSE' | 'BOTH_CORRECT' | 'BOTH_WRONG',
    {
      shareToken: string;
      friendId: number;
      challengeTitle: string;
    }
  >;
  rematch: {
    eligible: {
      shareToken: string;
      friendId: number;
      challengeTitle: string;
      originalChallengeId: number;
      expectedUnitName: string;
    };
    limit: { shareToken: string; friendId: number; challengeTitle: string };
    noCandidate: {
      shareToken: string;
      friendId: number;
      challengeTitle: string;
    };
  };
  strangerMemberId: number;
};

export function requiredEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`QA_REQUIRED_SECRET_MISSING: ${name}`);
  return value;
}

export function loadMvpEFixture(): MvpEFixture {
  const raw = requiredEnv('E2E_MVPE_FIXTURES_JSON');
  try {
    const fixture = JSON.parse(raw) as MvpEFixture;
    const requiredNumbers = [
      fixture?.share?.challengeId,
      fixture?.guest?.challengeId,
      fixture?.strangerMemberId,
      fixture?.rematch?.eligible?.originalChallengeId,
    ];
    const requiredStrings = [
      fixture?.guest?.inviteToken,
      fixture?.rematch?.eligible?.shareToken,
      fixture?.rematch?.eligible?.expectedUnitName,
      fixture?.rematch?.limit?.shareToken,
      fixture?.rematch?.noCandidate?.shareToken,
      ...(['WIN', 'LOSE', 'BOTH_CORRECT', 'BOTH_WRONG'] as const).map(
        (outcome) => fixture?.outcomes?.[outcome]?.shareToken
      ),
    ];
    if (
      requiredNumbers.some((value) => !Number.isInteger(value)) ||
      requiredStrings.some((value) => !value?.trim())
    ) {
      throw new Error('required fixture field is missing');
    }
    return fixture;
  } catch (error) {
    throw new Error(
      `QA_FIXTURE_INVALID: E2E_MVPE_FIXTURES_JSON (${String(error)})`
    );
  }
}

/**
 * 비로그인 컨텍스트. 프로젝트 기본 세션(use.storageState)이 섞이지 않도록
 * 빈 세션을 명시한다. 비회원 도전장·가입 시나리오는 반드시 손님 상태로 시작해야 한다.
 */
export async function newDevContext(browser: Browser): Promise<BrowserContext> {
  return browser.newContext({
    baseURL: DEV_ORIGIN,
    storageState: { cookies: [], origins: [] },
  });
}

export type StudentAccount = '' | '2';

export function sessionStatePath(account: StudentAccount): string {
  return path.join(
    __dirname,
    '..',
    '.auth',
    `student${account || '1'}.state.json`
  );
}

/**
 * UI 로그인을 1회 수행해 세션 상태(쿠키)를 파일로 남긴다. setup 프로젝트 전용.
 */
export async function saveSessionState(
  browser: Browser,
  account: StudentAccount
): Promise<void> {
  const context = await newDevContext(browser);
  try {
    const page = await context.newPage();
    await login(page, account);
    const statePath = sessionStatePath(account);
    fs.mkdirSync(path.dirname(statePath), { recursive: true });
    await context.storageState({ path: statePath });
  } finally {
    await context.close();
  }
}

/**
 * 저장된 세션으로 컨텍스트를 연다. 세션이 없거나 만료됐으면 그 자리에서
 * UI 로그인으로 복구한다. 테스트마다 로그인 화면을 반복하지 않으면서
 * 세션 만료로 인한 위양성 실패도 막는다.
 * 로그인·로그아웃 동작 자체의 회귀 검증은 mvp-e-auth-gate.spec.ts 가 담당한다.
 */
export async function authedDevContext(
  browser: Browser,
  account: StudentAccount = ''
): Promise<BrowserContext> {
  const statePath = sessionStatePath(account);
  const hasState = fs.existsSync(statePath);
  const context = await browser.newContext({
    baseURL: DEV_ORIGIN,
    ...(hasState ? { storageState: statePath } : {}),
  });

  if (hasState) {
    const probe = await context.request.get('/api/v1/member/info');
    if (probe.status() === 200) return context;
  }

  const page = await context.newPage();
  await login(page, account);
  fs.mkdirSync(path.dirname(statePath), { recursive: true });
  await context.storageState({ path: statePath });
  await page.close();
  return context;
}

function sessionCookieNames(page: Page): Promise<string[]> {
  return page
    .context()
    .cookies()
    .then((cookies) =>
      cookies
        .map(({ name }) => name)
        .filter((name) => SESSION_COOKIE_NAMES.has(name))
    );
}

export async function loginWithCredentials(
  page: Page,
  email: string,
  password: string,
  destination: RegExp = /\/(learning|dashboard\/student)(?:[/?#]|$)/,
  loginPath = '/login'
): Promise<void> {
  await page.goto(loginPath);
  await page.getByTestId('login-email-input').fill(email);
  await page.getByTestId('login-password-input').fill(password);

  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/auth/login') &&
      response.request().method() === 'POST'
  );
  await page.getByTestId('login-submit-button').click();
  const response = await responsePromise;
  await expectApi(response, [200], '브라우저 UI POST /api/v1/auth/login');
  await page.waitForURL(destination);

  const cookies = await sessionCookieNames(page);
  // 로그인 직후 실제 제품의 회원 세션 정본 경로를 검증한다.
  const memberMeResponse = await page.request.get('/api/v1/member/info');
  expect(
    {
      authorizationCookie: cookies.includes('Authorization'),
      refreshTokenCookie: cookies.includes('refresh-token'),
      memberMeStatus: memberMeResponse.status(),
    },
    'UI 로그인은 access·refresh 쿠키와 /api/v1/member/info 200을 모두 충족해야 한다'
  ).toEqual({
    authorizationCookie: true,
    refreshTokenCookie: true,
    memberMeStatus: 200,
  });
}

export async function login(page: Page, account: '' | '2' = ''): Promise<void> {
  await loginWithCredentials(
    page,
    requiredEnv(`E2E_STUDENT${account}_EMAIL`),
    requiredEnv(`E2E_STUDENT${account}_PASSWORD`)
  );
}

export async function logout(page: Page): Promise<void> {
  const cookiesBefore = await sessionCookieNames(page);
  expect(cookiesBefore, 'UI 로그아웃 전 access cookie').toContain(
    'Authorization'
  );

  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/api/v1/auth/logout') &&
      response.request().method() === 'POST'
  );
  await page.getByRole('button', { name: '로그아웃' }).click();
  await expectApi(await responsePromise, [200, 204], '브라우저 UI 로그아웃');
  await page.waitForURL(
    (url) =>
      url.origin === DEV_ORIGIN &&
      (url.pathname === '/' || url.pathname === '/login')
  );

  expect(
    await sessionCookieNames(page),
    'UI 로그아웃 후 access/refresh cookie가 모두 제거돼야 한다'
  ).toEqual([]);
}

export async function expectApi(
  response: TestResponse,
  statuses: number[],
  label: string
) {
  const body = await response.text();

  // dev 오리진이 잠깐 죽으면(502/503/504) 화면이 비로그인으로 그려져 인증 결함처럼
  // 보인다. 실제로 2026-08-08 실행에서 그 오독이 났다. 서버가 없어서 못 한 것과
  // 제품이 틀린 것을 섞지 않도록, 게이트웨이 계열 응답은 환경 오류로 분리해 끊는다.
  if (!statuses.includes(response.status()) && response.status() >= 502) {
    throw new Error(
      `[환경 오류] ${label}: dev 서버가 HTTP ${response.status()} 를 반환했습니다. ` +
        '제품 결함이 아니라 서버가 응답하지 않는 상태이니, 서버 상태를 확인한 뒤 다시 실행하세요.'
    );
  }

  expect(
    statuses,
    `${label}: HTTP ${response.status()} ${body.slice(0, 500)}`
  ).toContain(response.status());
  expect(body, `${label}: 401 안내문 노출 금지`).not.toMatch(
    /인증이 필요|로그인이 필요|unauthorized/i
  );
  return body ? (JSON.parse(body) as unknown) : null;
}

export function unwrap<T>(value: unknown): T {
  const record = value as Record<string, unknown>;
  return ((record?.data as Record<string, unknown>)?.data ??
    record?.data ??
    value) as T;
}

export async function drawStroke(page: Page): Promise<void> {
  const surface = page.getByTestId('solution-drawing-surface');
  await expect(surface).toBeVisible();
  await surface.scrollIntoViewIfNeeded();
  const canvas = surface.locator('canvas');
  await expect(canvas).toBeVisible();
  const box = await canvas.boundingBox();
  if (!box) throw new Error('QA_CANVAS_NOT_RENDERED');
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height * 0.25);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.7, {
    steps: 8,
  });
  await page.mouse.up();
  // 빈 strokes도 IndexedDB에 저장되면 "저장됨"이 뜬다. 따라서 빈 캔버스
  // 안내가 실제로 사라진 것을 먼저 확인해야 마우스 입력 성공 증거가 된다.
  await expect(surface.getByText('펜슬로 풀이를 적어보세요')).toHaveCount(0);
  // 그 뒤 부모 React state와 IndexedDB 자동저장까지 기다린다.
  await expect(page.getByText(/^저장됨 /)).toBeVisible();
}

export async function solve(
  page: Page,
  challengeId: number,
  choiceIndex = 0,
  draw = false
) {
  await page.goto(`/open-challenge/${challengeId}`);
  if (draw) await drawStroke(page);
  await page.getByTestId(`choice-option-${choiceIndex}`).click();
  await page.getByTestId('challenge-submit-button').click();
  await page.waitForURL(new RegExp(`/open-challenge/${challengeId}/result`));
}

/**
 * 단답형(SHORT_ANSWER) 문제 풀이. choice-option-N 대신 short-answer-input 에
 * 답을 타이핑한다. mvp-e-v11 단답형 입력칸 기능(회장 지시 2026-08-07) 전용 헬퍼.
 */
export async function solveShortAnswer(
  page: Page,
  challengeId: number,
  answer: string
) {
  await page.goto(`/open-challenge/${challengeId}`);
  const input = page.getByTestId('short-answer-input');
  await expect(input).toBeVisible();
  await input.fill(answer);
  await page.getByTestId('challenge-submit-button').click();
  await page.waitForURL(new RegExp(`/open-challenge/${challengeId}/result`));
}

export function stableMastery(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stableMastery);
  if (!value || typeof value !== 'object') return value;
  const ignored = new Set(['regDate', 'modDate', 'updatedAt', 'lastAttemptAt']);
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>)
      .filter(([key]) => !ignored.has(key))
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, item]) => [key, stableMastery(item)])
  );
}

export function stableAttemptLearningState(value: unknown): unknown {
  const detail = unwrap<{
    attempts?: Array<{
      attemptId: number | string;
      status: string;
      isCorrect: boolean | null;
      selectedAnswer: string | null;
      usedAi?: boolean;
      maxUsedHintStep?: number | null;
    }>;
  }>(value);
  return (detail.attempts ?? [])
    .map((attempt) => ({
      attemptId: String(attempt.attemptId),
      status: attempt.status,
      isCorrect: attempt.isCorrect,
      selectedAnswer: attempt.selectedAnswer,
      usedAi: attempt.usedAi ?? false,
      maxUsedHintStep: attempt.maxUsedHintStep ?? null,
    }))
    .sort((a, b) => a.attemptId.localeCompare(b.attemptId));
}
