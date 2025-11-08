import { queryOptions } from '@tanstack/react-query';

import { memberKeys } from './keys';
import { fetchMemberInfo } from './requests';

export const getMemberInfoOptions = () =>
  queryOptions({
    queryKey: memberKeys.info(),
    queryFn: fetchMemberInfo,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    retry: false,
  });
