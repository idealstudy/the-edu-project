import { authService } from '@/features/auth/services/api';
import { memberKeys } from '@/features/member/api/keys';
import { useSession } from '@/providers';
import { useAuthStore } from '@/store/session-store';
import { useQueryClient } from '@tanstack/react-query';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { user, clearUser } = useAuthStore();
  const { refresh } = useSession();

  const fetchSession = async () => {
    const member = await refresh();
    if (!member) throw new Error('세션 정보를 불러오지 못했습니다.');
    return member;
  };

  const login = async (form?: { email: string; password: string }) => {
    if (form) await authService.login(form);
    return fetchSession();
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      clearUser();
      queryClient.removeQueries({ queryKey: memberKeys.info(), exact: true });
      await refresh();
    }
  };

  return { user, login, logout, fetchSession };
};
