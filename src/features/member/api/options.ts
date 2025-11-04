import { MEMBER_QUERY_STALE_TIME } from '@/features/member/model/constants';
import { queryOptions } from '@tanstack/react-query';

import { memberKeys } from './keys';
import { fetchMemberInfo } from './requests';

export const getMemberInfoOptions = () =>
  queryOptions({
    queryKey: memberKeys.info(),
    queryFn: fetchMemberInfo,
    staleTime: MEMBER_QUERY_STALE_TIME,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });
