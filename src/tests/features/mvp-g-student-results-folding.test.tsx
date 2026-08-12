import { StudentResultsPage } from '@/features/dashboard/components/student/student-results-page';
import { TodayProblemsSection } from '@/features/dashboard/components/student/today-problems-section';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  challengeDetail: vi.fn(),
  dailyProblems: vi.fn(),
  growth: vi.fn(),
  points: vi.fn(),
  tree: vi.fn(),
  wrongAnswers: vi.fn(),
}));

vi.mock('@/features/open-challenge/hooks/use-open-challenge', () => ({
  useOpenChallengeDetailQuery: mocks.challengeDetail,
}));

vi.mock('@/features/dashboard/hooks/use-wrong-answer-query', () => ({
  useDailyProblemsQuery: mocks.dailyProblems,
  useWrongAnswersQuery: mocks.wrongAnswers,
}));

vi.mock('@/features/dashboard/hooks/use-growth-query', () => ({
  useStudentGrowthQuery: mocks.growth,
}));

vi.mock('@/features/point/hooks/use-point', () => ({
  useMyPointWalletQuery: mocks.points,
}));

vi.mock('@/features/weakness-tree/hooks/use-tree', () => ({
  useMyTreeQuery: mocks.tree,
}));

const node = (
  nodeId: string,
  subject: string,
  masteryScore: number,
  attemptCount: number
) => ({
  nodeId,
  parentId: null,
  subject,
  unit: `unit-${nodeId}`,
  displayName: `단원 ${nodeId}`,
  depth: 1,
  masteryScore,
  diagnosedScore: null,
  attemptCount,
  correctCount: Math.floor(attemptCount / 2),
  unitNotePageCount: 0,
  intensity: masteryScore >= 80 ? 'mastered' : 'progress',
  stuck: false,
  diagnosedOnly: false,
});

describe('학생 성과 학습 지도 대량 데이터 접기', () => {
  beforeEach(() => {
    mocks.challengeDetail.mockReturnValue({
      data: { topic: '시그마 계산' },
      isPending: false,
    });
    mocks.dailyProblems.mockReturnValue({
      data: {
        backlogCount: 327,
        onboarding: false,
        items: [
          {
            position: 1,
            provider: 'TEACHER',
            wrongAnswerId: 101,
            challengeId: 201,
            reason: '카드에서 제거할 선정 이유',
            difficulty: 'HIGHEST',
            nationalWrongRate: 89,
            stampsFilled: 2,
            stampsTotal: 5,
            solvedStatus: 'PENDING',
            kind: 'WRONG_ANSWER',
            badge: '선생님 출제',
          },
          {
            position: 2,
            provider: 'OPEN_CHALLENGE_RECOMMEND',
            wrongAnswerId: null,
            challengeId: 202,
            reason: '카드에서 제거할 두 번째 선정 이유',
            difficulty: 'MIDDLE',
            nationalWrongRate: 51,
            stampsFilled: 0,
            stampsTotal: 5,
            solvedStatus: 'PENDING',
            kind: 'RECOMMENDED',
            badge: '추천',
          },
        ],
      },
      isError: false,
      isPending: false,
    });
    mocks.wrongAnswers.mockReturnValue({
      data: {
        items: [
          {
            id: 101,
            title: '수열의 합',
            questionText: '카드에서 제거할 문제 본문',
            questionSnapshot: { unit: '수열의 합' },
          },
        ],
      },
      isPending: false,
    });
    mocks.growth.mockReturnValue({
      data: { level: 3, xp: 20, xpToNextLevel: 100, streakDays: 2 },
    });
    mocks.points.mockReturnValue({ data: { balance: 120 } });
    mocks.tree.mockReturnValue({
      data: {
        groups: [
          {
            subject: 'MATH_1',
            nodes: [node('1', 'MATH_1', 85, 20)],
          },
          {
            subject: 'MATH_2',
            nodes: [node('2', 'MATH_2', 35, 4), node('3', 'MATH_2', 55, 3)],
          },
          {
            subject: 'PROBABILITY_STATISTICS',
            nodes: [node('4', 'PROBABILITY_STATISTICS', 20, 2)],
          },
          {
            subject: 'COMMON_MATH_1',
            nodes: [node('5', 'COMMON_MATH_1', 0, 0)],
          },
        ],
        mastery: {
          total: 5,
          mastered: 1,
          inProgress: 3,
          weak: 3,
          untested: 1,
          averageScore: 39,
        },
      },
      isError: false,
      refetch: vi.fn(),
    });
  });

  it('풀이 또는 정복도 기록이 있는 과목을 모두 기본으로 펼친다', () => {
    render(<StudentResultsPage />);

    expect(
      screen.getByTestId('learning-map-group-toggle-MATH_1')
    ).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByTestId('learning-map-group-toggle-MATH_2')
    ).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByTestId('learning-map-group-toggle-PROBABILITY_STATISTICS')
    ).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByTestId('learning-map-group-toggle-COMMON_MATH_1')
    ).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('1과목')).toBeVisible();
  });

  it('기록이 없어 접힌 과목도 눌러서 펼칠 수 있다', () => {
    render(<StudentResultsPage />);

    fireEvent.click(
      screen.getByTestId('learning-map-group-toggle-COMMON_MATH_1')
    );

    expect(
      screen.getByTestId('learning-map-group-toggle-COMMON_MATH_1')
    ).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByText('1과목')).not.toBeInTheDocument();
  });

  it('오늘의 문제는 단원과 메타만 남기고 공통 핸드오프를 한 번만 보인다', () => {
    render(<TodayProblemsSection />);

    const section = screen.getByTestId('daily-problems-section');
    const text = section.textContent ?? '';

    expect(screen.getByText('수열의 합')).toBeVisible();
    expect(screen.getByText('시그마 계산')).toBeVisible();
    expect(screen.getAllByRole('link', { name: '풀기' })).toHaveLength(2);
    expect(text).not.toContain('카드에서 제거할 문제 본문');
    expect(text).not.toContain('카드에서 제거할 선정 이유');
    expect(text).not.toContain('왜 이 문제?');
    expect(text.match(/오픈챌린지 라인의 풀이 화면/g)).toHaveLength(1);
    expect(text).toContain(
      '카드를 누르면 오픈챌린지 라인의 풀이 화면으로 넘어갑니다. 문제 본문, AI 코치, 손풀이, 채점, 해설은 그쪽 소관입니다. 다 풀면 결과만 이 화면으로 돌아옵니다.'
    );
  });
});
