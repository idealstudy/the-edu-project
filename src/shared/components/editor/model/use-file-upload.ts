import { useMutation } from '@tanstack/react-query';

import { FileUploadResponse, UseFileUploadOptions } from '../types';

// TODO: 실제 API 엔드포인트로 교체 필요
const uploadFileApi = async (file: File): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);

  // TODO: 실제 API 엔드포인트로 교체
  const response = await fetch('/api/upload/file', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('파일 업로드에 실패했습니다.');
  }

  return response.json();
};

export const useFileUpload = (options?: UseFileUploadOptions) => {
  const mutation = useMutation({
    mutationFn: uploadFileApi,
    onSuccess: (data) => {
      options?.onSuccess?.(data);
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
