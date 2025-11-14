import { useRouter } from 'next/navigation';

import {
  getCurrentMemberOptions,
  memberKeys,
  repository,
} from '@/entities/member';
import { LoginBody } from '@/features/auth/types';
import { useSession } from '@/providers';
import { authBffApi } from '@/shared/api';
import { useMemberStore } from '@/store';
import { useMutation, useQueryClient } from '@tanstack/react-query';

// 로그인
export const useLogin = () => {
  const queryClient = useQueryClient();
  const loginRequest = async (body: LoginBody) => {
    return await authBffApi.post('/api/v1/auth/login', body, {
      withCredentials: true,
    });
  };

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: async () => {
      await queryClient.fetchQuery(getCurrentMemberOptions(true));
    },
  });
};

// 로그아웃
export const useLogout = () => {
  const queryClient = useQueryClient();
  const { clearMember } = useMemberStore();
  const router = useRouter();

  return useMutation({
    mutationFn: repository.member.logout,
    // 요청 성공/실패와 무관하게 상태 정리
    onSettled: () => {
      clearMember();
      queryClient.removeQueries({ queryKey: memberKeys.info(), exact: true });
      router.replace('/');
    },
  });
};

// 인증 상태, 액션을 제공하는 허브
export const useAuth = () => {
  const { mutate: login, isPending: isLoggingIn } = useLogin();
  const { mutate: logout, isPending: isLoggingOut } = useLogout();
  const { member, refresh } = useSession();
  return { member, logout, isLoggingOut, login, isLoggingIn, refresh };
};
