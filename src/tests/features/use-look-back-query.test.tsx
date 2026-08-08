import type { PropsWithChildren } from 'react';

import { lookBackKeys } from '@/entities/look-back/infrastructure/look-back.keys';
import { useLookBackQuery } from '@/features/dashboard/hooks/use-look-back-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getLookBack: vi.fn(),
}));

vi.mock('@/entities/look-back/infrastructure/look-back.repository', () => ({
  lookBackRepository: { getLookBack: mocks.getLookBack },
}));

describe('useLookBackQuery', () => {
  beforeEach(() => {
    mocks.getLookBack.mockReset();
  });

  it('기간과 offset을 전용 query key로 분리해 repository 결과를 캐시한다', async () => {
    const response = {
      coachMessage: null,
      calendar: [],
      retrospects: [],
    };
    mocks.getLookBack.mockResolvedValue(response);
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const wrapper = ({ children }: PropsWithChildren) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );

    const { result } = renderHook(() => useLookBackQuery('MONTH', 2), {
      wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mocks.getLookBack).toHaveBeenCalledWith('MONTH', 2);
    expect(queryClient.getQueryData(lookBackKeys.period('MONTH', 2))).toEqual(
      response
    );
    expect(lookBackKeys.period('WEEK')).toEqual([
      'student-look-back',
      'WEEK',
      0,
    ]);
  });
});
