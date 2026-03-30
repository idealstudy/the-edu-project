import { consultationKeys, repository } from '@/entities/consultation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateConsultationAnswer(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (content: string) =>
      repository.createConsultationAnswer(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consultationKeys.detail(id) });
    },
  });
}
