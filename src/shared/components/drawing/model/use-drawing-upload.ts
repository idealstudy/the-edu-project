import { api } from '@/shared/api';
import type { PresignBatchResponse } from '@/shared/components/editor';
import { useMutation } from '@tanstack/react-query';

import type { Stroke } from '../types';
import { exportStrokesToBlob } from '../utils/export-image';

/* ─────────────────────────────────────────────────────
 * useDrawingUpload — 드로잉 스냅샷 업로드
 *  획(Stroke[]) → PNG Blob → presign-batch → S3 PUT → media_id 반환.
 *  풀이공유(solutionType=DRAWING)의 drawingImageMediaId 확보에 사용한다.
 *  presign 흐름은 editor의 useFileUpload와 동일(공통 미디어 파이프라인).
 * ────────────────────────────────────────────────────*/

const FILE_NAME = 'solution-drawing.png';
const CONTENT_TYPE = 'image/png';

type DrawingUploadResult = {
  mediaId: string;
};

const uploadDrawing = async (strokes: Stroke[]): Promise<DrawingUploadResult> => {
  if (strokes.length === 0) {
    throw new Error('드로잉이 비어 있습니다.');
  }

  const blob = await exportStrokesToBlob(strokes);

  const presignData = await api.private.post<PresignBatchResponse>(
    '/common/media/presign-batch',
    {
      mediaAssetList: [
        {
          fileName: FILE_NAME,
          contentType: CONTENT_TYPE,
          sizeBytes: blob.size,
        },
      ],
    }
  );

  const mediaAsset = presignData.data.mediaAssetList[0];
  if (!mediaAsset) {
    throw new Error('드로잉 업로드 정보를 가져오지 못했습니다.');
  }

  const uploadResponse = await fetch(mediaAsset.uploadUrl, {
    method: 'PUT',
    headers: mediaAsset.headers,
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error('드로잉 업로드에 실패했습니다.');
  }

  return { mediaId: mediaAsset.mediaId };
};

export const useDrawingUpload = () => {
  const mutation = useMutation({
    mutationFn: (strokes: Stroke[]) => uploadDrawing(strokes),
  });

  return {
    uploadDrawingAsync: mutation.mutateAsync,
    isUploading: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
};
