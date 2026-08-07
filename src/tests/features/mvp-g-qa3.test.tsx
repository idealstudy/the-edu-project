import { WrongAnswerReview } from '@/features/dashboard/components/student/wrong-answer-review';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  wrongAnswers: vi.fn(),
}));

vi.mock('@/features/dashboard/hooks/use-wrong-answer-query', () => ({
  useWrongAnswersQuery: mocks.wrongAnswers,
}));

vi.mock('@/features/dashboard/hooks/use-review-wrong-answer', () => ({
  useReviewWrongAnswer: () => ({
    data: undefined,
    isPending: false,
    mutate: vi.fn(),
  }),
}));

describe('MVP-G QA 3차 회귀', () => {
  it('학생 오답 상세에 선생님이 저장한 코멘트를 글자 그대로 표시한다', () => {
    const teacherComment =
      '공차부터 구하고 시작해. 항 번호를 꼭 적어놓고 풀어.';
    mocks.wrongAnswers.mockReturnValue({
      data: {
        totalCount: 1,
        items: [
          {
            id: 2909,
            studentId: 370,
            sourceType: 'EXAM',
            challengeId: null,
            challengeAttemptId: null,
            examAnswerId: 16574,
            questionSnapshot: null,
            treeNodeId: 10,
            status: 'ACTIVE',
            reviewCount: 0,
            hintFreeSolveCount: 0,
            lastReviewCorrect: null,
            wrongAgainCount: 0,
            nextReviewAt: '2026-08-07T12:34:52',
            graduatedAt: null,
            teacherComment,
            commentedByTeacherId: 42,
            commentedAt: '2026-08-07T12:40:00',
            difficulty: null,
            nationalWrongRate: null,
            title: '8월 진단 6번',
            questionText: '수열의 합을 구하시오.',
            questionImageUrl: null,
          },
        ],
      },
      isError: false,
      isPending: false,
      isSuccess: true,
    });

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <WrongAnswerReview wrongAnswerId={2909} />
      </QueryClientProvider>
    );

    const comment = screen.getByTestId('wrong-answer-teacher-comment');
    expect(comment).toBeVisible();
    expect(comment).toHaveTextContent('선생님 코멘트');
    expect(comment).toHaveTextContent(teacherComment);
  });
});
