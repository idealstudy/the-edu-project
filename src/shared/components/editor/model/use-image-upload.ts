import { api } from '@/shared/api';
import { useMutation } from '@tanstack/react-query';

import {
  MediaTargetType,
  MediaUploadResult,
  PresignBatchResponse,
  UseImageUploadOptions,
} from '../types';

type UploadImageParams = {
  file: File;
  targetType: MediaTargetType;
};

/**
 * Presign URL을 요청하고 실제 파일을 업로드한 후 mediaId를 반환합니다.
 */
const uploadImageApi = async ({
  file,
  targetType,
}: UploadImageParams): Promise<MediaUploadResult> => {
  // 1. Presign URL 요청
  const presignData = await api.private.post<PresignBatchResponse>(
    '/common/media/presign-batch',
    {
      targetType,
      mediaAssetList: [
        {
          fileName: file.name,
          contentType: file.type,
          sizeBytes: file.size,
        },
      ],
    }
  );

  const mediaAsset = presignData.data.mediaAssetList[0];

  if (!mediaAsset) {
    throw new Error('이미지 업로드 정보를 가져오는데 실패했습니다.');
  }

  // 2. Presigned URL로 실제 파일 업로드
  const uploadResponse = await fetch(mediaAsset.uploadUrl, {
    method: 'PUT',
    headers: mediaAsset.headers,
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error('이미지 업로드에 실패했습니다.');
  }

  // 3. media://{mediaId} 형식으로 반환
  return {
    mediaId: mediaAsset.mediaId,
    mediaUrl: `media://${mediaAsset.mediaId}`,
    fileName: file.name,
    sizeBytes: file.size,
  };
};

export const useImageUpload = (options?: UseImageUploadOptions) => {
  const targetType = options?.targetType ?? 'TEACHING_NOTE';

  const mutation = useMutation({
    mutationFn: (file: File) => uploadImageApi({ file, targetType }),
    onSuccess: (result) => {
      options?.onSuccess?.(result);
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
