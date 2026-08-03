import {
  type CreateTodoPayload,
  type UpdateTodoPayload,
  repository,
  todoKeys,
} from '@/entities/todo';
import { handleApiError } from '@/shared/lib/errors/error-handler';
import { classifyTodoError } from '@/shared/lib/errors/errors';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useStudentTodosQuery = (weekOf?: string) =>
  useQuery({
    queryKey: todoKeys.weekly(weekOf),
    queryFn: () => repository.getWeekly(weekOf),
  });

export const useCreateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTodoPayload) => repository.create(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
};

export const useUpdateTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateTodoPayload }) =>
      repository.update(id, input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
};

export const useDeleteTodo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => repository.remove(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
    onError: (error) => {
      handleApiError(error, classifyTodoError, {});
    },
  });
};

export const useTeacherTodoRecommendationsQuery = () =>
  useQuery({
    queryKey: [...todoKeys.all, 'teacher-recommendations'],
    queryFn: repository.getTeacherRecommendations,
  });

export const useApproveTodoRecommendation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => repository.approveRecommendation(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: todoKeys.all });
    },
  });
};
