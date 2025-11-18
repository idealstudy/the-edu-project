import { memberKeys } from '@/entities/member';
import { queryOptions } from '@tanstack/react-query';

import { fetchMemberInfo } from './member.api';

export const getMemberInfoOptions = () =>
  queryOptions({
    queryKey: memberKeys.info(),
    queryFn: fetchMemberInfo,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });
