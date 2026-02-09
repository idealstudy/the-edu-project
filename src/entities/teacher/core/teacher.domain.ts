import { dto } from '@/entities/teacher/infrastructure/teacher.dto';

/**
 * isProfilePublic -> 한글 변환 매핑
 */
const PROFILE_PUBLIC_TO_KOREAN = {
  true: '공개',
  false: '비공개',
};

const getProfilePublicKorean = (isPublic: boolean) =>
  PROFILE_PUBLIC_TO_KOREAN[String(isPublic) as 'true' | 'false'];

/**
 * DTO 스키마를 Domain 스키마로 변환
 */
const BasicInfoDomainShape = dto.basicInfo.partial().required({
  name: true,
  email: true,
  isProfilePublic: true,
});

/**
 * Domain 스키마 (비즈니스 로직 포함)
 */
const BasicInfoDomainSchema = BasicInfoDomainShape.transform((basicInfo) => ({
  ...basicInfo,
  role: 'ROLE_TEACHER',
  profilePublicKorean: getProfilePublicKorean(basicInfo.isProfilePublic),
}));

export const domain = {
  basicInfo: BasicInfoDomainSchema,
};
