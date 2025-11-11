import { authService } from '@/features/auth/services/api';
import { memberKeys } from '@/features/member/api/keys';
import { useAuthStore } from '@/shared/store/session-store';
import { useQuery } from '@tanstack/react-query';

export function useMe(options?: { enabled?: boolean }) {
  const setUser = useAuthStore((s) => s.setUser);
  return useQuery({
    queryKey: memberKeys.info(),
    queryFn: async () => {
      const me = await authService.getSession();
      setUser(me);
      return me;
    },
    staleTime: 5 * 60 * 1000,
    enabled: options?.enabled ?? false,
  });
}
