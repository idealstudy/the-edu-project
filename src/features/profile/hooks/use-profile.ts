import { profileKeys } from '@/entities/profile';
import { profileApi } from '@/features/profile/api/profile.api';
import { useQuery } from '@tanstack/react-query';

// 내 프로필 조회
export const useMyProfile = () =>
  useQuery({
    queryKey: profileKeys.myProfile(),
    queryFn: profileApi.getMyProfile,
    staleTime: Infinity,
    gcTime: 30 * 60 * 1000,
  });
