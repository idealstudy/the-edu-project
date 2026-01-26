import { profileKeys, repository } from '@/entities/profile';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// 프로필 조회
export const useProfile = (memberId?: string) =>
  useQuery({
    queryKey: profileKeys.profile(memberId),
    queryFn: () => repository.profile.getProfile(memberId!),
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    enabled: !!memberId,
  });

// 이름 변경
export const useUpdateUserName = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => repository.profile.updateUserName(name),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: profileKeys.all,
      });
    },
  });
};
