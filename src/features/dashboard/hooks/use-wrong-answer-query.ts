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
