import {
  type AssignExamPayload,
  type CreateExamPayload,
  type SubmitExamPayload,
  examKeys,
  repository,
} from '@/entities/exam';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUploadExamPdf = () =>
  useMutation({ mutationFn: repository.uploadExamPdf });

export const useCreateExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateExamPayload) => repository.createExam(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
};

export const useAssignExam = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      examId,
      input,
    }: {
      examId: number;
      input: AssignExamPayload;
    }) => repository.assignExam(examId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examKeys.all });
    },
  });
};

export const useSubmitExamAttempt = (attemptId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: SubmitExamPayload) =>
      repository.submitAttempt(attemptId, input),
    onSuccess: (analysis) => {
      queryClient.setQueryData(examKeys.analysis(attemptId), analysis);
      void queryClient.invalidateQueries({ queryKey: examKeys.assignedList() });
      void queryClient.invalidateQueries({
        queryKey: examKeys.attempt(attemptId),
      });
    },
  });
};

export const useAcknowledgeExamPin = (attemptId: number) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (pinId: number) => repository.acknowledgePin(attemptId, pinId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: examKeys.analysis(attemptId),
      });
    },
  });
};

export const useCreateExamPin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      attemptId,
      input,
    }: {
      attemptId: number;
      input: { treeNodeId?: number | null; comment: string };
    }) => repository.createPin(attemptId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: examKeys.teacherPins() });
    },
  });
};
