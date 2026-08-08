import { renderWithProviders } from '@/tests/utils';
import { cleanup, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { ShortAnswerInput } from './short-answer-input';

describe('ShortAnswerInput', () => {
  afterEach(() => cleanup());

  test('testid=short-answer-input 로 렌더된다 (E2E 셀렉터)', () => {
    renderWithProviders(
      <ShortAnswerInput
        value=""
        onChange={vi.fn()}
      />
    );

    expect(screen.getByTestId('short-answer-input')).toBeInTheDocument();
  });

  test('숫자 키패드를 유도하는 inputMode=numeric 이다', () => {
    renderWithProviders(
      <ShortAnswerInput
        value=""
        onChange={vi.fn()}
      />
    );

    expect(screen.getByTestId('short-answer-input')).toHaveAttribute(
      'inputMode',
      'numeric'
    );
  });

  test('입력하면 onChange 로 값이 그대로 전달된다', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProviders(
      <ShortAnswerInput
        value=""
        onChange={onChange}
      />
    );

    await user.type(screen.getByTestId('short-answer-input'), '42');

    expect(onChange).toHaveBeenCalledWith('4');
    expect(onChange).toHaveBeenCalledWith('2');
  });

  test('value prop 을 그대로 반영한다', () => {
    renderWithProviders(
      <ShortAnswerInput
        value="42"
        onChange={vi.fn()}
      />
    );

    expect(screen.getByTestId('short-answer-input')).toHaveValue('42');
  });
});
