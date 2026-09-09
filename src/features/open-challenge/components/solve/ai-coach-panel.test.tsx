import { repository } from '@/entities/open-challenge';
import { renderWithProviders } from '@/tests/utils';
import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { AiCoachPanel } from './ai-coach-panel';

const coachMocks = vi.hoisted(() => ({
  ensureAttempt: vi.fn(),
  createSessionAsync: vi.fn(),
  sendMessage: vi.fn(),
  abandonSessionAsync: vi.fn(),
  updatePreferenceAsync: vi.fn(),
  uploadDrawing: vi.fn(),
}));

vi.mock('../../hooks/use-open-challenge', () => ({
  useAiCoachingPreferenceEnumsQuery: vi.fn(() => ({ data: undefined })),
  useMyAiCoachingPreferenceQuery: vi.fn(() => ({
    data: null,
    isFetched: true,
    isError: false,
  })),
  useUpdateMyAiCoachingPreferenceMutation: vi.fn(() => ({
    mutateAsync: coachMocks.updatePreferenceAsync,
    isPending: false,
  })),
  useCreateAiCoachingSessionMutation: vi.fn(() => ({
    mutateAsync: coachMocks.createSessionAsync,
    isPending: false,
  })),
  useSendAiCoachingMessageMutation: vi.fn(() => ({
    mutate: coachMocks.sendMessage,
    isPending: false,
  })),
  useAbandonAiCoachingSessionMutation: vi.fn(() => ({
    mutateAsync: coachMocks.abandonSessionAsync,
    isPending: false,
  })),
  useChallengeSolutionMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useGuestCoachMessageMutation: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

vi.mock('@/features/point/hooks/use-point', () => ({
  useSolutionViewCostQuery: vi.fn(() => ({
    data: { free: true, cost: 0 },
  })),
}));

vi.mock('@/shared/components/drawing', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/shared/components/drawing')>();
  return {
    ...actual,
    useDrawingUpload: vi.fn(() => ({
      uploadDrawingAsync: coachMocks.uploadDrawing,
      isUploading: false,
    })),
  };
});

vi.mock('@/shared/lib/analytics', () => ({
  trackOcCoachUse: vi.fn(),
  trackOcSolutionView: vi.fn(),
}));

describe('AiCoachPanel 지연 대화 시작', () => {
  beforeEach(() => {
    // Each render captures a fresh mutation function. If a timed-out test still
    // has pending async work, its calls cannot leak into the next test's counts.
    coachMocks.ensureAttempt = vi.fn().mockResolvedValue('attempt-1');
    coachMocks.createSessionAsync = vi.fn().mockResolvedValue({
      sessionId: 'session-1',
      status: 'WAITING_ANSWER',
    });
    coachMocks.abandonSessionAsync = vi.fn();
    coachMocks.updatePreferenceAsync = vi.fn();
    coachMocks.uploadDrawing = vi
      .fn()
      .mockResolvedValue({ mediaId: 'solution-media-1' });
    coachMocks.sendMessage = vi.fn().mockImplementation(
      (
        _payload: unknown,
        options?: {
          onSuccess?: (response: {
            reply: string;
            progressionStep: number;
            status: 'WAITING_ANSWER';
          }) => void;
        }
      ) => {
        options?.onSuccess?.({
          reply: '개념부터 짚어볼게요.',
          progressionStep: 1,
          status: 'WAITING_ANSWER',
        });
      }
    );
    vi.spyOn(repository, 'getAiCoachingMessages').mockResolvedValue([]);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  // Regression: REL-E-CORE-PATH-01. 화면 진입 시 자동 세션 생성이 답 제출과
  // 경합해 완료된 attempt에 세션을 만들며 오류 토스트를 노출했다.
  test('첫 사용자 메시지 전에는 attempt와 세션을 만들지 않는다', async () => {
    const onMessageSent = vi.fn();

    renderWithProviders(
      <AiCoachPanel
        challengeId="42"
        attemptId={null}
        isLoggedIn
        openingMessage="어디서 막혔는지 말해 줘."
        ensureAttempt={coachMocks.ensureAttempt}
        onAttemptCleared={vi.fn()}
        onSessionChange={vi.fn()}
        onMessageSent={onMessageSent}
      />
    );

    expect(
      screen.queryByTestId('ai-coach-start-button')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('ai-coach-message-input')).toBeInTheDocument();
    expect(
      await screen.findByText('어디서 막혔는지 말해 줘.')
    ).toBeInTheDocument();
    expect(coachMocks.ensureAttempt).not.toHaveBeenCalled();
    expect(coachMocks.createSessionAsync).not.toHaveBeenCalled();
    expect(coachMocks.sendMessage).not.toHaveBeenCalled();
    expect(coachMocks.updatePreferenceAsync).not.toHaveBeenCalled();

    fireEvent.change(screen.getByTestId('ai-coach-message-input'), {
      target: { value: '경우의 수를 모르겠어' },
    });
    fireEvent.click(screen.getByTestId('ai-coach-send-button'));

    await waitFor(() => {
      expect(coachMocks.ensureAttempt).toHaveBeenCalledTimes(1);
      expect(coachMocks.createSessionAsync).toHaveBeenCalledWith({
        challengeAttemptId: 'attempt-1',
      });
      expect(coachMocks.sendMessage).toHaveBeenCalledWith(
        {
          sessionId: 'session-1',
          params: expect.objectContaining({
            message: '경우의 수를 모르겠어',
            intent: 'chat',
          }),
        },
        expect.objectContaining({ onSuccess: expect.any(Function) })
      );
    });
    expect(onMessageSent).toHaveBeenCalledTimes(1);
  });

  test('첫 session 생성 실패 시 입력을 보존하고 같은 문장으로 재시도한다', async () => {
    coachMocks.createSessionAsync.mockRejectedValueOnce(
      new Error('temporary session create failure')
    );
    renderWithProviders(
      <AiCoachPanel
        challengeId="42"
        attemptId={null}
        isLoggedIn
        ensureAttempt={coachMocks.ensureAttempt}
        onAttemptCleared={vi.fn()}
      />
    );
    const input = screen.getByTestId('ai-coach-message-input');
    fireEvent.change(input, {
      target: { value: '경우의 수를 모르겠어' },
    });
    fireEvent.click(screen.getByTestId('ai-coach-send-button'));

    await waitFor(() => {
      expect(coachMocks.createSessionAsync).toHaveBeenCalledTimes(1);
    });
    expect(input).toHaveValue('경우의 수를 모르겠어');
    expect(coachMocks.sendMessage).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('ai-coach-send-button'));

    await waitFor(() => {
      expect(coachMocks.createSessionAsync).toHaveBeenCalledTimes(2);
      expect(coachMocks.sendMessage).toHaveBeenCalledWith(
        {
          sessionId: 'session-1',
          params: expect.objectContaining({
            message: '경우의 수를 모르겠어',
          }),
        },
        expect.objectContaining({ onSuccess: expect.any(Function) })
      );
      expect(input).toHaveValue('');
    });
  });

  test('기존 attempt는 첫 메시지에 세션을 이어 열고 지난 대화를 복원한다', async () => {
    vi.mocked(repository.getAiCoachingMessages).mockResolvedValue([
      {
        role: 'ASSISTANT',
        content: '어느 부분부터 세어 볼까?',
        progressionStep: 1,
      },
      {
        role: 'STUDENT',
        content: '16가지까지는 세었어',
      },
    ]);

    renderWithProviders(
      <AiCoachPanel
        challengeId="42"
        attemptId="attempt-1"
        isLoggedIn
        ensureAttempt={coachMocks.ensureAttempt}
        onAttemptCleared={vi.fn()}
      />
    );

    expect(coachMocks.createSessionAsync).not.toHaveBeenCalled();

    fireEvent.change(screen.getByTestId('ai-coach-message-input'), {
      target: { value: '그다음은 어떻게 세어?' },
    });
    fireEvent.click(screen.getByTestId('ai-coach-send-button'));

    expect(
      await screen.findByText('어느 부분부터 세어 볼까?')
    ).toBeInTheDocument();
    expect(screen.getByText('16가지까지는 세었어')).toBeInTheDocument();
    expect(coachMocks.createSessionAsync).toHaveBeenCalledWith({
      challengeAttemptId: 'attempt-1',
    });
    expect(coachMocks.ensureAttempt).not.toHaveBeenCalled();
  });

  test('[PW-201-C01 정상] 손글씨가 있으면 업로드 mediaId를 AI 메시지에 싣고 응답을 그린다', async () => {
    renderWithProviders(
      <AiCoachPanel
        challengeId="42"
        attemptId={null}
        isLoggedIn
        ensureAttempt={coachMocks.ensureAttempt}
        onAttemptCleared={vi.fn()}
        drawingStrokes={[
          {
            id: 'stroke-1',
            pageNumber: 0,
            points: [
              { x: 0.1, y: 0.1, pressure: 0.5 },
              { x: 0.8, y: 0.8, pressure: 0.5 },
            ],
            color: '#1a1a1a',
            size: 5,
            tool: 'pen',
            layoutWidth: 640,
            layoutHeight: 440,
          },
        ]}
      />
    );

    fireEvent.change(screen.getByTestId('ai-coach-message-input'), {
      target: { value: '이 문제 힌트 줘' },
    });
    fireEvent.click(screen.getByTestId('ai-coach-send-button'));

    await waitFor(() => {
      expect(coachMocks.uploadDrawing).toHaveBeenCalledTimes(1);
      expect(coachMocks.sendMessage).toHaveBeenCalledWith(
        {
          sessionId: 'session-1',
          params: expect.objectContaining({
            message: '이 문제 힌트 줘',
            studentSolutionImageMediaId: 'solution-media-1',
          }),
        },
        expect.objectContaining({ onSuccess: expect.any(Function) })
      );
    });
    expect(await screen.findByText('개념부터 짚어볼게요.')).toBeVisible();
  });

  test('[PW-201-C01 거절] 손글씨 업로드 실패 시 AI 전송을 막고 명시적 스킵 뒤에만 보낸다', async () => {
    coachMocks.uploadDrawing.mockRejectedValueOnce(new Error('upload failed'));
    renderWithProviders(
      <AiCoachPanel
        challengeId="42"
        attemptId={null}
        isLoggedIn
        ensureAttempt={coachMocks.ensureAttempt}
        onAttemptCleared={vi.fn()}
        drawingStrokes={[
          {
            id: 'stroke-1',
            pageNumber: 0,
            points: [
              { x: 0.1, y: 0.1, pressure: 0.5 },
              { x: 0.8, y: 0.8, pressure: 0.5 },
            ],
            color: '#1a1a1a',
            size: 5,
            tool: 'pen',
            layoutWidth: 640,
            layoutHeight: 440,
          },
        ]}
      />
    );

    fireEvent.change(screen.getByTestId('ai-coach-message-input'), {
      target: { value: '이 문제 힌트 줘' },
    });
    fireEvent.click(screen.getByTestId('ai-coach-send-button'));

    expect(
      await screen.findByTestId('ai-coach-send-without-image-button')
    ).toBeVisible();
    expect(coachMocks.sendMessage).not.toHaveBeenCalled();

    fireEvent.click(screen.getByTestId('ai-coach-send-without-image-button'));
    await waitFor(() =>
      expect(coachMocks.sendMessage).toHaveBeenCalledTimes(1)
    );
    expect(
      coachMocks.sendMessage.mock.calls[0]?.[0].params
        .studentSolutionImageMediaId
    ).toBeUndefined();
  });
});
