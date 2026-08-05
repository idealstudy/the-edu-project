import { MemberDTO } from '@/entities/member';
import { api } from '@/shared/api';
import { CommonResponse } from '@/types/http';
import axios from 'axios';
import { z } from 'zod';

import { factory } from '../core/member.factory';
import { adapters } from './member.adapters';
import { dto } from './member.dto.schema';

export type AdminMemberListParams = {
  role: 'STUDENT' | 'TEACHER' | 'PARENT';
  keyword?: string;
  includeQaAccount: boolean;
  page: number;
  size: number;
};

export type AdminMemberList = ReturnType<typeof dto.adminList.parse>;

/* ─────────────────────────────────────────────────────
 * [Read] 현재 로그인된 사용자 정보를 BFF를 통해 조회
 * useAuth의 useQuery에서 queryFn로 사용
 * ────────────────────────────────────────────────────*/
const getCurrentMember = async (): Promise<MemberDTO | null> => {
  try {
    const response = await api.bff.client.get<CommonResponse<MemberDTO>>(
      '/api/v1/member/info'
    );
    const validatedResponse = adapters.fromApi.parse(response);
    return factory.member.create(validatedResponse.data);
  } catch (error: unknown) {
    if (!axios.isAxiosError(error)) throw error;
    if (!error.response) throw error;

    const status = error.response.status;
    if (status === 401 || status === 403) return null;
    throw error;
  }
};

/* ─────────────────────────────────────────────────────
 * [Delete Session] 로그아웃 요청을 수행(HttpOnly 쿠키 만료 목적)
 * useAuth의 useLogout에서 mutationFn으로 사용
 * ────────────────────────────────────────────────────*/
const logout = async (): Promise<void> => {
  return api.bff.client.post('/api/v1/auth/logout', undefined, {
    withCredentials: true,
  });
};

/* ─────────────────────────────────────────────────────
 * [DELETE] 회원 탈퇴
 * 소프트 딜리트
 * ────────────────────────────────────────────────────*/
const withdraw = async (): Promise<void> => {
  await api.private.delete('/members');
};

const getAdminMembers = async (
  params: AdminMemberListParams
): Promise<AdminMemberList> => {
  const response = await api.private.get('/admin/members', { params });
  return dto.adminListResponse.parse(response).data;
};

const impersonate = async (memberId: number): Promise<void> => {
  const validatedMemberId = z.number().int().positive().parse(memberId);
  await api.private.post(`/admin/auth/impersonate/${validatedMemberId}`);
};

const exitImpersonation = async (): Promise<void> => {
  await api.private.post('/admin/auth/impersonate/exit');
};

/* ─────────────────────────────────────────────────────
 * 내보내기
 * ────────────────────────────────────────────────────*/
export const repository = {
  member: {
    getMember: getCurrentMember,
    logout: logout,
    withdraw,
  },
  admin: {
    getMembers: getAdminMembers,
    impersonate,
    exitImpersonation,
  },
};
