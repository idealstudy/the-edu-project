import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const privateClient = Object.assign(vi.fn(), {
    interceptors: {
      request: { use: vi.fn(), eject: vi.fn() },
      response: { use: vi.fn(), eject: vi.fn() },
    },
  });
  return {
    privateClient,
    showErrorToast: vi.fn(),
    rejectHandler: undefined as
      | ((error: unknown) => Promise<unknown>)
      | undefined,
  };
});

vi.mock('@/shared/api', () => ({ ensureRefreshSession: vi.fn() }));
vi.mock('@/shared/lib', () => ({ ShowErrorToast: mocks.showErrorToast }));
vi.mock('@/shared/lib/error', () => ({
  AuthError: class AuthError extends Error {},
}));
vi.mock('./http.transport', () => ({
  http: { private: mocks.privateClient },
}));

import { installHttpInterceptors } from './interceptors';

describe('a-members-error 통합 경고 계약', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.privateClient.interceptors.request.use.mockReturnValue(1);
    mocks.privateClient.interceptors.response.use.mockImplementation(
      (_success: unknown, reject: (error: unknown) => Promise<unknown>) => {
        mocks.rejectHandler = reject;
        return 2;
      }
    );
  });

  it('[a-members-error 정상] 일반 500 응답은 전역 서버 오류 토스트를 표시한다', async () => {
    installHttpInterceptors();
    const error = { config: {}, response: { status: 500, config: {} } };

    await expect(mocks.rejectHandler?.(error)).rejects.toBe(error);
    expect(mocks.showErrorToast).toHaveBeenCalledWith(
      'SERVER_ERROR',
      '서버 오류가 발생했습니다.'
    );
  });

  it('[a-members-error 거절] 화면 통합 경고가 있는 회원 조회 500은 별도 토스트를 표시하지 않는다', async () => {
    installHttpInterceptors();
    const error = {
      config: { suppressGlobalErrorToast: true },
      response: { status: 500, config: {} },
    };

    await expect(mocks.rejectHandler?.(error)).rejects.toBe(error);
    expect(mocks.showErrorToast).not.toHaveBeenCalled();
  });
});
