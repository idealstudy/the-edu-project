'use client';

import {
  learningManagementKeys,
  learningManagementRepository as repository,
} from '@/entities/learning-management';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useLearningManagementQuery = (studyRoomId: number) =>
  useQuery({
    queryKey: learningManagementKeys.room(studyRoomId),
    queryFn: () => repository.get(studyRoomId),
    enabled: Number.isFinite(studyRoomId) && studyRoomId > 0,
  });

/**
 * 승인 디자인 v22 학습 관리 처리 행의 여섯 동작.
 * 각 동작은 성공 후 처리 행 목록을 다시 불러온다. 그래야 `확인함` 을 누른 행이 실제로 목록에서 내려간다.
 */
export const useLearningManagementActions = (studyRoomId: number) => {
  const queryClient = useQueryClient();
  const invalidate = async () => {
    await queryClient.invalidateQueries({
      queryKey: learningManagementKeys.room(studyRoomId),
    });
  };

  const deferTodo = useMutation({
    mutationFn: (todoId: number) => repository.deferTodo(todoId),
    onSuccess: invalidate,
  });
  const acknowledgeTodo = useMutation({
    mutationFn: (todoId: number) => repository.acknowledgeTodo(todoId),
    onSuccess: invalidate,
  });
  const approveRecommendation = useMutation({
    mutationFn: (todoId: number) => repository.approveRecommendation(todoId),
    onSuccess: invalidate,
  });
  const rejectRecommendation = useMutation({
    mutationFn: (todoId: number) => repository.rejectRecommendation(todoId),
    onSuccess: invalidate,
  });
  const acknowledgeWrongAnswer = useMutation({
    mutationFn: (wrongAnswerId: number) =>
      repository.acknowledgeWrongAnswer(wrongAnswerId),
    onSuccess: invalidate,
  });
  const acknowledgeAllWrongAnswers = useMutation({
    mutationFn: () => repository.acknowledgeAllWrongAnswers(),
    onSuccess: invalidate,
  });
  const saveComment = useMutation({
    mutationFn: ({
      wrongAnswerId,
      comment,
    }: {
      wrongAnswerId: number;
      comment: string;
    }) => repository.saveWrongAnswerComment(wrongAnswerId, comment),
    onSuccess: invalidate,
  });

  return {
    deferTodo,
    acknowledgeTodo,
    approveRecommendation,
    rejectRecommendation,
    acknowledgeWrongAnswer,
    acknowledgeAllWrongAnswers,
    saveComment,
  };
};
