import { useRouter } from 'next/navigation';

import {
  type ReviewWrongAnswerPayload,
  repository,
  wrongAnswerKeys,
} from '@/entities/wrong-answer';
import { PRIVATE, PUBLIC } from '@/shared/constants/route';
import { handleApiError } from '@/shared/lib/errors/error-handler';
import { classifyWrongAnswerError } from '@/shared/lib/errors/errors';
import { useMutation, useQueryClient } from '@tanstack/react-query';

const ERROR_REDIRECT_DELAY_MS = 1500;

export const useReviewWrongAnswer = (id: number) => {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: ReviewWrongAnswerPayload) =>
      repository.reviewWrongAnswer(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: wrongAnswerKeys.all });
    },
    onError: (error) => {
      handleApiError(error, classifyWrongAnswerError, {
        onContext: () =>
          setTimeout(
            () => router.replace(PRIVATE.DASHBOARD.WRONG_ANSWERS),
            ERROR_REDIRECT_DELAY_MS
          ),
        onAuth: () =>
          setTimeout(
            () => router.replace(PUBLIC.CORE.LOGIN),
            ERROR_REDIRECT_DELAY_MS
          ),
      });
    },
  });
};
