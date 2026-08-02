import { renderWithProviders } from '@/tests/utils';
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { SignupSheet } from './signup-sheet';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

describe('SignupSheet (게스트 가입 유도 모달)', () => {
  afterEach(() => cleanup());

  test('limit-reached + 오답이면 상단에 정오(틀림) 표시를 먼저 보여준다', () => {
    renderWithProviders(
      <SignupSheet
        isOpen
        onOpenChange={vi.fn()}
        trigger="limit-reached"
        challengeId="4167"
        isCorrect={false}
      />
    );

    const verdict = screen.getByTestId('signup-sheet-verdict');
    expect(verdict).toHaveTextContent('아쉽게 틀렸어요');
    // 가입 CTA는 오답이어도 그대로 유지된다.
    expect(screen.getByTestId('signup-sheet-cta')).toBeInTheDocument();
  });

  test('limit-reached + 정답이면 상단에 정오(맞힘) 표시를 보여준다', () => {
    renderWithProviders(
      <SignupSheet
        isOpen
        onOpenChange={vi.fn()}
        trigger="limit-reached"
        challengeId="4167"
        isCorrect={true}
      />
    );

    expect(screen.getByTestId('signup-sheet-verdict')).toHaveTextContent(
      '방금 문제, 맞혔어요!'
    );
  });

  test('isCorrect 가 없으면(예: correct-answer 트리거) 정오 배너를 렌더하지 않는다', () => {
    renderWithProviders(
      <SignupSheet
        isOpen
        onOpenChange={vi.fn()}
        trigger="correct-answer"
        challengeId="4167"
      />
    );

    expect(
      screen.queryByTestId('signup-sheet-verdict')
    ).not.toBeInTheDocument();
  });
});
