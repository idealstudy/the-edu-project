import { normalizeTreeSubject } from '@/entities/tree/infrastructure/tree.repository';
import { TreeMap } from '@/features/weakness-tree/components/tree-map';
import { renderWithProviders } from '@/tests/utils';
import { screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

const sentry = vi.hoisted(() => ({ captureMessage: vi.fn() }));

vi.mock('@sentry/nextjs', () => sentry);

describe('MVP-G 알 수 없는 트리 과목', () => {
  test('원래 값을 보존하고 개발자 로그를 남긴다', () => {
    expect(normalizeTreeSubject('AI_MATH')).toBe('AI_MATH');
    expect(sentry.captureMessage).toHaveBeenCalledWith(
      '[tree] 알 수 없는 과목 코드를 받았습니다.',
      { level: 'error', extra: { subject: 'AI_MATH' } }
    );
  });

  /*
   * 계약 변경(2026-08-10): 회장 지적 5번 "MIDDLE_MATH·COMMON_MATH_1 이 영어로 나온다".
   * 데이터 계층은 원래 값을 그대로 보존하고 Sentry 로 남기되(위 테스트),
   * 화면에는 raw enum 을 노출하지 않고 `기타`로 접는다.
   */
  test('화면의 과목 제목에는 raw enum 대신 기타를 쓴다', () => {
    renderWithProviders(
      <TreeMap
        groups={[
          {
            subject: 'AI_MATH',
            nodes: [],
          },
        ]}
        onSelectNode={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /기타/ })).toBeInTheDocument();
    expect(screen.queryByText(/AI_MATH/)).not.toBeInTheDocument();
  });
});
