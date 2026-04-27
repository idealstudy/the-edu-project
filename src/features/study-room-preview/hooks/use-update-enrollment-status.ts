import { studyRoomRepository } from '@/entities/study-room';
import { previewKeys } from '@/entities/study-room-preview';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const useUpdateEnrollmentStatus = (
  teacherId: number,
  studyRoomId: number
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: 'OPEN' | 'OPERATING') =>
      studyRoomRepository.teacher.updateEnrollmentStatus(studyRoomId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: previewKeys.side(teacherId, studyRoomId),
      });
    },
  });
};
