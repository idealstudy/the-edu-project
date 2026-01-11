import { api } from '@/shared/api';
import { useMutation } from '@tanstack/react-query';

import {
  MediaTargetType,
  MediaUploadResult,
  PresignBatchResponse,
  UseFileUploadOptions,
} from '../types';

type UploadFileParams = {
  file: File;
  targetType: MediaTargetType;
};

/**
 * Presign URL을 요청하고 실제 파일을 업로드한 후 mediaId를 반환합니다.
 */
const uploadFileApi = async ({
  file,
  targetType,
}: UploadFileParams): Promise<MediaUploadResult> => {
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
    throw new Error('파일 업로드 정보를 가져오는데 실패했습니다.');
  }

  // 2. Presigned URL로 실제 파일 업로드
  const uploadResponse = await fetch(mediaAsset.uploadUrl, {
    method: 'PUT',
    headers: mediaAsset.headers,
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error('파일 업로드에 실패했습니다.');
  }

  // 3. 미리보기용 blob URL 생성
  const previewUrl = URL.createObjectURL(file);

  // 4. media://{mediaId} 형식과 미리보기 URL 함께 반환
  return {
    mediaId: mediaAsset.mediaId,
    mediaUrl: `media://${mediaAsset.mediaId}`,
    previewUrl, // 미리보기용으로 사용
    fileName: file.name,
    sizeBytes: file.size,
  };
};

export const useFileUpload = (options?: UseFileUploadOptions) => {
  const targetType = options?.targetType ?? 'TEACHING_NOTE';

  const mutation = useMutation({
    mutationFn: (file: File) => uploadFileApi({ file, targetType }),
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
