import { useMutation } from '@tanstack/react-query';

import { LinkPreviewData, UseLinkPreviewOptions } from '../types';

// TODO: 실제 API 엔드포인트로 교체 필요
// 서버에서 OG 태그를 파싱해서 반환해야 함 (CORS 문제로 클라이언트에서 직접 요청 불가)
const fetchLinkPreview = async (url: string): Promise<LinkPreviewData> => {
  // TODO: 실제 API 엔드포인트로 교체
  const response = await fetch(
    `/api/link-preview?url=${encodeURIComponent(url)}`
  );

  if (!response.ok) {
    throw new Error('링크 미리보기를 불러오는데 실패했습니다.');
  }

  return response.json();
};

export const useLinkPreview = (options?: UseLinkPreviewOptions) => {
  const mutation = useMutation({
    mutationFn: fetchLinkPreview,
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });

  return {
    fetchPreview: mutation.mutate,
    fetchPreviewAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
};
