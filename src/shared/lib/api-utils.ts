import { sharedSchema } from '@/types';
import { z } from 'zod';

/**
 * API 응답에서 envelope를 벗기고 data를 추출
 */
export const unwrapEnvelope = <Schema extends z.ZodTypeAny>(
  response: unknown,
  dataSchema: Schema
): z.output<Schema> => {
  // sharedSchema.response로 envelope 스키마 생성
  const envelopeSchema = sharedSchema.response(dataSchema);

  // envelopeSchema 를 먼저 시도한다. dataSchema 를 먼저 두면, 모든 필드가 optional 인
  // 스키마(예: SolutionViewCost·Wallet)가 envelope 객체({status,message,data})에도
  // "성공" 매칭되어 전부 default 값으로 떨어지는 버그가 있다. envelope 는 status(필수)가
  // 있어야 매칭되므로, 비-envelope 원시 데이터는 자연히 dataSchema 로 폴백된다.
  const schema = z
    .union([envelopeSchema, dataSchema])
    .transform((val): z.output<Schema> => {
      // envelope 형태면 data 추출
      if (val && typeof val === 'object' && 'data' in val) {
        const { status, message, data } = val;

        if (status < 200 || status >= 300) {
          throw new Error(message || `요청 실패 (status: ${status})`);
        }

        return data as z.output<Schema>;
      }

      // envelope 없으면 그대로 반환
      return val as z.output<Schema>;
    });

  return schema.parse(response);
};
