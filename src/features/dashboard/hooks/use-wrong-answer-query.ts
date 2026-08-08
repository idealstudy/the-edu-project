import { repository, wrongAnswerKeys } from '@/entities/wrong-answer';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useDailyProblemsQuery = (date?: string) =>
  useQuery({
    queryKey: wrongAnswerKeys.dailyProblems(date),
    queryFn: () => repository.getDailyProblems(date),
  });

export const useWrongAnswersQuery = (nodeId?: number) =>
  useQuery({
    queryKey: wrongAnswerKeys.list(nodeId),
    queryFn: () => repository.getWrongAnswers(nodeId),
  });

/** v22 `sReviewOk` 3219 `질문 남기기` */
export const useAskTeacherOnWrongAnswer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, question }: { id: number; question: string }) =>
      repository.askTeacher(id, question),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: wrongAnswerKeys.all });
    },
  });
};

export const useTeacherWrongAnswerInboxQuery = () =>
  useQuery({
    queryKey: wrongAnswerKeys.teacherInbox(),
    queryFn: repository.getTeacherInbox,
  });

export const useSaveTeacherWrongAnswerComment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: number; comment: string }) =>
      repository.saveTeacherComment(id, comment),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: wrongAnswerKeys.teacherInbox(),
      });
    },
  });
};
