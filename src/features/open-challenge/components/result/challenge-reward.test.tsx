import { renderWithProviders } from '@/tests/utils';
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';

import { ChallengeReward } from './challenge-reward';

const mockReward = {
  pointDelta: 10,
  pointBalance: 120,
  streakKept: true,
  streakDays: 3,
  expDelta: 20,
  expBefore: 40,
  level: 1,
  leveledUp: false,
  treeNodeName: '이차방정식',
  masteryBefore: 30,
  masteryAfter: 40,
  conquered: false,
};

const mockRewardConquered = {
  ...mockReward,
  masteryBefore: 90,
  masteryAfter: 100,
  conquered: true,
};

describe('ChallengeReward (풀이 완료 보상 영역)', () => {
  afterEach(() => cleanup());

  // ── 기존 케이스 (reward 없음 = 정적 텍스트 폴백) ──
  test('정답이면 포인트·나무 성장 보상과 "약점 나무 보기" 링크(/tree)를 보여준다', () => {
    renderWithProviders(<ChallengeReward isCorrect={true} />);

    expect(screen.getByText('정답입니다!')).toBeInTheDocument();
    expect(
      screen.getByText(/약점 나무의 이 개념이 한 칸 자랐어요/)
    ).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /약점 나무 보기/ });
    expect(link).toHaveAttribute('href', '/tree');
  });

  test('오답이면 약점 표시와 "약점 나무에서 채우기" 링크(/tree)를 보여준다', () => {
    renderWithProviders(<ChallengeReward isCorrect={false} />);

    expect(
      screen.getByText('이 개념이 약점으로 표시됐어요')
    ).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /약점 나무에서 채우기/ });
    expect(link).toHaveAttribute('href', '/tree');
  });

  // ── 신규 케이스: reward prop 있을 때 실수치 렌더 ──
  test('reward가 있는 정답이면 포인트·스트릭·트리 성장 배지를 보여준다', () => {
    renderWithProviders(
      <ChallengeReward isCorrect={true} reward={mockReward} />
    );

    expect(screen.getByText('정답입니다!')).toBeInTheDocument();
    expect(screen.getByTestId('reward-point-badge')).toHaveTextContent('+10 포인트');
    expect(screen.getByTestId('reward-streak-badge')).toHaveTextContent('3일 연속');
    expect(screen.getByTestId('reward-mastery-badge')).toHaveTextContent('이차방정식 30→40');
  });

  test('정복(conquered)이면 conquered 배지를 보여준다', () => {
    renderWithProviders(
      <ChallengeReward isCorrect={true} reward={mockRewardConquered} />
    );

    expect(screen.getByTestId('reward-conquered-badge')).toBeInTheDocument();
    expect(screen.getByTestId('reward-conquered-badge')).toHaveTextContent('정복!');
  });

  test('reward가 있는 오답이면 스트릭 배지(있을 때)를 보여주고 포인트 배지는 없다', () => {
    const incorrectReward = { ...mockReward, pointDelta: 0 };
    renderWithProviders(
      <ChallengeReward isCorrect={false} reward={incorrectReward} />
    );

    expect(screen.getByText('이 개념이 약점으로 표시됐어요')).toBeInTheDocument();
    expect(screen.queryByTestId('reward-point-badge')).not.toBeInTheDocument();
    expect(screen.getByTestId('reward-streak-badge')).toHaveTextContent('3일 연속');
  });

  test('reward=null이면 정적 텍스트 폴백으로 크래시 없이 렌더된다', () => {
    renderWithProviders(
      <ChallengeReward isCorrect={true} reward={null} />
    );

    expect(screen.getByText('정답입니다!')).toBeInTheDocument();
    expect(screen.queryByTestId('reward-badges')).not.toBeInTheDocument();
  });

  test('오답에 reward=null이면 크래시 없이 렌더된다', () => {
    renderWithProviders(
      <ChallengeReward isCorrect={false} reward={null} />
    );

    expect(screen.getByText('이 개념이 약점으로 표시됐어요')).toBeInTheDocument();
  });
});
