import { Member, memberRepository } from '@/entities/member';
import { memberKeys } from '@/entities/member/keys';
import { queryOptions, useQuery } from '@tanstack/react-query';

const FIVE_MINUTES = 1000 * 60 * 5;

export const getCurrentMemberOptions = (initialHasSession: boolean) =>
  queryOptions<Member | null>({
    queryKey: memberKeys.info(),
    queryFn: memberRepository.getCurrentMember,
    staleTime: FIVE_MINUTES,
    retry: false,
    enabled: initialHasSession,
  });

export const useCoreCurrentMember = (initialHasSession: boolean) => {
  return useQuery(getCurrentMemberOptions(initialHasSession));
};

export const useCoreCurrentMemberActions = () => {
  return useQuery(getCurrentMemberOptions(true));
};
