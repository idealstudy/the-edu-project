import { dto } from '@/entities/teacher/infrastructure/teacher.dto';

/**
 * 선생님 기본 정보 Domain
 */
const BasicInfoDomainSchema = dto.basicInfo.partial().required({
  name: true,
  email: true,
  isProfilePublic: true,
});

export const domain = {
  basicInfo: BasicInfoDomainSchema,
};
