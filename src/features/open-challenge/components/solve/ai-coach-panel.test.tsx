import { repository } from '@/entities/open-challenge';
import { renderWithProviders } from '@/tests/utils';
import { cleanup, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { AiCoachPanel } from './ai-coach-panel';

const coachMocks = vi.hoisted(() => ({
  startAttemptAsync: vi.fn(),
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
  useStartChallengeAttemptMutation: vi.fn(() => ({
    mutateAsync: coachMocks.startAttemptAsync,
    isPending: false,
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

describe('AiCoachPanel 자동 대화 시작', () => {
  beforeEach(() => {
    coachMocks.startAttemptAsync.mockResolvedValue({
      attemptId: 'attempt-1',
      status: 'IN_PROGRESS',
    });
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

  test('진입 즉시 첫 인사와 입력창을 열고, 학생이 보낸 때만 메시지 mutation을 호출한다', async () => {
    const onMessageSent = vi.fn();

    renderWithProviders(
      <AiCoachPanel
        challengeId="42"
        attemptId={null}
        isLoggedIn
        openingMessage="어디서 막혔는지 말해 줘."
        onAttemptCreated={vi.fn()}
        onAttemptCleared={vi.fn()}
        onSessionChange={vi.fn()}
        onMessageSent={onMessageSent}
      />
    );

    expect(
      screen.queryByTestId('ai-coach-start-button')
    ).not.toBeInTheDocument();
    expect(screen.getByTestId('ai-coach-message-input')).toBeInTheDocument();
    expect(coachMocks.sendMessage).not.toHaveBeenCalled();

    await waitFor(() => {
      expect(coachMocks.createSessionAsync).toHaveBeenCalledWith({
        challengeAttemptId: 'attempt-1',
      });
    });
    expect(coachMocks.updatePreferenceAsync).not.toHaveBeenCalled();
    expect(coachMocks.sendMessage).not.toHaveBeenCalled();

    await userEvent.type(
      screen.getByTestId('ai-coach-message-input'),
      '경우의 수를 모르겠어'
    );
    await userEvent.click(screen.getByTestId('ai-coach-send-button'));

    expect(coachMocks.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        message: '경우의 수를 모르겠어',
        intent: 'chat',
      }),
      expect.objectContaining({ onSuccess: expect.any(Function) })
    );
    expect(onMessageSent).toHaveBeenCalledTimes(1);
  });

  test('기존 세션이 있는 문제로 재진입하면 지난 대화를 이어서 그린다', async () => {
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
        onAttemptCreated={vi.fn()}
        onAttemptCleared={vi.fn()}
      />
    );

    expect(
      await screen.findByText('어느 부분부터 세어 볼까?')
    ).toBeInTheDocument();
    expect(screen.getByText('16가지까지는 세었어')).toBeInTheDocument();
    expect(coachMocks.startAttemptAsync).not.toHaveBeenCalled();
  });
});
