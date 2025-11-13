import { MemberDTO } from '@/entities/member';
import { authApi, authBffApi } from '@/shared/api';
import { CommonResponse } from '@/types/http';
import axios from 'axios';

import { MemberFactory } from '../core/member.factory';

export const memberRepository = {
  /**
   * [Read] 현재 로그인된 사용자 정보를 BFF를 통해 조회
   * useAuth의 useQuery에서 queryFn로 사용
   */
  async getCurrentMember(): Promise<MemberDTO | null> {
    try {
      const response = await authBffApi.get<CommonResponse<MemberDTO>>(
        '/api/v1/member/info'
      );
      // console.log('raw keys:', Object.keys(response));
      // console.log('member data:', response.data);
      return MemberFactory.createFrontendMember(response.data);
    } catch (error: unknown) {
      if (!axios.isAxiosError(error)) throw error;

      if (!error.response) throw error;

      const status = error.response.status;
      if (status === 401 || status === 403) return null;
      throw error;
    }
  },

  /**
   * [Delete Session] 로그아웃 요청을 수행(HttpOnly 쿠키 만료 목적)
   * useAuth의 useLogout에서 mutationFn으로 사용
   */
  async logout(): Promise<void> {
    return authApi.post('/auth/logout');
  },
};
