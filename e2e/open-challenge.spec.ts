import { PRIVATE, PUBLIC } from '@/shared/constants';
import { type Locator, type Page, expect, test } from '@playwright/test';

import { loginAsStudent } from './helpers/auth';
import { BACKEND_ORIGIN } from './helpers/mvp-e-devremote';

/* ─────────────────────────────────────────────────────
 * AI 코치 손글씨 캡처 헬퍼
 *  - drawDiagonalStroke: 드로잉 캔버스에 실제 마우스 포인터 이벤트로 획을 그린다.
 *  - readPngSize: PNG IHDR 청크에서 폭/높이를 직접 파싱한다(외부 의존 없음).
 *    시그니처 8B + length 4B + "IHDR" 4B 다음에 width(4B BE)·height(4B BE).
 *  - startAiCoach: "AI 힌트 받기" 클릭 후, 맞춤 설정 다이얼로그가 뜨면
 *    "나중에 할게요"로 건너뛴다(이미 설정을 저장해둔 계정이면 안 뜬다).
 * ────────────────────────────────────────────────────*/
async function drawDiagonalStroke(page: Page, canvas: Locator) {
  // 풀이 공간은 문제 카드·선택지 아래라 기본 뷰포트에서 화면 밖에 있을 수 있다.
  // toBeVisible 은 뷰포트 안인지 검사하지 않으므로, 스크롤 없이 절대좌표로 마우스를
  // 쏘면 획이 캔버스에 닿지 않고 조용히 무시된다. 반드시 먼저 뷰포트로 끌어온다.
  const drawingCanvas = canvas.locator('canvas');
  await expect(drawingCanvas).toBeVisible();
  await drawingCanvas.scrollIntoViewIfNeeded();
  const box = await drawingCanvas.boundingBox();
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

  // 획이 실제로 기록됐는지 여기서 확인한다. 이 단언이 없으면 획이 안 들어간 채로
  // 뒤 단계가 진행돼, 원인이 "이미지가 안 실렸다"로 잘못 보고된다.
  await expect(
    canvas.getByText('펜슬로 풀이를 적어보세요')
  ).toBeHidden();
}

function readPngSize(buffer: Buffer): { width: number; height: number } {
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
}

/**
 * 이 파일의 AI 코치 검사는 attempt 를 IN_PROGRESS → AI_COACHING 으로 전이시키고
 * 끝낸다(정상 종료·제출 없음). 실서버가 회원+챌린지당 "진행 중" attempt 를
 * 하나만 인정하고 이어 주기 때문에(ChallengeAttemptService.create), 세션을
 * 정리하지 않으면 다음 실행(또는 dev 를 공유하는 다른 QA 실행)이 같은
 * attempt 를 재사용하다 CHALLENGE_ATTEMPT_NOT_IN_PROGRESS(409) 로 막힌다.
 * (실측: 2026-08-09 dev 에서 challengeId=4000 계정에 stale AI_COACHING
 * attempt 8개가 누적돼 이 파일의 두 검사가 전부 실패했다.) 매 검사 뒤
 * 남은 활성 attempt 를 명시적으로 중단시켜 다음 실행이 깨끗하게 시작하게 한다.
 */
async function abandonActiveAttempt(page: Page, challengeId: number) {
  const res = await page.request.get(
    `/api/v1/common/challenges/${challengeId}/my-active-attempt`
  );
  if (res.status() !== 200) return;
  const body = await res.json().catch(() => null);
  const attemptId = body?.data?.attemptId;
  if (!attemptId) return;
  await page
    .request.patch(`/api/v1/common/challenge-attempts/${attemptId}/abandon`)
    .catch(() => {
      // 정리 실패가 검사 결과를 가리지 않게 한다 — 다음 실행에서 다시 시도된다.
    });
}

type AiCoachMessagesRequestBody = {
  studentSolutionImageMediaId?: string;
};

/**
 * AI 코치 검사 전용 문제 번호.
 *
 * 같은 파일의 제출 검사가 4000번을 완료 상태로 만들어, 뒤따르는 코치 검사가
 * 항상 실패했다(2026-08-09 실측). 번호를 갈라 그 간섭을 없앤다.
 */
const COACH_CHALLENGE_ID = 4001;

/**
 * 코치를 시작할 수 있는 새 시도를 만들어 둔다.
 *
 * 서버는 코치 세션을 **진행 중인 시도에서만** 연다. 한 번 코치를 켜면 그 시도는
 * 코칭 상태로 넘어가고, 그 뒤로는 같은 시도에서 다시 못 연다
 * (409 CHALLENGE_ATTEMPT_NOT_IN_PROGRESS). 즉 문제 번호를 바꾸는 것만으로는
 * 한 번 돌고 나면 또 막힌다. 매 실행마다 새 시도를 만들어야 반복 실행이 성립한다.
 */
async function ensureFreshAttempt(page: Page, challengeId: number) {
  type AttemptCreated = { attemptId: number; status: string };
  const createAttempt = async (): Promise<AttemptCreated> => {
    const response = await page.request.post(
      `${BACKEND_ORIGIN}/common/challenge-attempts`,
      { data: { challengeId } }
    );
    expect(
      response.status(),
      `코치 검사용 시도 생성 실패: HTTP ${response.status()}`
    ).toBeLessThan(300);
    const body = (await response.json()) as { data?: AttemptCreated };
    return body.data as AttemptCreated;
  };

  let attempt = await createAttempt();
  if (attempt.status === 'IN_PROGRESS') return;

  // 코칭 중으로 남은 시도가 있으면 제출해 닫는다. 안 닫으면 "이어 풀기" 규칙이 그
  // 시도를 계속 돌려주고, 코치 세션은 진행 중 시도만 받으므로 영원히 못 연다.
  const submitted = await page.request.post(
    `${BACKEND_ORIGIN}/common/challenge-attempts/${attempt.attemptId}/submit`,
    { data: { selectedAnswer: '1' } }
  );
  expect(
    submitted.status(),
    `코칭 중 시도 정리 실패: HTTP ${submitted.status()}`
  ).toBeLessThan(300);

  attempt = await createAttempt();
  expect(
    attempt.status,
    '정리 후에도 새 시도가 진행 중 상태가 아니다'
  ).toBe('IN_PROGRESS');
}

async function startAiCoach(page: Page) {
  await page.getByTestId('ai-coach-start-button').click();

  // 맞춤 설정 창이 뜨면 건너뛴다. 이미 설정을 저장해둔 계정이면 창 없이 바로 시작한다.
  // 대기 시간을 3초로 두면 전체 스위트를 이어 돌릴 때 창이 뜨기 전에 포기하고,
  // 그 뒤 입력창을 못 찾아 "코치가 안 열린다"로 잘못 보고된다(2026-08-09 실측).
  // 창이 떴는지 여부 자체를 넉넉히 기다린 뒤에 판단한다.
  const skipSettingsButton = page.getByTestId('ai-coach-settings-skip-button');
  const messageInput = page.getByTestId('ai-coach-message-input');
  await Promise.race([
    skipSettingsButton.waitFor({ state: 'visible', timeout: 20_000 }),
    messageInput.waitFor({ state: 'visible', timeout: 20_000 }),
  ]).catch(() => undefined);
  if (await skipSettingsButton.isVisible().catch(() => false)) {
    await skipSettingsButton.click();
  }

  await expect(messageInput).toBeVisible({ timeout: 20_000 });
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
    // 사이드바에도 같은 이름의 약점 나무 링크가 있으므로 보상 영역 안으로 범위를 좁힌다.
    // 문구를 정확히 지정하지 않는 이유: 정답이면 "내 약점 나무 보기", 오답이면
    // "약점 나무에서 채우기"로 갈리는데 이 검사는 정답 여부를 고정하지 않는다.
    await expect(
      page.getByTestId('challenge-reward').getByRole('link', { name: /약점 나무/ })
    ).toBeVisible();

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

  test.afterEach(async ({ page }) => {
    await abandonActiveAttempt(page, 4000);
  });

  test('드로잉 후 메시지를 보내면 studentSolutionImageMediaId가 실리고, 업로드 이미지 종횡비가 캔버스 실측과 일치한다', async ({
    page,
  }) => {
    await loginAsStudent(page);
    await ensureFreshAttempt(page, COACH_CHALLENGE_ID);
    await page.goto(PUBLIC.CHALLENGES.DETAIL(COACH_CHALLENGE_ID));
    await expect(page.getByTestId('solution-drawing-surface')).toBeVisible();

    // presign-batch → S3 PUT 은 실제로 통과시키되(passthrough), PUT 바디(PNG)만 가로채 관찰한다.
    let uploadedPngBuffer: Buffer | null = null;
    await page.route('**/*', async (route) => {
      const request = route.request();
      const contentType = request.headers()['content-type'] ?? '';
      if (request.method() === 'PUT' && contentType.includes('image/png')) {
        uploadedPngBuffer = request.postDataBuffer();
        if (process.env.E2E_LOCAL_UPLOAD_STUB === '1') {
          await route.fulfill({ status: 200, body: '' });
          return;
        }
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

    await drawDiagonalStroke(page, surface);

    // 캔버스 폭은 세션이 확인된 뒤 사이드바가 붙으면서 300ms 에 걸쳐 줄어든다.
    // 내보낸 이미지는 획을 그은 그 순간의 폭으로 만들어지므로, 비교 기준도
    // 그리기 이전이 아니라 그리기 직후의 값이어야 한다. 그리기 전 값과 비교하면
    // 화면이 아직 넓던 시점의 숫자와 견주게 돼 제품이 멀쩡해도 어긋난다.
    // 테두리 2px 이 낀 boundingBox 대신 안쪽 크기를 쓴다.
    const surfaceBox = await surface.evaluate((element) => ({
      width: element.clientWidth,
      height: element.clientHeight,
    }));

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
    await ensureFreshAttempt(page, COACH_CHALLENGE_ID);
    await page.goto(PUBLIC.CHALLENGES.DETAIL(COACH_CHALLENGE_ID));
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
