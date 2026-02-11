import { domain } from '@/entities/teacher/core/teacher.domain';
import { dto, payload } from '@/entities/teacher/infrastructure/teacher.dto';
import {
  BasicInfoDTO,
  FrontendBasicInfo,
  UpdateBasicInfoPayload,
} from '@/entities/teacher/types';
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

/**
 * [Update] 선생님 기본 정보 변경
 */
const updateBasicInfo = async (
  basicInfo: UpdateBasicInfoPayload
): Promise<void> => {
  const validated = payload.updateBasicInfo.parse(basicInfo);
  await api.private.patch('/teacher/me/basic-info', validated);
};

/**
 * export
 */
export const repository = {
  basicInfo: {
    getBasicInfo,
    updateBasicInfo,
  },
};
