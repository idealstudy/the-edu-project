import { repository } from '@/entities/open-challenge';
import { renderWithProviders } from '@/tests/utils';
import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { AiCoachPanel } from './ai-coach-panel';

const coachMocks = vi.hoisted(() => ({
  ensureAttempt: vi.fn(),
  createSessionAsync: vi.fn(),
  sendMessage: vi.fn(),
  abandonSessionAsync: vi.fn(),
  updatePreferenceAsync: vi.fn(),
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
      uploadDrawingAsync: vi.fn(),
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
    coachMocks.ensureAttempt.mockResolvedValue('attempt-1');
    coachMocks.createSessionAsync.mockResolvedValue({
      sessionId: 'session-1',
      status: 'WAITING_ANSWER',
    });
    coachMocks.sendMessage.mockImplementation(
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
    vi.clearAllMocks();
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

    await userEvent.type(
      screen.getByTestId('ai-coach-message-input'),
      '경우의 수를 모르겠어'
    );
    await userEvent.click(screen.getByTestId('ai-coach-send-button'));

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
    await userEvent.type(input, '경우의 수를 모르겠어');
    await userEvent.click(screen.getByTestId('ai-coach-send-button'));

    await waitFor(() => {
      expect(coachMocks.createSessionAsync).toHaveBeenCalledTimes(1);
    });
    expect(input).toHaveValue('경우의 수를 모르겠어');
    expect(coachMocks.sendMessage).not.toHaveBeenCalled();

    await userEvent.click(screen.getByTestId('ai-coach-send-button'));

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

    await userEvent.type(
      screen.getByTestId('ai-coach-message-input'),
      '그다음은 어떻게 세어?'
    );
    await userEvent.click(screen.getByTestId('ai-coach-send-button'));

    expect(
      await screen.findByText('어느 부분부터 세어 볼까?')
    ).toBeInTheDocument();
    expect(screen.getByText('16가지까지는 세었어')).toBeInTheDocument();
    expect(coachMocks.createSessionAsync).toHaveBeenCalledWith({
      challengeAttemptId: 'attempt-1',
    });
    expect(coachMocks.ensureAttempt).not.toHaveBeenCalled();
  });
});
