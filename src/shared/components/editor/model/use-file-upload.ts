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

const uploadFileApi = async ({
  file,
  targetType,
}: UploadFileParams): Promise<MediaUploadResult> => {
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

  const uploadResponse = await fetch(mediaAsset.uploadUrl, {
    method: 'PUT',
    headers: mediaAsset.headers,
    body: file,
  });

  if (!uploadResponse.ok) {
    throw new Error('파일 업로드에 실패했습니다.');
  }

  return {
    mediaId: mediaAsset.mediaId,
    mediaUrl: `media://${mediaAsset.mediaId}`,
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
