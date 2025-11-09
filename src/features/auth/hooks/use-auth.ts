import { authService } from '@/features/auth/services/api';
import { memberKeys } from '@/features/member/api/keys';
import { useSession } from '@/providers';
import { useAuthStore } from '@/store/session-store';
import { useQueryClient } from '@tanstack/react-query';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { user, clearUser } = useAuthStore();
  const { refresh } = useSession();

  const refreshSession = async () => {
    const member = await refresh();
    if (!member) throw new Error('세션 정보를 불러오지 못했습니다.');
    queryClient.setQueryData(memberKeys.info(), member);
    return member;
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

  return { user, logout, refreshSession };
};
