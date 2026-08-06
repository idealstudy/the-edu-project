import { normalizeTreeSubject } from '@/entities/tree/infrastructure/tree.repository';
import { TreeMap } from '@/features/weakness-tree/components/tree-map';
import { renderWithProviders } from '@/tests/utils';
import { screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

describe('MVP-G 알 수 없는 트리 과목', () => {
  test('원래 값을 보존하고 개발자 로그를 남긴다', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(normalizeTreeSubject('AI_MATH')).toBe('AI_MATH');
    expect(error).toHaveBeenCalledWith(
      '[tree] 알 수 없는 과목 코드를 받았습니다.',
      { subject: 'AI_MATH' }
    );

    error.mockRestore();
  });

  test('화면의 과목 제목에 원래 값을 그대로 표시한다', () => {
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

    expect(
      screen.getByRole('heading', { name: /AI_MATH/ })
    ).toBeInTheDocument();
  });
});
