import { z } from 'zod';

/**
 * 선생님 기본 정보 Domain 스키마
 */
const BasicInfoDomainSchema = z.object({
  name: z.string(),
  email: z.string(),
  isProfilePublic: z.boolean(),
  simpleIntroduction: z.string(),
  role: z.literal('ROLE_TEACHER'),
  profilePublicKorean: z.enum(['공개', '비공개']),
});

/**
 * 내보내기
 */
export const domain = {
  basicInfo: BasicInfoDomainSchema,
};
