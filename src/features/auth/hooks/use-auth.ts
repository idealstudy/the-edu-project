import { authService } from '@/features/auth/services/api';
import { memberKeys } from '@/features/member/api/keys';
import { useAuthStore } from '@/store/session-store';
import { useQueryClient } from '@tanstack/react-query';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { user, setUser, isAuthenticated } = useAuthStore();

  const fetchSession = async () => {
    // 쿠키 기반 세션 정보 가져오기
    const me = await authService.getSession(); // { id, email, role }
    // (선택) 여기서 zod로 검증
    setUser(me);
    // React Query 캐시에도 넣어두면 재요청 줄임
    queryClient.setQueryData(['me'], me);
    return me;
  };

  const login = async (form?: { email: string; password: string }) => {
    if (form) await authService.login(form); // 쿠키 세팅 (응답 바디 없음)

    return fetchSession();
  };

  const logout = async () => {
    // NOTE: 로그아웃 시 세션 캐시 초기화 및 무효화
    queryClient.setQueryData(memberKeys.info(), null);
    await queryClient.invalidateQueries({ queryKey: memberKeys.info() });
  };

  return { user, isAuthenticated, login, logout, fetchSession };
};
