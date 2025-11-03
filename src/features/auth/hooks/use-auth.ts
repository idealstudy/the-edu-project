import { authService } from '@/features/auth/services/api';
import { memberKeys } from '@/features/member/api/keys';
import { useAuthStore } from '@/store/session-store';
import { useQueryClient } from '@tanstack/react-query';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { user, setUser, clearUser } = useAuthStore();

  const fetchSession = async () => {
    const member = await authService.getSession();
    setUser(member);
    queryClient.setQueryData(memberKeys.info(), member);
    return member;
  };

  const login = async (form?: { email: string; password: string }) => {
    if (form) await authService.login(form);
    return fetchSession();
  };

  const logout = async () => {
    // NOTE: 로그아웃 시 세션 캐시 초기화 및 무효화
    clearUser();
    queryClient.removeQueries({ queryKey: memberKeys.info(), exact: true });
  };

  return { user, login, logout, fetchSession };
};
