import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getMyWallet: vi.fn(),
}));

vi.mock('@/entities/point', () => ({
  pointKeys: {
    wallet: () => ['point', 'wallet'],
    solutionViewCost: () => ['point', 'solution-view-cost'],
  },
  repository: {
    getMyWallet: mocks.getMyWallet,
    getSolutionViewCost: vi.fn(),
  },
}));

import { useMyPointWalletQuery } from './use-point';

describe('BUG-QA-02 역할별 포인트 지갑 조회 계약', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getMyWallet.mockResolvedValue({ balance: 120, transactions: [] });
  });

  function wrapper({ children }: PropsWithChildren) {
    const client = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    return (
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    );
  }

  it('[BUG-QA-02 정상] 지갑이 있는 역할은 포인트 API를 조회한다', async () => {
    const { result } = renderHook(() => useMyPointWalletQuery(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mocks.getMyWallet).toHaveBeenCalledTimes(1);
  });

  it('[BUG-QA-02 거절] ADMIN처럼 지갑이 없는 역할은 포인트 API를 조회하지 않는다', async () => {
    renderHook(() => useMyPointWalletQuery({ enabled: false }), { wrapper });

    await new Promise((resolve) => window.setTimeout(resolve, 0));
    expect(mocks.getMyWallet).not.toHaveBeenCalled();
  });
});
