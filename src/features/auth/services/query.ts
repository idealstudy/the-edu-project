import { useRouter } from 'next/navigation';

import { ROUTE } from '@/shared/constants/route';
import { useMutation } from '@tanstack/react-query';

import { useAuth } from '../hooks/use-auth';
import { authService } from './api';

export const useLoginMutation = () => {
  const router = useRouter();
  const { refreshSession } = useAuth();

  return useMutation({
    mutationFn: authService.login,
    onSuccess: async () => {
      await refreshSession();
      router.replace(ROUTE.DASHBOARD.HOME);
    },
  });
};

export const useLogoutMutation = () => {
  const router = useRouter();
  const auth = useAuth();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: async () => {
      await auth.logout();
      router.replace(ROUTE.HOME);
    },
  });
};

export const useCheckEmailDuplicate = () => {
  return useMutation({
    mutationFn: authService.checkEmailDuplicate,
  });
};

export const useSignUp = () => {
  return useMutation({
    mutationFn: authService.signUp,
  });
};

export const useVerifyCode = () => {
  return useMutation({
    mutationFn: authService.verifyCode,
  });
};
