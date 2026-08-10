import { StudentResultsPage } from '@/features/dashboard/components/student/student-results-page';
import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  growth: vi.fn(),
  points: vi.fn(),
  tree: vi.fn(),
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
        ],
        mastery: {
          total: 4,
          mastered: 1,
          inProgress: 3,
          weak: 3,
          untested: 0,
          averageScore: 49,
        },
      },
      isError: false,
      refetch: vi.fn(),
    });
  });

  it('미완료 풀이 단원이 가장 많은 한 과목만 기본으로 펼친다', () => {
    render(<StudentResultsPage />);

    expect(
      screen.getByTestId('learning-map-group-toggle-MATH_1')
    ).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.getByTestId('learning-map-group-toggle-MATH_2')
    ).toHaveAttribute('aria-expanded', 'true');
    expect(
      screen.getByTestId('learning-map-group-toggle-PROBABILITY_STATISTICS')
    ).toHaveAttribute('aria-expanded', 'false');
    expect(screen.getByText('2과목')).toBeVisible();
  });

  it('접힌 과목을 눌러 추가로 펼치고 접힌 수를 줄인다', () => {
    render(<StudentResultsPage />);

    fireEvent.click(screen.getByTestId('learning-map-group-toggle-MATH_1'));

    expect(
      screen.getByTestId('learning-map-group-toggle-MATH_1')
    ).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('1과목')).toBeVisible();
  });
});
