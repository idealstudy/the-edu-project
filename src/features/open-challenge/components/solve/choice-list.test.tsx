import { renderWithProviders } from '@/tests/utils';
import { cleanup, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { ChoiceList } from './choice-list';

describe('ChoiceList', () => {
  afterEach(() => cleanup());

  test('선택지 텍스트가 번호(1,2,3...)와 같으면 중복 표시하지 않는다', () => {
    renderWithProviders(
      <ChoiceList
        choices={['1', '2', '3', '4']}
        selected={null}
        onSelect={vi.fn()}
      />
    );

    // 번호 배지(①~④ 대신 1~4 숫자)는 각 버튼에 1개씩만 있어야 하고,
    // 선택지 텍스트 span은 렌더되지 않아야 한다 — "① 1" 같은 중복 노출 버그 방지.
    const option0 = screen.getByTestId('choice-option-0');
    expect(option0.textContent).toBe('1');
  });

  test('선택지 텍스트가 번호와 다르면 그대로 보여준다', () => {
    renderWithProviders(
      <ChoiceList
        choices={['서울', '부산', '대구', '광주']}
        selected={null}
        onSelect={vi.fn()}
      />
    );

    const option0 = screen.getByTestId('choice-option-0');
    expect(option0.textContent).toBe('1서울');
    expect(screen.getByText('서울')).toBeInTheDocument();
  });
});
