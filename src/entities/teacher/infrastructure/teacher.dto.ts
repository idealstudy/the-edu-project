import { z } from 'zod';

/**
 * 선생님 기본 정보 DTO
 */
const BasicInfoDtoSchema = z.object({
  name: z.string(),
  email: z.string(),
  isProfilePublic: z.boolean(),
  simpleIntroduction: z.string(),
});

/**
 * 선생님 기본 정보 Payload
 */
export const UpdateBasicInfoPayloadSchema = z.object({
  name: z.string(),
  isProfilePublic: z.boolean(),
  simpleIntroduction: z.string(),
});

/**
 * 내보내기
 */
export const dto = {
  basicInfo: BasicInfoDtoSchema,
};

export const payload = {
  updateBasicInfo: UpdateBasicInfoPayloadSchema,
};
