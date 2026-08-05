import {
  AdminMemberListParams,
  memberKeys,
  repository,
} from '@/entities/member';
import { useQuery } from '@tanstack/react-query';

export const useAdminMembers = (params: AdminMemberListParams) =>
  useQuery({
    queryKey: memberKeys.adminList(params),
    queryFn: () => repository.admin.getMembers(params),
  });
