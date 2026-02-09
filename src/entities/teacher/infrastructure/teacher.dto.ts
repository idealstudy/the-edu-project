import { z } from 'zod';

/**
 * 선생님 기본 정보 DTO
 */
const BasicInfoDtoSchema = z.object({
  name: z.string(),
  email: z.string(),
  isProfilePublic: z.boolean(),
  simpleIntroduction: z.string().nullable(),
});

export const dto = {
  basicInfo: BasicInfoDtoSchema,
};
