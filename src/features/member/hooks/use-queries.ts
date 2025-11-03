import { memberKeys } from '@/features/member/api/keys';
import { getMemberInfoOptions } from '@/features/member/api/options';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useMemberInfo = (enabled?: boolean) => {
  const queryClient = useQueryClient();
  return useQuery({
    ...getMemberInfoOptions(),
    enabled: enabled ?? true,
    initialData: () => queryClient.getQueryData(memberKeys.info()),
  });
};
