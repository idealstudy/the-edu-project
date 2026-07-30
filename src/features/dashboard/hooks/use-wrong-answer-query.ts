import { repository, wrongAnswerKeys } from '@/entities/wrong-answer';
import { useQuery } from '@tanstack/react-query';

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
