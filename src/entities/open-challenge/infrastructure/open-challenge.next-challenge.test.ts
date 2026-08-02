import { beforeEach, describe, expect, it, vi } from 'vitest';

/* ────────────────────────────────────────────────────────
 * 다음 문제 선택 로직 — repository.getNextChallenge
 *  - 로그인: 추천 API 결과에서 완료(COMPLETED) 문제를 제외.
 *  - 게스트: 추천 API 결과에서 현재 풀고 있는 문제만 제외.
 *  - 추천 목록 소진 시 기존 인기순 목록으로 폴백.
 * ──────────────────────────────────────────────────────*/

const { getMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
}));

vi.mock('@/shared/api', () => ({
  api: {
    public: { get: getMock },
    private: { get: getMock },
  },
}));

const recommendedItem = (id: string, wrongAnswerRate = 40) => ({
  id,
  subject: 'MATH',
  difficulty: 'MID',
  wrongAnswerRate,
  sourceText: '2026 6월 모평 12번',
  questionText: `문제 ${id}`,
  questionImageUrl: null,
  participantCount: 10,
  recommendReason: '오답률 기반 추천',
});

const popularListItem = (id: string) => ({
  id,
  subject: 'MATH',
  difficulty: 'MID',
  wrongAnswerRate: 30,
  title: `인기 문제 ${id}`,
  sourceText: '기출',
  questionText: `문제 ${id}`,
  questionImageUrl: null,
  participantCount: 20,
  passRate: 70,
});

const myChallengeAttempt = (challengeId: string, status: string) => ({
  challengeId,
  subject: 'MATH',
  difficulty: 'MID',
  status,
  sourceText: '기출',
  questionText: '문제',
  questionImageUrl: null,
  isCorrect: true,
  usedAi: false,
  completedAt: '2026-08-01T00:00:00',
});

describe('repository.getNextChallenge', () => {
  beforeEach(() => {
    getMock.mockReset();
  });

  it('로그인 사용자는 이미 완료한 문제를 추천 목록에서 제외한다', async () => {
    const { repository } = await import('./open-challenge.repository');

    getMock.mockImplementation((url: string) => {
      if (url === '/public/challenges/recommended') {
        return Promise.resolve({
          status: 200,
          message: '성공',
          data: [
            recommendedItem('101'),
            recommendedItem('102'),
            recommendedItem('103'),
          ],
        });
      }
      if (url === '/common/me/challenges') {
        return Promise.resolve({
          status: 200,
          message: '성공',
          data: {
            content: [myChallengeAttempt('101', 'COMPLETED')],
            hasNext: false,
          },
        });
      }
      throw new Error(`unexpected url: ${url}`);
    });

    const next = await repository.getNextChallenge('100', {
      isGuest: false,
    });

    // 101은 완료했으니 제외되고, 다음 순번인 102가 나와야 한다.
    expect(next?.id).toBe('102');
  });

  it('게스트는 완료 여부를 조회하지 않고 현재 문제만 제외한 추천 순서대로 진행한다', async () => {
    const { repository } = await import('./open-challenge.repository');

    getMock.mockImplementation((url: string) => {
      if (url === '/public/challenges/recommended') {
        return Promise.resolve({
          status: 200,
          message: '성공',
          data: [recommendedItem('100'), recommendedItem('102')],
        });
      }
      throw new Error(`unexpected url for guest: ${url}`);
    });

    const next = await repository.getNextChallenge('100', { isGuest: true });

    expect(next?.id).toBe('102');
    // 게스트는 /common/me/challenges(완료목록)를 호출하지 않아야 한다(401 방지).
    expect(getMock).not.toHaveBeenCalledWith(
      '/common/me/challenges',
      expect.anything()
    );
  });

  it('추천 목록이 소진되면(전부 완료) 기존 인기순 목록으로 폴백한다', async () => {
    const { repository } = await import('./open-challenge.repository');

    getMock.mockImplementation((url: string) => {
      if (url === '/public/challenges/recommended') {
        return Promise.resolve({
          status: 200,
          message: '성공',
          data: [recommendedItem('101')],
        });
      }
      if (url === '/common/me/challenges') {
        return Promise.resolve({
          status: 200,
          message: '성공',
          data: {
            content: [myChallengeAttempt('101', 'COMPLETED')],
            hasNext: false,
          },
        });
      }
      if (url === '/public/challenges') {
        return Promise.resolve({
          status: 200,
          message: '성공',
          data: {
            content: [popularListItem('100'), popularListItem('999')],
            hasNext: false,
          },
        });
      }
      throw new Error(`unexpected url: ${url}`);
    });

    const next = await repository.getNextChallenge('100', {
      isGuest: false,
    });

    // 추천 유일 후보(101)가 완료 처리로 제외 → 인기순 폴백에서 현재 문제(100) 제외한 999.
    expect(next?.id).toBe('999');
  });
});
