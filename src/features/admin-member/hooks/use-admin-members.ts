import {
  AdminMemberListParams,
  memberKeys,
  repository,
} from '@/entities/member';
import { handleApiError } from '@/shared/lib/errors/error-handler';
import { classifyAdminMemberError } from '@/shared/lib/errors/errors';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useAdminMembers = (params: AdminMemberListParams) =>
  useQuery({
    queryKey: memberKeys.adminList(params),
    queryFn: () => repository.admin.getMembers(params),
  });

export const useAdminMember = (memberId: number) =>
  useQuery({
    queryKey: memberKeys.adminDetail(memberId),
    queryFn: () => repository.admin.getMember(memberId),
    enabled: memberId > 0,
  });

export const useRevokeAdminMember = (memberId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: { reason: string }) =>
      repository.admin.revoke(memberId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.adminLists() });
      queryClient.invalidateQueries({
        queryKey: memberKeys.adminDetail(memberId),
      });
    },
    onError: (error) => handleApiError(error, classifyAdminMemberError, {}),
  });
};

export const useRestoreAdminMember = (memberId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => repository.admin.restore(memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.adminLists() });
      queryClient.invalidateQueries({
        queryKey: memberKeys.adminDetail(memberId),
      });
    },
    onError: (error) => handleApiError(error, classifyAdminMemberError, {}),
  });
};
