import { useMutation } from '@tanstack/react-query';

import { authService } from './api';

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
