import { queryKey } from '@/constants/query-key';
import { getLocalSession } from '@/features/auth/services/session';
import type { Session } from '@/features/auth/type';
import { useQuery, useQueryClient } from '@tanstack/react-query';

/**
 * [TODO 임시 버전]
 * Access Token을 직접 디코딩하여 세션 정보를 복원합니다.
 *
 * 주의: 현재 백엔드에서 사용자 정보 불러오기 API가 제공되지 않아 임시로 JWT를 해석합니다.
 * 배포 시 AccessToken이 HttpOnly로 변경되면 이 방식은 동작하지 않습니다.
 * 이후 API 기반 세션 복원(getSession)으로 교체 예정입니다.
 */
export const useRole = () => {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: queryKey.session,
    queryFn: getLocalSession,
    initialData: () => qc.getQueryData<Session>(queryKey.session),
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: false,
  });

  return { role: data?.auth, isLoading };
};
