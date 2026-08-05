import { renderWithProviders } from '@/tests/utils';
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { inviteStatusLabel } from '../../lib/labels';
import { MyChallengeInvites } from './my-challenge-invites';

const mockUseMyChallengeInvitesQuery = vi.fn();

// ChallengeShareButton 은 이 테스트 대상(상태별 CTA 노출)과 무관 — 공유 다이얼로그
// 내부 구현(복사·네이티브 공유)은 별도 테스트 소관이라 여기서는 라벨만 확인
// 가능한 스텁으로 대체한다.
vi.mock('./challenge-share-button', () => ({
  ChallengeShareButton: ({ label }: { label: string }) => (
    <button>{label}</button>
  ),
}));

// 결과 비교 다이얼로그 자체 렌더는 challenge-result-dialog 자체 테스트 소관 —
// 여기서는 "결과 보기" 클릭 시 열리는지만 확인 가능하게 마운트 여부만 스텁.
vi.mock('./challenge-result-dialog', () => ({
  ChallengeResultDialog: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="result-dialog" /> : null,
}));

vi.mock('../../hooks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../hooks')>();
  return {
    ...actual,
    useMyChallengeInvitesQuery: () => mockUseMyChallengeInvitesQuery(),
  };
});

/* ─────────────────────────────────────────────────────
 * 내 도전 기록. invite 상태별 주 동작 1개 배선 검증.
 *
 * 2026-08 배치(회장 실측 결함 3건 수정):
 *  1) ACCEPTED/COMPLETED 라도 조회자(viewerCompleted=false)가 문제를 아직
 *     안 풀었으면 "결과 보기" 대신 "먼저 풀기"를 노출해야 한다(안 그러면
 *     서버가 컨닝 가드로 정당하게 막아 엉뚱한 에러처럼 보인다).
 *  2) OPEN 행은 "링크 다시 보내기" 버튼 1개만 뜬다.
 *     (공유 다이얼로그 내부에 복사 기능이 있음).
 *  3) 모든 행이 [상태 배지][주 동작 버튼 1개] 구조로 통일된다.
 * ────────────────────────────────────────────────────*/
describe('MyChallengeInvites', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  test('OPEN 상태는 "링크 다시 보내기" 버튼 1개만 뜬다', () => {
    mockUseMyChallengeInvitesQuery.mockReturnValue({
      data: [
        {
          id: 1,
          challengeId: 10,
          status: 'OPEN',
          shareToken: 'tok-open',
          regDate: '2026-08-01T00:00:00',
          challengeTitle: '이차방정식 활용',
          subject: 'MATH',
          unitName: '이차방정식',
          viewerCompleted: false,
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<MyChallengeInvites />);

    expect(screen.getByText('링크 다시 보내기')).toBeInTheDocument();
    expect(screen.queryByLabelText('도전장 링크 복사')).not.toBeInTheDocument();
    expect(screen.queryByText('결과 보기')).not.toBeInTheDocument();
    expect(screen.queryByText('먼저 풀기')).not.toBeInTheDocument();
    // 내부 번호 대신 실제 문제 제목이 보인다
    expect(screen.getByText('이차방정식 활용')).toBeInTheDocument();
  });

  test('ACCEPTED 상태인데 내가 아직 안 풀었으면 "먼저 풀기"가 뜬다(결과 보기 아님)', () => {
    mockUseMyChallengeInvitesQuery.mockReturnValue({
      data: [
        {
          id: 2,
          challengeId: 11,
          status: 'ACCEPTED',
          shareToken: 'tok-accepted',
          regDate: '2026-08-01T00:00:00',
          challengeTitle: null,
          subject: null,
          unitName: null,
          viewerCompleted: false,
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<MyChallengeInvites />);

    expect(screen.getByText('먼저 풀기')).toBeInTheDocument();
    expect(screen.queryByText('결과 보기')).not.toBeInTheDocument();
    expect(screen.queryByText('공유하기')).not.toBeInTheDocument();
  });

  test('ACCEPTED 상태이고 내가 이미 풀었으면 "결과 보기"가 뜬다', () => {
    mockUseMyChallengeInvitesQuery.mockReturnValue({
      data: [
        {
          id: 3,
          challengeId: 12,
          status: 'ACCEPTED',
          shareToken: 'tok-accepted-2',
          regDate: '2026-08-01T00:00:00',
          challengeTitle: '함수의 그래프',
          subject: 'MATH',
          unitName: null,
          viewerCompleted: true,
          opponentSolvedAt: '2026-08-01T01:00:00',
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<MyChallengeInvites />);

    expect(screen.getByText('결과 보기')).toBeInTheDocument();
    expect(screen.queryByText('먼저 풀기')).not.toBeInTheDocument();
  });

  test('COMPLETED 상태이고 내가 이미 풀었으면 "결과 보기"가 뜬다', () => {
    mockUseMyChallengeInvitesQuery.mockReturnValue({
      data: [
        {
          id: 4,
          challengeId: 13,
          status: 'COMPLETED',
          shareToken: 'tok-completed',
          regDate: '2026-08-01T00:00:00',
          challengeTitle: '삼각함수',
          subject: 'MATH',
          unitName: null,
          viewerCompleted: true,
          opponentSolvedAt: '2026-08-01T01:00:00',
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<MyChallengeInvites />);

    expect(screen.getByText('결과 보기')).toBeInTheDocument();
  });

  test('같은 문제(challengeId)의 도전장 2건은 한 행으로 묶인다', () => {
    mockUseMyChallengeInvitesQuery.mockReturnValue({
      data: [
        {
          id: 10,
          challengeId: 20,
          status: 'OPEN',
          shareToken: 'tok-a',
          regDate: '2026-08-01T00:00:00',
          challengeTitle: '이차방정식 활용',
          subject: 'MATH',
          unitName: '이차방정식',
          inviteeId: null,
          viewerCompleted: false,
        },
        {
          id: 11,
          challengeId: 20,
          status: 'ACCEPTED',
          shareToken: 'tok-b',
          regDate: '2026-08-02T00:00:00',
          challengeTitle: '이차방정식 활용',
          subject: 'MATH',
          unitName: '이차방정식',
          inviteeId: 99,
          viewerCompleted: true,
          opponentSolvedAt: '2026-08-02T01:00:00',
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<MyChallengeInvites />);

    // 제목은 한 번만 뜬다(묶였다는 뜻)
    expect(screen.getAllByText('이차방정식 활용')).toHaveLength(1);
    expect(screen.getByText('대결 2건', { exact: false })).toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: /보기/ });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  test('묶인 행을 펼치면 대결 2건이 각각 상대별로 보인다', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');

    mockUseMyChallengeInvitesQuery.mockReturnValue({
      data: [
        {
          id: 20,
          challengeId: 30,
          status: 'OPEN',
          shareToken: 'tok-c',
          regDate: '2026-08-01T00:00:00',
          challengeTitle: '함수의 그래프',
          subject: 'MATH',
          unitName: null,
          inviteeId: null,
          viewerCompleted: false,
        },
        {
          id: 21,
          challengeId: 30,
          status: 'ACCEPTED',
          shareToken: 'tok-d',
          regDate: '2026-08-02T00:00:00',
          challengeTitle: '함수의 그래프',
          subject: 'MATH',
          unitName: null,
          inviteeId: 42,
          viewerCompleted: true,
          opponentSolvedAt: '2026-08-02T01:00:00',
          opponentName: '민지',
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<MyChallengeInvites />);

    const toggle = screen.getByRole('button', { name: /보기/ });
    await userEvent.setup().click(toggle);

    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    // OPEN 건의 "링크 다시 보내기" 와 ACCEPTED+완료 건의 "결과 보기" 가 각각 뜬다
    expect(screen.getByText('링크 다시 보내기')).toBeInTheDocument();
    expect(screen.getByText('결과 보기')).toBeInTheDocument();
    // 상대 이름(opponentName)이 내부 회원 번호 대신 실명으로 뜬다
    expect(screen.getByText('민지')).toBeInTheDocument();
  });

  test('상대 이름(opponentName)이 없으면 "상대 정보 없음"으로 폴백하고, 화면 어디에도 내부 회원 번호(#숫자)가 노출되지 않는다', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');

    mockUseMyChallengeInvitesQuery.mockReturnValue({
      data: [
        {
          id: 40,
          challengeId: 50,
          status: 'OPEN',
          shareToken: 'tok-g',
          regDate: '2026-08-01T00:00:00',
          challengeTitle: '수열의 극한',
          subject: 'MATH',
          unitName: null,
          inviteeId: null,
          viewerCompleted: false,
        },
        {
          id: 41,
          challengeId: 50,
          status: 'ACCEPTED',
          shareToken: 'tok-h',
          regDate: '2026-08-02T00:00:00',
          challengeTitle: '수열의 극한',
          subject: 'MATH',
          unitName: null,
          inviteeId: 123,
          viewerCompleted: true,
          opponentSolvedAt: '2026-08-02T01:00:00',
          // opponentName 없음(과거 응답 등). 내부 번호 대신 완곡한 문구로 폴백해야 함
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    const { container } = renderWithProviders(<MyChallengeInvites />);

    const toggle = screen.getByRole('button', { name: /보기/ });
    await userEvent.setup().click(toggle);

    expect(screen.getByText('상대 대기 중')).toBeInTheDocument();
    expect(screen.getByText('상대 정보 없음')).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/#\d+/);
  });

  test('묶인 행의 대표 상태 배지는 완료 > 수락됨 > 대기중 순으로 가장 진행된 상태를 보여준다', () => {
    mockUseMyChallengeInvitesQuery.mockReturnValue({
      data: [
        {
          id: 30,
          challengeId: 40,
          status: 'OPEN',
          shareToken: 'tok-e',
          regDate: '2026-08-01T00:00:00',
          challengeTitle: '삼각함수',
          subject: 'MATH',
          unitName: null,
          inviteeId: null,
          viewerCompleted: false,
        },
        {
          id: 31,
          challengeId: 40,
          status: 'COMPLETED',
          shareToken: 'tok-f',
          regDate: '2026-08-02T00:00:00',
          challengeTitle: '삼각함수',
          subject: 'MATH',
          unitName: null,
          inviteeId: 7,
          viewerCompleted: true,
          opponentSolvedAt: '2026-08-02T01:00:00',
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<MyChallengeInvites />);

    expect(
      screen.getByText(inviteStatusLabel('COMPLETED'))
    ).toBeInTheDocument();
    expect(
      screen.queryByText(inviteStatusLabel('OPEN'))
    ).not.toBeInTheDocument();
  });

  test('"결과 보기" 클릭 시 결과 비교 다이얼로그가 열린다', async () => {
    const { default: userEvent } = await import('@testing-library/user-event');

    mockUseMyChallengeInvitesQuery.mockReturnValue({
      data: [
        {
          id: 5,
          challengeId: 14,
          status: 'COMPLETED',
          shareToken: 'tok-click',
          regDate: '2026-08-01T00:00:00',
          challengeTitle: '수열',
          subject: 'MATH',
          unitName: null,
          viewerCompleted: true,
          opponentSolvedAt: '2026-08-01T01:00:00',
        },
      ],
      isLoading: false,
      isError: false,
      refetch: vi.fn(),
    });

    renderWithProviders(<MyChallengeInvites />);

    expect(screen.queryByTestId('result-dialog')).not.toBeInTheDocument();

    await userEvent.setup().click(screen.getByText('결과 보기'));

    expect(screen.getByTestId('result-dialog')).toBeInTheDocument();
  });
});
