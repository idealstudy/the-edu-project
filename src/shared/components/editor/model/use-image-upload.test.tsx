import { type ReactNode } from 'react';

import { api } from '@/shared/api';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useImageUpload } from './use-image-upload';

vi.mock('@/shared/api', () => ({
  api: {
    private: {
      post: vi.fn(),
    },
  },
}));

describe('useImageUpload', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('관리자 화면에서는 관리자 전용 presign 경로를 사용한다', async () => {
    vi.mocked(api.private.post).mockResolvedValue({
      status: 200,
      message: '성공입니다.',
      data: {
        mediaAssetList: [
          {
            id: 1,
            fileName: 'question.png',
            mediaId: 'media-1',
            uploadUrl: 'https://upload.example/question.png',
            headers: { 'Content-Type': 'image/png' },
          },
        ],
      },
    });
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 200 })
    );
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } },
    });
    const { result } = renderHook(
      () => useImageUpload({ presignPath: '/admin/media/presign-batch' }),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <QueryClientProvider client={queryClient}>
            {children}
          </QueryClientProvider>
        ),
      }
    );

    await act(async () => {
      await result.current.uploadAsync(
        new File(['image'], 'question.png', { type: 'image/png' })
      );
    });

    expect(api.private.post).toHaveBeenCalledWith(
      '/admin/media/presign-batch',
      expect.objectContaining({
        mediaAssetList: [expect.objectContaining({ fileName: 'question.png' })],
      })
    );
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://upload.example/question.png',
      expect.objectContaining({ method: 'PUT' })
    );
  });
});
