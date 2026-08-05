import { payload, repository } from '@/entities/wrong-answer';
import { classifyWrongAnswerError } from '@/shared/lib/errors/errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
}));

vi.mock('@/shared/api', () => ({
  api: {
    private: {
      get: getMock,
      post: postMock,
    },
  },
}));

const WRONG_ANSWER_ITEM = {
  id: 41,
  studentId: 7,
  sourceType: 'EXAM',
  challengeId: 11,
  challengeAttemptId: 21,
  examAnswerId: 31,
  questionSnapshot: { sourceText: '6월 모평 12번' },
  treeNodeId: 51,
  status: 'ACTIVE',
  reviewCount: 2,
  hintFreeSolveCount: 1,
  lastReviewCorrect: false,
  wrongAgainCount: 0,
  nextReviewAt: '2026-08-02T09:00:00',
  graduatedAt: null,
  teacherComment: null,
  commentedByTeacherId: null,
  commentedAt: null,
  difficulty: 'HIGH',
  nationalWrongRate: 72,
  title: '등차수열의 합',
  questionText: '수열의 합을 구하시오.',
  questionImageUrl: null,
} as const;

describe('wrong-answer repository', () => {
  beforeEach(() => {
    getMock.mockReset();
    postMock.mockReset();
  });

  it('BFF 학생 경로에서 오늘의 문제 envelope를 해제한다', async () => {
    getMock.mockResolvedValue({
      status: 200,
      message: '성공입니다.',
      data: {
        queueDate: '2026-07-30',
        backlogCount: 11,
        onboarding: false,
        items: [
          {
            position: 1,
            provider: 'TEACHER',
            wrongAnswerId: 41,
            challengeId: 11,
            reason: '선생님이 배정한 오답',
            difficulty: 'HIGH',
            nationalWrongRate: 72,
            stampsFilled: 2,
            stampsTotal: 5,
            solvedStatus: 'PENDING',
            kind: 'WRONG_ANSWER',
            badge: '선생님 출제',
          },
        ],
        handoff: {
          returnUrl: '/dashboard/student',
          origin: 'DAILY_PROBLEM',
        },
      },
    });

    const result = await repository.getDailyProblems();

    expect(getMock).toHaveBeenCalledWith('/student/daily-problems', {
      params: undefined,
    });
    expect(result.items[0]?.wrongAnswerId).toBe(41);
    expect(result.backlogCount).toBe(11);
  });

  it('오답 창고 응답의 ACTIVE와 GRADUATED 상태를 모두 검증한다', async () => {
    getMock.mockResolvedValue({
      status: 200,
      message: '성공입니다.',
      data: {
        totalCount: 2,
        items: [
          WRONG_ANSWER_ITEM,
          {
            ...WRONG_ANSWER_ITEM,
            id: 42,
            status: 'GRADUATED',
            reviewCount: 5,
            graduatedAt: '2026-07-29T12:00:00',
          },
        ],
      },
    });

    const result = await repository.getWrongAnswers();

    expect(getMock).toHaveBeenCalledWith('/student/wrong-answers', {
      params: undefined,
    });
    expect(result.items.map((item) => item.status)).toEqual([
      'ACTIVE',
      'GRADUATED',
    ]);
  });

  it('정오답·힌트·AI 사용 값을 빠짐없이 회독 POST로 보낸다', async () => {
    postMock.mockResolvedValue({
      status: 200,
      message: '성공입니다.',
      data: {
        reviewNo: 3,
        reviewCount: 3,
        graduated: false,
        nextReviewAt: '2026-08-06T09:00:00',
        hintFreeSolveCount: 1,
        stampsFilled: 3,
        stampsTotal: 5,
      },
    });

    const input = {
      isCorrect: false,
      usedHint: true,
      usedAi: false,
    };
    const result = await repository.reviewWrongAnswer(41, input);

    expect(postMock).toHaveBeenCalledWith(
      '/student/wrong-answers/41/reviews',
      input
    );
    expect(result.reviewCount).toBe(3);
  });

  it('하루 1회독과 복습 간격 409는 현재 화면에서 복구하는 FIELD로 분류한다', () => {
    expect(
      classifyWrongAnswerError('WRONG_ANSWER_ALREADY_REVIEWED_TODAY')
    ).toBe('FIELD');
    expect(classifyWrongAnswerError('WRONG_ANSWER_REVIEW_NOT_DUE')).toBe(
      'FIELD'
    );
    expect(classifyWrongAnswerError('WRONG_ANSWER_NOT_FOUND')).toBe('CONTEXT');
    expect(() =>
      payload.review.parse({ isCorrect: true, usedHint: false })
    ).toThrow();
  });
});
