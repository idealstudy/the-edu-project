import { profileKeys } from '@/entities/profile';
import { profileApi } from '@/features/profile/api/profile.api';
import { useQuery } from '@tanstack/react-query';

// 프로필 조회
export const useProfile = (memberId?: string) =>
  useQuery({
    queryKey: profileKeys.profile(memberId),
    queryFn: () => profileApi.getProfile(memberId!),
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
    enabled: !!memberId,
  });
