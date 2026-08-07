import { PRIVATE, PUBLIC } from '@/shared/constants';
import { type Locator, type Page, expect, test } from '@playwright/test';

import { loginAsStudent } from './helpers/auth';

/* ─────────────────────────────────────────────────────
 * AI 코치 손글씨 캡처 헬퍼
 *  - drawDiagonalStroke: 드로잉 캔버스에 실제 마우스 포인터 이벤트로 획을 그린다.
 *  - readPngSize: PNG IHDR 청크에서 폭/높이를 직접 파싱한다(외부 의존 없음).
 *    시그니처 8B + length 4B + "IHDR" 4B 다음에 width(4B BE)·height(4B BE).
 *  - startAiCoach: "AI 힌트 받기" 클릭 후, 맞춤 설정 다이얼로그가 뜨면
 *    "나중에 할게요"로 건너뛴다(이미 설정을 저장해둔 계정이면 안 뜬다).
 * ────────────────────────────────────────────────────*/
async function drawDiagonalStroke(page: Page, canvas: Locator) {
  const box = await canvas.boundingBox();
  if (!box) throw new Error('드로잉 캔버스 영역을 찾지 못했습니다.');

  const startX = box.x + box.width * 0.15;
  const startY = box.y + box.height * 0.15;
  const endX = box.x + box.width * 0.85;
  const endY = box.y + box.height * 0.85;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move((startX + endX) / 2, (startY + endY) / 2, {
    steps: 5,
  });
  await page.mouse.move(endX, endY, { steps: 5 });
  await page.mouse.up();
}

function readPngSize(buffer: Buffer): { width: number; height: number } {
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

type AiCoachMessagesRequestBody = {
  studentSolutionImageMediaId?: string;
};

async function startAiCoach(page: Page) {
  await page.getByTestId('ai-coach-start-button').click();
  const skipSettingsButton = page.getByTestId('ai-coach-settings-skip-button');
  try {
    await skipSettingsButton.waitFor({ state: 'visible', timeout: 3_000 });
    await skipSettingsButton.click();
  } catch {
    // 이미 저장된 맞춤 설정이 있어 다이얼로그 없이 바로 시작한 경우.
  }
  await expect(page.getByTestId('ai-coach-message-input')).toBeVisible();
}

/* ─────────────────────────────────────────────────────
 * 오픈챌린지 — 2.0 핵심 플로우 E2E
 *  - 로그인 redirect 보존(도전장 링크 → 로그인 왕복 후 복귀) 회귀 가드
 *  - 풀이 제출 → 결과 화면 → 학습 허브 렌더 스모크
 * ────────────────────────────────────────────────────*/

// ─── 로그인 redirect 보존 ───
// 도전장(/invite/challenge/:token) 같은 딥링크에서 비로그인으로 진입하면
// ?redirect=<경로> 를 달고 로그인으로 보내는데, 로그인 후 그 경로로 돌아와야 한다.
// (이전 버그: useLogin 이 redirect 를 무시하고 역할별 기본 경로로만 이동)
test.describe('로그인 redirect 보존', () => {
  test('redirect 파라미터가 있으면 로그인 후 해당 경로로 복귀한다', async ({
    page,
  }) => {
    const target = PRIVATE.POINTS.INDEX; // 학생이 접근 가능한 내부 경로
    await page.goto(`/login?redirect=${encodeURIComponent(target)}`);

    await page
      .getByTestId('login-email-input')
      .fill(process.env.E2E_STUDENT_EMAIL!);
    await page
      .getByTestId('login-password-input')
      .fill(process.env.E2E_STUDENT_PASSWORD!);
    await page.getByTestId('login-submit-button').click();

    await page.waitForURL(`**${target}`);
    await expect(page).toHaveURL(new RegExp(`${target}$`));
  });

  test('redirect 가 외부 URL이면 무시하고 역할 기본 경로로 이동한다(오픈 리다이렉트 가드)', async ({
    page,
  }) => {
    await page.goto(
      `/login?redirect=${encodeURIComponent('https://evil.example.com')}`
    );
    const appOrigin = new URL(page.url()).origin;

    await page
      .getByTestId('login-email-input')
      .fill(process.env.E2E_STUDENT_EMAIL!);
    await page
      .getByTestId('login-password-input')
      .fill(process.env.E2E_STUDENT_PASSWORD!);
    await page.getByTestId('login-submit-button').click();

    await expect(page).toHaveURL(
      (url) =>
        url.origin === appOrigin &&
        ['/learning', '/dashboard/student'].includes(url.pathname)
    );
    expect(new URL(page.url()).origin).toBe(appOrigin);
    expect(new URL(page.url()).hostname).not.toBe('evil.example.com');
  });
});

// ─── 풀이 제출 → 결과 → 학습 허브 ───
test.describe('오픈챌린지 풀이 → 결과', () => {
  test.setTimeout(60_000);

  test('문제를 선택·제출하면 결과 화면으로 이동하고 학습 허브가 렌더된다', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await page.goto(PUBLIC.CHALLENGES.DETAIL(4000));
    await expect(page.getByTestId('challenge-submit-button')).toBeVisible();

    // 첫 번째 선택지 선택 후 제출 (정답 여부와 무관하게 결과 화면 이동).
    await page.getByTestId('choice-option-0').click();
    await page.getByTestId('challenge-submit-button').click();

    await page.waitForURL(/\/open-challenge\/[^/]+\/result$/);
    await expect(page).toHaveURL(/\/result$/);

    // 보상 영역이 결과 화면에서 닫힌다(정답/오답 무관하게 노출).
    // 풀이 완료 후 "포인트·약점 나무가 자랐다 / 약점으로 표시됐다"를 보여줘야 한다.
    await expect(page.getByTestId('challenge-reward')).toBeVisible();
    await expect(page.getByRole('link', { name: /약점 나무/ })).toBeVisible();

    // 게이미피케이션 지표 페이지가 풀이 후에도 정상 렌더되는지 스모크.
    await page.goto(PRIVATE.LEARNING.INDEX);
    await expect(page).toHaveURL(/\/learning$/);
    await page.goto(PRIVATE.POINTS.INDEX);
    await expect(page).toHaveURL(/\/points$/);
  });
});

// ─── AI 코치 — 손글씨 풀이 캡처(§ai-coach-improvement-plan Phase 1b A-1/A-2) ───
test.describe('AI 코치 — 손글씨 풀이 캡처', () => {
  test.setTimeout(60_000);

  test('드로잉 후 메시지를 보내면 studentSolutionImageMediaId가 실리고, 업로드 이미지 종횡비가 캔버스 실측과 일치한다', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await page.goto(PUBLIC.CHALLENGES.DETAIL(4000));
    await expect(page.getByTestId('solution-drawing-surface')).toBeVisible();

    // presign-batch → S3 PUT 은 실제로 통과시키되(passthrough), PUT 바디(PNG)만 가로채 관찰한다.
    let uploadedPngBuffer: Buffer | null = null;
    await page.route('**/*', async (route) => {
      const request = route.request();
      const contentType = request.headers()['content-type'] ?? '';
      if (request.method() === 'PUT' && contentType.includes('image/png')) {
        uploadedPngBuffer = request.postDataBuffer();
      }
      await route.continue();
    });

    // AI 코치 메시지 전송 요청 바디를 가로채 studentSolutionImageMediaId 실림을 검증한다.
    // (mutable let 대신 컨테이너 객체를 쓴다 — 중첩 async 콜백에서 재할당되는
    //  let 변수는 이 파일 환경에서 tsc가 사용 시점 타입을 never로 오추론한다.)
    const messagesRequest: { body: AiCoachMessagesRequestBody | null } = {
      body: null,
    };
    await page.route(
      '**/api/v1/common/ai-coaching-sessions/*/messages',
      async (route) => {
        if (route.request().method() === 'POST') {
          messagesRequest.body = route.request().postDataJSON();
        }
        await route.continue();
      }
    );

    const surface = page.getByTestId('solution-drawing-surface');
    await expect(surface).toBeVisible();
    const surfaceBox = await surface.boundingBox();
    if (!surfaceBox) throw new Error('드로잉 캔버스 영역을 찾지 못했습니다.');

    await drawDiagonalStroke(page, surface);

    await startAiCoach(page);
    await page.getByTestId('ai-coach-message-input').fill('이 문제 힌트 줘');
    await page.getByTestId('ai-coach-send-button').click();

    await expect
      .poll(() => messagesRequest.body, { timeout: 15_000 })
      .not.toBeNull();
    expect(messagesRequest.body?.studentSolutionImageMediaId).toBeTruthy();

    await expect
      .poll(() => uploadedPngBuffer, { timeout: 15_000 })
      .not.toBeNull();
    const { width, height } = readPngSize(uploadedPngBuffer!);
    const exportedRatio = width / height;
    const expectedRatio = surfaceBox.width / surfaceBox.height;

    // 회귀 가드: 과거 버그(고정 1000×440 캔버스)였다면 이 비율은 실제 캔버스
    // 폭·높이와 무관하게 항상 1000/440≈2.27로 고정됐다(가로 왜곡). 종횡비 보존
    // 수정 후에는 실측 surface 비율(±15%)과 일치해야 한다.
    expect(
      Math.abs(exportedRatio - expectedRatio) / expectedRatio
    ).toBeLessThan(0.15);
  });

  test('풀이 이미지 업로드가 실패하면 조용히 넘어가지 않고 재시도/스킵을 물어본다', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await page.goto(PUBLIC.CHALLENGES.DETAIL(4000));
    await expect(page.getByTestId('solution-drawing-surface')).toBeVisible();

    // presign 단계를 강제 실패시켜 업로드 실패를 재현(S3까지 갈 필요 없음).
    await page.route('**/api/v1/common/media/presign-batch', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'mock presign failure' }),
      })
    );

    const messagesRequest: { body: AiCoachMessagesRequestBody | null } = {
      body: null,
    };
    await page.route(
      '**/api/v1/common/ai-coaching-sessions/*/messages',
      async (route) => {
        if (route.request().method() === 'POST') {
          messagesRequest.body = route.request().postDataJSON();
        }
        await route.continue();
      }
    );

    const surface = page.getByTestId('solution-drawing-surface');
    await expect(surface).toBeVisible();
    await drawDiagonalStroke(page, surface);

    await startAiCoach(page);
    await page.getByTestId('ai-coach-message-input').fill('이 문제 힌트 줘');
    await page.getByTestId('ai-coach-send-button').click();

    // 무음 삼킴 금지(A-2) — 실패 토스트가 노출된다.
    await expect(
      page.getByText('풀이 이미지 전송에 실패했어요. 다시 시도해 주세요.')
    ).toBeVisible();

    // 이미지 없이 AI를 조용히 부르지 않는다 — 명시 확인(재시도/스킵) UI가 뜬다.
    await expect(
      page.getByTestId('ai-coach-upload-retry-button')
    ).toBeVisible();
    const skipImageButton = page.getByTestId(
      'ai-coach-send-without-image-button'
    );
    await expect(skipImageButton).toBeVisible();

    // "그냥 질문만 보낼게요" 명시 동의 후에만 이미지 없이 진행된다.
    await skipImageButton.click();

    await expect
      .poll(() => messagesRequest.body, { timeout: 15_000 })
      .not.toBeNull();
    expect(messagesRequest.body?.studentSolutionImageMediaId).toBeUndefined();
  });
});
