import { useRouter } from 'next/navigation';

import { memberKeys, repository } from '@/entities/member';
import { handleApiError } from '@/shared/lib/errors/error-handler';
import { classifyAdminMemberError } from '@/shared/lib/errors/errors';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';

import { IMPERSONATION_STORAGE_KEY } from '../model/storage';

const ERROR_REDIRECT_DELAY_MS = 1500;

const impersonationTargetSchema = z.object({
  memberId: z.number().int().positive(),
  name: z.string().min(1),
});

export const useImpersonateMember = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (target: z.infer<typeof impersonationTargetSchema>) => {
      const validated = impersonationTargetSchema.parse(target);
      await repository.admin.impersonate(validated.memberId);
      return validated;
    },
    onSuccess: (target) => {
      queryClient.invalidateQueries({ queryKey: memberKeys.all });
      window.sessionStorage.setItem(
        IMPERSONATION_STORAGE_KEY,
        JSON.stringify(target)
      );
      window.location.assign('/dashboard');
    },
    onError: (error) => {
      handleApiError(error, classifyAdminMemberError, {
        onContext: () =>
          queryClient.invalidateQueries({ queryKey: memberKeys.adminLists() }),
        onAuth: () =>
          setTimeout(() => router.replace('/login'), ERROR_REDIRECT_DELAY_MS),
      });
    },
  });
};

export const useExitImpersonation = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: repository.admin.exitImpersonation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: memberKeys.all });
      queryClient.clear();
      window.sessionStorage.removeItem(IMPERSONATION_STORAGE_KEY);
      window.location.assign('/admin/members');
    },
    onError: (error) => {
      handleApiError(error, classifyAdminMemberError, {
        onContext: () => {
          window.sessionStorage.removeItem(IMPERSONATION_STORAGE_KEY);
          setTimeout(() => router.replace('/login'), ERROR_REDIRECT_DELAY_MS);
        },
        onAuth: () =>
          setTimeout(() => router.replace('/login'), ERROR_REDIRECT_DELAY_MS),
      });
    },
  });
};
