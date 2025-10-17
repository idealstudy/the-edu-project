import { queryKey } from '@/constants/query-key';
import { getSession } from '@/features/auth/services/session';
import { Role } from '@/features/auth/type';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useRole = () => {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKey.session,
    queryFn: getSession,
    initialData: () => qc.getQueryData<{ auth: Role }>(['session']),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });

  return { role: data?.auth, isLoading };
};
