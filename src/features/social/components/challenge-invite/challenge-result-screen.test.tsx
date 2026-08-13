import { renderWithProviders } from '@/tests/utils';
import { cleanup, screen } from '@testing-library/react';
import { AxiosError, AxiosHeaders } from 'axios';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { ChallengeResultScreen } from './challenge-result-screen';

const mockUseInviteResultQuery = vi.fn();
const mockUseCreateRematchMutation = vi.fn();
const mockUseOpenChallengeDetailQuery = vi.fn();
const mockUseRecommendedChallengesQuery = vi.fn();
const mockUsePublicInvitePreviewQuery = vi.fn();
const mockTrackVersusView = vi.fn();

vi.mock('../../hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../hooks')>();
  return {
    ...actual,
    useInviteResultQuery: () => mockUseInviteResultQuery(),
    useCreateRematchMutation: () => mockUseCreateRematchMutation(),
    usePublicInvitePreviewQuery: () => mockUsePublicInvitePreviewQuery(),
  };
});

vi.mock('@/shared/lib/analytics', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/shared/lib/analytics')>();
  return {
    ...actual,
    trackVersusView: (payload: unknown) => mockTrackVersusView(payload),
  };
});

// 결과 화면의 보조 버튼("다른 문제로"/"문제 더 풀기")이 결과의 challengeId →
// 문제 상세(subject·대표 단원) → 추천 API 순으로 실제 연결되는지 검증하려면
// 이 두 훅도 함께 목킹해야 한다(2026-08-12 정정 반영 검증).
vi.mock(
  '@/features/open-challenge/hooks/use-open-challenge',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@/features/open-challenge/hooks/use-open-challenge')
      >();
    return {
      ...actual,
      useOpenChallengeDetailQuery: () => mockUseOpenChallengeDetailQuery(),
      useRecommendedChallengesQuery: () => mockUseRecommendedChallengesQuery(),
    };
  }
);

const challengeDetailWithPrimaryUnit = {
  id: '42',
  subject: 'MATH',
  questionNumber: 28,
  wrongAnswerRate: 68,
  units: [
    {
      nodeId: 501,
      displayName: '경우의 수',
      subjectName: '확률과 통계',
      isPrimary: true,
      examScope: '수능',
    },
  ],
};

const recommendedCandidate = {
  id: '99',
  subject: 'MATH',
  difficulty: 'HIGH',
  title: '31. 서로 다른 공을 상자에 넣는 경우의 수',
  sourceText: '2024학년도 수능',
  questionImageUrl: null,
  wrongAnswerRate: 0.71,
  participantCount: 120,
  recommendReason: '둘 다 약한 경우의 수에서 골랐어요.',
};

// "이 유형 더 풀기"가 "다른 문제로"와 같은 문제로 겹치지 않는지 검증하려면
// 서로 다른 id를 가진 두 번째 후보가 필요하다.
const secondRecommendedCandidate = {
  ...recommendedCandidate,
  id: '100',
  title: '32. 중복조합으로 나누는 경우의 수',
};

const baseResult = {
  shareToken: 'tok',
  status: 'COMPLETED' as const,
  challengeId: 42,
  opponentName: '조성진',
  viewerRole: 'INVITEE' as const,
  openDuelCount: 1,
  headToHead: { win: 3, lose: 2, draw: 1 },
  myCorrect: true,
  opponentCorrect: false,
  myAttempt: {
    isCorrect: true,
    selectedAnswer: '5',
    timeSpentSeconds: 90,
    solvedAt: '2026-08-12T05:05:00',
    solutionImageUrl: null,
    solutionShared: true,
    solutionWithdrawn: false,
  },
  opponentAttempt: {
    isCorrect: false,
    selectedAnswer: '4',
    timeSpentSeconds: 52,
    solvedAt: '2026-08-11T21:40:00',
    solutionImageUrl: null,
    solutionShared: true,
    solutionWithdrawn: false,
  },
  divergence: {
    hasData: true,
    wrongType: 'CASE_MISS',
    reason: '(2,2)를 세었는지가 갈린 지점입니다.',
  },
  context: {
    inviterName: '초대한 사람',
    sentAt: '2026-08-11T18:02:00',
    opponentSolvedAt: '2026-08-11T21:40:00',
  },
};

/* ─────────────────────────────────────────────────────
 * 대결 결과 전용 화면(D-10-4). 승/패로 구성(안내 띠 유무·다음 카드 제목·
 * 주 버튼)이 달라지는 것을 못박는다. prototypes/mvp-e-v1.1.0-디자인허브-v3-opus5.html
 * resultScreen() 기반.
 * ────────────────────────────────────────────────────*/
describe('ChallengeResultScreen', () => {
  beforeEach(() => {
    mockUsePublicInvitePreviewQuery.mockReturnValue({ data: undefined });
  });

  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test('이겼을 때: 안내 띠 없고, 다음 카드 제목이 "다시 붙자고 할까요"이며, 좌우 비교가 뜬다', () => {
    mockUseInviteResultQuery.mockReturnValue({
      data: { ...baseResult, outcome: 'WIN' },
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseCreateRematchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
      error: null,
    });
    mockUseOpenChallengeDetailQuery.mockReturnValue({
      data: challengeDetailWithPrimaryUnit,
    });
    mockUseRecommendedChallengesQuery.mockReturnValue({
      data: [recommendedCandidate, secondRecommendedCandidate],
      isLoading: false,
    });

    renderWithProviders(<ChallengeResultScreen token="tok" />);

    expect(screen.getByText('이겼어요')).toBeInTheDocument();
    const resultSummary = screen.getByTestId('result-summary');
    expect(resultSummary).not.toHaveClass('border', 'rounded-section', 'p-6');
    expect(resultSummary.querySelector('svg')).toBeNull();
    expect(
      screen.getByText(
        '조성진은 4번, 나는 5번을 골랐어요. (2,2)를 세었는지가 갈린 지점입니다.'
      )
    ).toBeInTheDocument();
    expect(resultSummary).toContainElement(screen.getByText('이 문제 오답률'));
    expect(screen.getByText('확률과 통계 28번')).toBeInTheDocument();
    expect(screen.getByText('조성진과 통산 3승 2패 1무')).toBeInTheDocument();
    expect(
      screen.queryByText('먼저 볼 곳: 두 풀이가 갈린 이유')
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('조성진에게 다시 붙자고 할까요?')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '조성진과 다시 붙기' })
    ).toBeInTheDocument();
    expect(screen.getByTestId('vs-column-나')).toBeInTheDocument();
    expect(screen.getByTestId('vs-column-조성진')).toBeInTheDocument();
    expect(screen.getByTestId('vs-column-나')).toHaveClass(
      'border-key-color-primary'
    );
    expect(screen.getByTestId('vs-column-나')).not.toHaveClass('bg-orange-1');
    expect(screen.getByTestId('vs-column-조성진')).not.toHaveClass(
      'bg-system-warning-alt'
    );
    // 도전 맥락 띠(R-19)는 결과 화면에서도 사라지지 않는다
    expect(screen.getByText('조성진과의 대결')).toBeInTheDocument();
    // 이긴 화면은 시안(resultScreen(vp,'win'))대로 3버튼: 다시 붙기 / 다른
    // 문제로 / 이 유형 더 풀기. 뒤 둘은 결과의 challengeId→문제상세→추천
    // API로 실제 좁혀진, 서로 다른 문제로 연결된다.
    expect(screen.getByRole('link', { name: '다른 문제로' })).toHaveAttribute(
      'href',
      '/open-challenge/99'
    );
    expect(
      screen.getByRole('link', { name: '이 유형 더 풀기' })
    ).toHaveAttribute('href', '/open-challenge/100');
  });

  test('서버 과목 코드는 기존 한글 표시명으로 바꾸고 원문 코드는 숨긴다', () => {
    mockUseInviteResultQuery.mockReturnValue({
      data: { ...baseResult, outcome: 'WIN' },
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseCreateRematchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
      error: null,
    });
    mockUseOpenChallengeDetailQuery.mockReturnValue({
      data: {
        ...challengeDetailWithPrimaryUnit,
        questionNumber: 25,
        units: [
          {
            ...challengeDetailWithPrimaryUnit.units[0],
            subjectName: 'GEOMETRY',
          },
        ],
      },
    });
    mockUseRecommendedChallengesQuery.mockReturnValue({
      data: [recommendedCandidate],
      isLoading: false,
    });

    renderWithProviders(<ChallengeResultScreen token="tok" />);

    expect(screen.getByText('기하 25번')).toBeInTheDocument();
    expect(screen.queryByText(/GEOMETRY/)).not.toBeInTheDocument();
  });

  test('사전에 없는 서버 과목 코드는 결과 칩에 표시하지 않는다', () => {
    mockUseInviteResultQuery.mockReturnValue({
      data: { ...baseResult, outcome: 'WIN' },
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseCreateRematchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
      error: null,
    });
    mockUseOpenChallengeDetailQuery.mockReturnValue({
      data: {
        ...challengeDetailWithPrimaryUnit,
        subject: 'UNKNOWN_SUBJECT',
        questionNumber: 25,
        units: [
          {
            ...challengeDetailWithPrimaryUnit.units[0],
            subjectName: 'FUTURE_SUBJECT',
          },
        ],
      },
    });
    mockUseRecommendedChallengesQuery.mockReturnValue({
      data: [recommendedCandidate],
      isLoading: false,
    });

    renderWithProviders(<ChallengeResultScreen token="tok" />);

    expect(screen.queryByText(/FUTURE_SUBJECT/)).not.toBeInTheDocument();
    expect(screen.queryByText(/UNKNOWN_SUBJECT/)).not.toBeInTheDocument();
    expect(screen.queryByText('25번')).not.toBeInTheDocument();
  });

  test('이겼을 때 추천 조회가 실패해도(결과=undefined) 버튼이 침묵하지 않고 전체 목록으로라도 이어진다', () => {
    mockUseInviteResultQuery.mockReturnValue({
      data: { ...baseResult, outcome: 'WIN' },
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseCreateRematchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
      error: null,
    });
    mockUseOpenChallengeDetailQuery.mockReturnValue({
      data: challengeDetailWithPrimaryUnit,
    });
    // 결함1 재현: CORS 차단 등으로 추천 조회가 실패하면 react-query는
    // data:undefined, isError:true를 준다. 이때도 "다른 문제로"/"이 유형
    // 더 풀기"가 비활성으로 죽지 않고 전체 목록으로라도 이어져야 한다.
    mockUseRecommendedChallengesQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    renderWithProviders(<ChallengeResultScreen token="tok" />);

    expect(screen.getByRole('link', { name: '다른 문제로' })).toHaveAttribute(
      'href',
      '/'
    );
    expect(
      screen.getByRole('link', { name: '이 유형 더 풀기' })
    ).toHaveAttribute('href', '/');
  });

  test('졌을 때: 상단 "먼저 볼 곳" 안내 띠가 뜨고, 다음 카드 제목·주 버튼이 승리와 다르다', () => {
    mockUseInviteResultQuery.mockReturnValue({
      data: {
        ...baseResult,
        outcome: 'LOSE',
        myCorrect: false,
        opponentCorrect: true,
      },
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseCreateRematchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
      error: null,
    });
    mockUseOpenChallengeDetailQuery.mockReturnValue({
      data: challengeDetailWithPrimaryUnit,
    });
    mockUseRecommendedChallengesQuery.mockReturnValue({
      data: [recommendedCandidate],
      isLoading: false,
    });

    renderWithProviders(<ChallengeResultScreen token="tok" />);

    expect(
      screen.getByText('졌어요. 어디서 갈렸는지 보고 가요')
    ).toBeInTheDocument();
    expect(
      screen.getByText('먼저 볼 곳: 두 풀이가 갈린 이유')
    ).toBeInTheDocument();
    expect(
      screen.getByText('지금은 이 유형을 한 번 더 보는 게 낫습니다')
    ).toBeInTheDocument();
    // 시안(resultScreen(vp,'lose')) 확정 문구: 주 버튼은 "갈린 자리 다시
    // 풀기"이고, 추천 API와 무관하게 항상 방금 틀린 그 문제(challengeId=42)로
    // 보낸다. "문제 더 풀기"라는 옛 문구·무필터 추천 의존은 결함이었다.
    expect(
      screen.getByRole('link', { name: '갈린 자리 다시 풀기' })
    ).toHaveAttribute('href', '/open-challenge/42');
    expect(screen.getByTestId('vs-column-나')).not.toHaveClass(
      'bg-system-warning-alt',
      'border-system-warning'
    );
    expect(screen.getByTestId('vs-column-조성진')).toHaveClass(
      'border-key-color-primary'
    );
    expect(screen.getByTestId('vs-column-조성진')).not.toHaveClass(
      'bg-orange-1'
    );
  });

  test('서로 다른 답인데 갈린 이유가 없으면 실제 선택 답 문장만 표시한다', () => {
    mockUseInviteResultQuery.mockReturnValue({
      data: {
        ...baseResult,
        outcome: 'WIN',
        divergence: { ...baseResult.divergence, reason: null },
      },
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseCreateRematchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
      error: null,
    });
    mockUseOpenChallengeDetailQuery.mockReturnValue({ data: undefined });
    mockUseRecommendedChallengesQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    renderWithProviders(<ChallengeResultScreen token="tok" />);

    expect(
      screen.getByText('조성진은 4번, 나는 5번을 골랐어요.')
    ).toBeInTheDocument();
  });

  test.each([
    { label: '두 사람이 같은 답', myAnswer: '4', opponentAnswer: '4' },
    { label: '한 사람의 답 없음', myAnswer: '5', opponentAnswer: null },
  ])(
    '$label이면 기존 일반 설명으로 폴백한다',
    ({ myAnswer, opponentAnswer }) => {
      mockUseInviteResultQuery.mockReturnValue({
        data: {
          ...baseResult,
          outcome: 'WIN',
          myAttempt: { ...baseResult.myAttempt, selectedAnswer: myAnswer },
          opponentAttempt: {
            ...baseResult.opponentAttempt,
            selectedAnswer: opponentAnswer,
          },
        },
        error: null,
        isLoading: false,
        isError: false,
        refetch: vi.fn(),
      });
      mockUseCreateRematchMutation.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
        data: undefined,
        error: null,
      });
      mockUseOpenChallengeDetailQuery.mockReturnValue({ data: undefined });
      mockUseRecommendedChallengesQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
      });

      renderWithProviders(<ChallengeResultScreen token="tok" />);

      expect(
        screen.getByText(
          '두 사람이 고른 답과 풀이가 어디서 갈렸는지 확인해 보세요.'
        )
      ).toBeInTheDocument();
    }
  );

  test('졌을 때 추천 조회가 실패해도(CORS 차단 재현) "갈린 자리 다시 풀기"는 항상 방금 그 문제로 이어진다', () => {
    mockUseInviteResultQuery.mockReturnValue({
      data: {
        ...baseResult,
        outcome: 'LOSE',
        myCorrect: false,
        opponentCorrect: true,
      },
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseCreateRematchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
      error: null,
    });
    // 문제 상세 조회 자체가 실패한 경우(추천 파이프라인의 1단계 실패)까지
    // 재현한다. 그래도 주 버튼은 결과 응답의 challengeId만으로 동작해야
    // 한다.
    mockUseOpenChallengeDetailQuery.mockReturnValue({ data: undefined });
    mockUseRecommendedChallengesQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    renderWithProviders(<ChallengeResultScreen token="tok" />);

    expect(
      screen.getByRole('link', { name: '갈린 자리 다시 풀기' })
    ).toHaveAttribute('href', '/open-challenge/42');
  });

  test('이긴 쪽에서 같은 단원 추천이 방금 푼 문제 자신은 제외한다', () => {
    mockUseInviteResultQuery.mockReturnValue({
      data: { ...baseResult, outcome: 'WIN' },
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseCreateRematchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
      error: null,
    });
    mockUseOpenChallengeDetailQuery.mockReturnValue({
      data: challengeDetailWithPrimaryUnit,
    });
    // 추천 결과의 첫 항목이 방금 푼 문제(42) 자신이면 다음 후보(99)로
    // 건너뛰어야 한다.
    mockUseRecommendedChallengesQuery.mockReturnValue({
      data: [{ ...recommendedCandidate, id: '42' }, recommendedCandidate],
      isLoading: false,
    });

    renderWithProviders(<ChallengeResultScreen token="tok" />);

    expect(screen.getByRole('link', { name: '다른 문제로' })).toHaveAttribute(
      'href',
      '/open-challenge/99'
    );
  });

  test('졌을 때 추천 0건: 옆 단원·혼자 풀기·다른 친구 3갈래가 뜨고, 그래도 "갈린 자리 다시 풀기"는 살아 있다', () => {
    mockUseInviteResultQuery.mockReturnValue({
      data: {
        ...baseResult,
        outcome: 'LOSE',
        myCorrect: false,
        opponentCorrect: true,
      },
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseCreateRematchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
      error: null,
    });
    mockUseOpenChallengeDetailQuery.mockReturnValue({
      data: challengeDetailWithPrimaryUnit,
    });
    // 두 훅 모두 "같은 단원 후보 없음"을 나타내되, 서로 다른 recommended
    // 쿼리(unitNodeId 있음 vs subject:'ALL')이므로 하나의 mock으로 두
    // 호출을 구분한다.
    mockUseRecommendedChallengesQuery.mockImplementation(() => ({
      data: [],
      isLoading: false,
    }));

    renderWithProviders(<ChallengeResultScreen token="tok" />);

    expect(
      screen.getByText('이 단원에서 둘 다 안 푼 문제가 없어요')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '다른 단원 둘러보기' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '혼자 다시 풀기' })
    ).toHaveAttribute('href', '/open-challenge/42');
    expect(screen.getByRole('link', { name: '친구 선택하기' })).toHaveAttribute(
      'href',
      '/friends?challengeId=42&unitNodeId=501'
    );
    // 주 버튼("갈린 자리 다시 풀기")은 추천 후보와 무관하게 살아 있다.
    // 같은 단원 추천이 0건이어도 방금 틀린 그 문제로는 항상 갈 수 있다.
    expect(
      screen.getByRole('link', { name: '갈린 자리 다시 풀기' })
    ).toHaveAttribute('href', '/open-challenge/42');
    // 문항 개수는 어디에도 쓰지 않는다(시안 3-3 확정 규칙).
    expect(screen.queryByText(/\d+개/)).not.toBeInTheDocument();
    expect(screen.queryByText(/276/)).not.toBeInTheDocument();
  });

  test('이겼을 때 추천 0건: "다른 문제로"·"이 유형 더 풀기"가 비활성이다(막다른 링크로 보내지 않음)', () => {
    mockUseInviteResultQuery.mockReturnValue({
      data: { ...baseResult, outcome: 'WIN' },
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseCreateRematchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
      error: null,
    });
    mockUseOpenChallengeDetailQuery.mockReturnValue({
      data: challengeDetailWithPrimaryUnit,
    });
    mockUseRecommendedChallengesQuery.mockImplementation(() => ({
      data: [],
      isLoading: false,
    }));

    renderWithProviders(<ChallengeResultScreen token="tok" />);

    expect(screen.getByRole('button', { name: '다른 문제로' })).toBeDisabled();
    expect(
      screen.getByRole('button', { name: '이 유형 더 풀기' })
    ).toBeDisabled();
  });

  test('컨닝 가드(CUNNING_GUARD_BLOCKED)면 공개 미리보기의 challengeId로 문제 풀이 주 동작을 살린다', () => {
    mockUseInviteResultQuery.mockReturnValue({
      data: undefined,
      error: new AxiosError('fail', 'ERR', undefined, undefined, {
        data: {
          status: 403,
          message: '먼저 완료해야 볼 수 있습니다',
          code: 'CUNNING_GUARD_BLOCKED',
        },
        status: 403,
        statusText: 'Forbidden',
        headers: {},
        config: { headers: new AxiosHeaders() },
      }),
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });
    mockUseCreateRematchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
      error: null,
    });
    mockUsePublicInvitePreviewQuery.mockReturnValue({
      data: { challengeId: 42 },
    });

    renderWithProviders(<ChallengeResultScreen token="tok" />);

    expect(screen.getByText('아직 결과를 볼 수 없어요')).toBeInTheDocument();
    expect(
      screen.getByText('먼저 완료해야 볼 수 있습니다')
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '문제 풀러 가기' })
    ).toHaveAttribute('href', '/open-challenge/42');
  });

  test('컨닝 가드에서 공개 미리보기가 실패해도 도전장 랜딩을 거쳐 문제 풀이 주 동작을 유지한다', () => {
    mockUseInviteResultQuery.mockReturnValue({
      data: undefined,
      error: new AxiosError('fail', 'ERR', undefined, undefined, {
        data: {
          status: 403,
          message: '먼저 완료해야 볼 수 있습니다',
          code: 'CUNNING_GUARD_BLOCKED',
        },
        status: 403,
        statusText: 'Forbidden',
        headers: {},
        config: { headers: new AxiosHeaders() },
      }),
      isLoading: false,
      isError: true,
      refetch: vi.fn(),
    });
    mockUseCreateRematchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
      error: null,
    });
    mockUsePublicInvitePreviewQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
    });

    renderWithProviders(<ChallengeResultScreen token="tok" />);

    expect(
      screen.getByRole('link', { name: '문제 풀러 가기' })
    ).toHaveAttribute('href', '/invite/challenge/tok');
  });

  test('조회자가 초대자면 분석 이벤트 is_inviter를 true로 기록한다', () => {
    mockUseInviteResultQuery.mockReturnValue({
      data: { ...baseResult, outcome: 'WIN', viewerRole: 'INVITER' },
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseCreateRematchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
      error: null,
    });
    mockUseOpenChallengeDetailQuery.mockReturnValue({ data: undefined });
    mockUseRecommendedChallengesQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
    });

    renderWithProviders(<ChallengeResultScreen token="tok" />);

    expect(mockTrackVersusView).toHaveBeenCalledWith({
      outcome: 'WIN',
      is_inviter: true,
    });
  });

  test('신규 결과 필드가 없으면 inviterName으로 렌더하고 선택 정보만 숨긴다', () => {
    const legacyResult: Partial<typeof baseResult> = { ...baseResult };
    Reflect.deleteProperty(legacyResult, 'opponentName');
    Reflect.deleteProperty(legacyResult, 'viewerRole');
    Reflect.deleteProperty(legacyResult, 'openDuelCount');
    Reflect.deleteProperty(legacyResult, 'headToHead');
    mockUseInviteResultQuery.mockReturnValue({
      data: { ...legacyResult, outcome: 'WIN' },
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseCreateRematchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
      error: null,
    });
    mockUseOpenChallengeDetailQuery.mockReturnValue({
      data: challengeDetailWithPrimaryUnit,
    });
    mockUseRecommendedChallengesQuery.mockReturnValue({
      data: [recommendedCandidate, secondRecommendedCandidate],
      isLoading: false,
    });

    renderWithProviders(<ChallengeResultScreen token="tok" />);

    expect(
      screen.getByRole('button', { name: '초대한 사람과 다시 붙기' })
    ).toBeEnabled();
    expect(screen.queryByText(/통산/)).not.toBeInTheDocument();
    expect(screen.queryByText(/진행 중인 대결/)).not.toBeInTheDocument();
    expect(mockTrackVersusView).toHaveBeenCalledWith({ outcome: 'WIN' });
  });

  test('진행 중 대결이 3건이면 실제 건수를 표시하고 재대결 동작을 미리 막는다', () => {
    mockUseInviteResultQuery.mockReturnValue({
      data: { ...baseResult, outcome: 'WIN', openDuelCount: 3 },
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseCreateRematchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
      error: null,
    });
    mockUseOpenChallengeDetailQuery.mockReturnValue({
      data: challengeDetailWithPrimaryUnit,
    });
    mockUseRecommendedChallengesQuery.mockReturnValue({
      data: [recommendedCandidate, secondRecommendedCandidate],
      isLoading: false,
    });

    renderWithProviders(<ChallengeResultScreen token="tok" />);

    expect(screen.getByText('3건')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: '조성진과 다시 붙기' })
    ).toBeDisabled();
  });

  test('진행 중 대결이 3건 미만이면 재대결 클릭이 실제 mutation에 shareToken을 전달한다', async () => {
    const mutate = vi.fn();
    mockUseInviteResultQuery.mockReturnValue({
      data: { ...baseResult, outcome: 'WIN', openDuelCount: 2 },
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseCreateRematchMutation.mockReturnValue({
      mutate,
      isPending: false,
      data: undefined,
      error: null,
    });
    mockUseOpenChallengeDetailQuery.mockReturnValue({
      data: challengeDetailWithPrimaryUnit,
    });
    mockUseRecommendedChallengesQuery.mockReturnValue({
      data: [recommendedCandidate, secondRecommendedCandidate],
      isLoading: false,
    });
    const { default: userEvent } = await import('@testing-library/user-event');

    renderWithProviders(<ChallengeResultScreen token="tok" />);
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: '조성진과 다시 붙기' }));

    expect(mutate).toHaveBeenCalledWith('tok');
  });

  test('손풀이 이미지가 있으면 카드 안에 렌더된다', () => {
    mockUseInviteResultQuery.mockReturnValue({
      data: {
        ...baseResult,
        outcome: 'WIN',
        myAttempt: {
          ...baseResult.myAttempt,
          solutionImageUrl: 'https://s3.example.com/my-solution.png',
        },
        opponentAttempt: {
          ...baseResult.opponentAttempt,
          solutionImageUrl: 'https://s3.example.com/opp-solution.png',
        },
      },
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseCreateRematchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
      error: null,
    });
    mockUseOpenChallengeDetailQuery.mockReturnValue({
      data: challengeDetailWithPrimaryUnit,
    });
    mockUseRecommendedChallengesQuery.mockReturnValue({
      data: [recommendedCandidate, secondRecommendedCandidate],
      isLoading: false,
    });

    renderWithProviders(<ChallengeResultScreen token="tok" />);

    expect(screen.getByAltText('나 풀이 이미지')).toHaveAttribute(
      'src',
      'https://s3.example.com/my-solution.png'
    );
    expect(screen.getByAltText('조성진 풀이 이미지')).toHaveAttribute(
      'src',
      'https://s3.example.com/opp-solution.png'
    );
  });

  test('풀이를 아예 올리지 않았으면(solutionShared=false) 왜 없는지 한 줄로 안내한다', () => {
    mockUseInviteResultQuery.mockReturnValue({
      data: {
        ...baseResult,
        outcome: 'WIN',
        opponentAttempt: {
          ...baseResult.opponentAttempt,
          solutionImageUrl: null,
          solutionShared: false,
          solutionWithdrawn: false,
        },
      },
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseCreateRematchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
      error: null,
    });
    mockUseOpenChallengeDetailQuery.mockReturnValue({
      data: challengeDetailWithPrimaryUnit,
    });
    mockUseRecommendedChallengesQuery.mockReturnValue({
      data: [recommendedCandidate, secondRecommendedCandidate],
      isLoading: false,
    });

    renderWithProviders(<ChallengeResultScreen token="tok" />);

    expect(
      screen.getByText('상대가 풀이를 올리지 않았어요')
    ).toBeInTheDocument();
  });

  test('풀이를 내렸으면(solutionWithdrawn=true) 안내 문구가 뜨고 이미지는 없다', () => {
    mockUseInviteResultQuery.mockReturnValue({
      data: {
        ...baseResult,
        outcome: 'LOSE',
        myAttempt: {
          ...baseResult.myAttempt,
          solutionImageUrl: 'https://s3.example.com/withdrawn.png',
          solutionShared: true,
          solutionWithdrawn: true,
        },
      },
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseCreateRematchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
      error: null,
    });
    mockUseOpenChallengeDetailQuery.mockReturnValue({
      data: challengeDetailWithPrimaryUnit,
    });
    mockUseRecommendedChallengesQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderWithProviders(<ChallengeResultScreen token="tok" />);

    expect(screen.getByText('내가 풀이를 내렸어요')).toBeInTheDocument();
    expect(screen.queryByAltText('나 풀이 이미지')).not.toBeInTheDocument();
  });

  test('졌을 때(LOSE) 갈린 지점 설명이 선택 답과 함께 제목 아래에 뜬다', () => {
    mockUseInviteResultQuery.mockReturnValue({
      data: { ...baseResult, outcome: 'LOSE' },
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseCreateRematchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
      error: null,
    });
    mockUseOpenChallengeDetailQuery.mockReturnValue({
      data: challengeDetailWithPrimaryUnit,
    });
    mockUseRecommendedChallengesQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderWithProviders(<ChallengeResultScreen token="tok" />);

    expect(
      screen.getByText('먼저 볼 곳: 두 풀이가 갈린 이유')
    ).toBeInTheDocument();
    expect(
      screen.getByText(/줄 주석 데이터는 아직 없어요/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        '조성진은 4번, 나는 5번을 골랐어요. (2,2)를 세었는지가 갈린 지점입니다.'
      )
    ).toBeInTheDocument();
  });

  test('맥락 띠는 도전 발송 시각과 상대 제출 시각을 구분하고 완료일 때만 둘 다 냈다고 말한다', () => {
    mockUseInviteResultQuery.mockReturnValue({
      data: { ...baseResult, outcome: 'WIN' },
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseCreateRematchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
      error: null,
    });
    mockUseOpenChallengeDetailQuery.mockReturnValue({
      data: challengeDetailWithPrimaryUnit,
    });
    mockUseRecommendedChallengesQuery.mockReturnValue({
      data: [recommendedCandidate],
      isLoading: false,
    });

    renderWithProviders(<ChallengeResultScreen token="tok" />);

    expect(screen.getByText('둘 다 냈어요')).toBeInTheDocument();
    expect(screen.getByText(/상대가 .*에 제출/)).toBeInTheDocument();
    expect(screen.queryByText(/18:02.*에 제출/)).not.toBeInTheDocument();
  });

  test('문제 오답률 칩이 실제 API 값으로 뜬다', () => {
    mockUseInviteResultQuery.mockReturnValue({
      data: { ...baseResult, outcome: 'WIN' },
      error: null,
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });
    mockUseCreateRematchMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
      data: undefined,
      error: null,
    });
    mockUseOpenChallengeDetailQuery.mockReturnValue({
      data: challengeDetailWithPrimaryUnit,
    });
    mockUseRecommendedChallengesQuery.mockReturnValue({
      data: [],
      isLoading: false,
    });

    renderWithProviders(<ChallengeResultScreen token="tok" />);

    expect(screen.getByText('이 문제 오답률')).toBeInTheDocument();
    expect(screen.getByText('68%')).toBeInTheDocument();
  });
});
