import { domain } from '@/entities/teacher/core';
import {
  FrontendTeacherBasicInfo,
  TeacherBasicInfoDTO,
  UpdateTeacherBasicInfoPayload,
} from '@/entities/teacher/types';
import { api } from '@/shared/api';
import { unwrapEnvelope } from '@/shared/lib/api-utils';
import { CommonResponse } from '@/types';

import { dto, payload } from './teacher.dto';

/**
 * isProfilePublic -> 한글 변환 헬퍼
 */
const getProfilePublicKorean = (isPublic: boolean): '공개' | '비공개' =>
  isPublic ? '공개' : '비공개';

/**
 * DTO를 Domain 객체로 변환
 */
const transformBasicInfoToFrontend = (
  basicInfoDto: TeacherBasicInfoDTO
): FrontendTeacherBasicInfo =>
  domain.basicInfo.parse({
    name: basicInfoDto.name,
    email: basicInfoDto.email,
    isProfilePublic: basicInfoDto.isProfilePublic,
    simpleIntroduction: basicInfoDto.simpleIntroduction,
    role: 'ROLE_TEACHER' as const,
    profilePublicKorean: getProfilePublicKorean(basicInfoDto.isProfilePublic),
  });

/**
 * [Read] 선생님 기본 정보 조회
 */
const getBasicInfo = async (): Promise<FrontendTeacherBasicInfo> => {
  const response = await api.private.get<CommonResponse<TeacherBasicInfoDTO>>(
    '/teacher/me/basic-info'
  );

  const basicInfoDto = unwrapEnvelope(response, dto.basicInfo);

  return transformBasicInfoToFrontend(basicInfoDto);
};

/**
 * [Update] 선생님 기본 정보 변경
 */
const updateBasicInfo = async (
  basicInfo: UpdateTeacherBasicInfoPayload
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
