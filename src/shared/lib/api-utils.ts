import { sharedSchema } from '@/types';
import { ZodType, z } from 'zod';

/**
 * API 응답에서 envelope를 벗기고 data를 추출
 */
export const unwrapEnvelope = <T>(
  response: unknown,
  dataSchema: ZodType<T>
): T => {
  // sharedSchema.response로 envelope 스키마 생성
  const envelopeSchema = sharedSchema.response(dataSchema);

  const schema = z.union([dataSchema, envelopeSchema]).transform((val) => {
    // envelope 형태면 data 추출
    if (val && typeof val === 'object' && 'data' in val) {
      const { status, message, data } = val;

      if (status < 200 || status >= 300) {
        throw new Error(message || `요청 실패 (status: ${status})`);
      }

      return data;
    }

    // envelope 없으면 그대로 반환
    return val;
  });

  return schema.parse(response) as T;
};
