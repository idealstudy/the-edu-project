import { examKeys, repository } from '@/entities/exam';
import { useQuery } from '@tanstack/react-query';

export const useAssignedExamsQuery = () =>
  useQuery({
    queryKey: examKeys.assignedList(),
    queryFn: repository.getAssignedExams,
  });

export const useExamAttemptQuery = (
  attemptId: number,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: examKeys.attempt(attemptId),
    queryFn: () => repository.getAttempt(attemptId),
    enabled: (options?.enabled ?? true) && attemptId > 0,
  });

export const useExamAnalysisQuery = (
  attemptId: number,
  options?: { enabled?: boolean }
) =>
  useQuery({
    queryKey: examKeys.analysis(attemptId),
    queryFn: () => repository.getAnalysis(attemptId),
    enabled: (options?.enabled ?? true) && attemptId > 0,
  });

export const useTeacherExamsQuery = () =>
  useQuery({
    queryKey: examKeys.teacherList(),
    queryFn: repository.getTeacherExams,
  });

export const useParentGradeSummaryQuery = (
  childId: number | null,
  options?: { enabled?: boolean }
) => {
  const validChildId =
    typeof childId === 'number' && Number.isInteger(childId) && childId > 0;
  return useQuery({
    queryKey: examKeys.parentSummary(childId ?? 0),
    queryFn: () => repository.getParentSummary(childId as number),
    enabled: (options?.enabled ?? true) && validChildId,
  });
};
