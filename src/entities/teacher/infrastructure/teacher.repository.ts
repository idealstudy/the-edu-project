import { domain } from '@/entities/teacher/core/teacher.domain';
import { dto } from '@/entities/teacher/infrastructure/teacher.dto';
import { BasicInfoDTO, FrontendBasicInfo } from '@/entities/teacher/types';
import { api } from '@/shared/api';
import { unwrapEnvelope } from '@/shared/lib/api-utils';
import { CommonResponse } from '@/types';

/**
 * [Read] 선생님 기본 정보 조회
 */
const getBasicInfo = async (): Promise<FrontendBasicInfo> => {
  const response = await api.private.get<CommonResponse<BasicInfoDTO>>(
    '/teacher/me/basic-info'
  );

  const basicInfoDto = unwrapEnvelope(response, dto.basicInfo);

  return domain.basicInfo.parse(basicInfoDto);
};

export const repository = {
  basicInfo: {
    getBasicInfo,
  },
};
