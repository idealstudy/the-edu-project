import { TreeNodePicker } from '@/features/exam/components/tree-node-picker';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

vi.mock('@/features/weakness-tree/hooks/use-tree', () => ({
  useMyTreeQuery: () => ({
    isPending: false,
    data: {
      groups: [
        {
          subject: 'ALGEBRA',
          nodes: [{ nodeId: '10', displayName: '수열', depth: 1 }],
        },
        {
          subject: 'COMMON_MATH_1',
          nodes: [{ nodeId: '20', displayName: '다항식', depth: 1 }],
        },
      ],
    },
  }),
}));

describe('TC-API-001 teacher 문제은행 학년별 단원 selector 계약', () => {
  afterEach(cleanup);

  test('HIGH_2는 고2 허용 단원만 노출한다', () => {
    render(
      <TreeNodePicker
        grade="HIGH_2"
        value={[]}
        onChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('단원 고르기'));
    expect(screen.getByRole('button', { name: /수열/ })).toBeVisible();
    expect(screen.queryByRole('button', { name: /다항식/ })).toBeNull();
  });

  test('HIGH_1은 고1 허용 단원만 노출한다', () => {
    render(
      <TreeNodePicker
        grade="HIGH_1"
        value={[]}
        onChange={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText('단원 고르기'));
    expect(screen.getByRole('button', { name: /다항식/ })).toBeVisible();
    expect(screen.queryByRole('button', { name: /수열/ })).toBeNull();
  });
});
