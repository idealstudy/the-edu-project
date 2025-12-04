import { useMutation } from '@tanstack/react-query';

import { UploadImageResponse, UseImageUploadOptions } from '../types';

// TODO: 실제 API 엔드포인트로 교체 필요
const uploadImageApi = async (file: File): Promise<UploadImageResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  // TODO: 실제 API 엔드포인트로 교체
  const response = await fetch('/api/upload/image', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('이미지 업로드에 실패했습니다.');
  }

  return response.json();
};

export const useImageUpload = (options?: UseImageUploadOptions) => {
  const mutation = useMutation({
    mutationFn: uploadImageApi,
    onSuccess: (data) => {
      options?.onSuccess?.(data.url);
    },
    onError: (error: Error) => {
      options?.onError?.(error);
    },
  });

  return {
    upload: mutation.mutate,
    uploadAsync: mutation.mutateAsync,
    isUploading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};
